
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo } from 'react';
import type { Locale } from 'date-fns';
import { format, addMonths, subMonths, getYear, getMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, CalendarDays as CalendarIconLucide, CheckSquare, Loader2, Droplet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import type { DailyEntryData, MoonPhaseData, GeneratedImpulse, CycleInfo } from '@/lib/types';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { generateCycleImpulse, type GenerateCycleImpulseInput } from '@/ai/flows/generate-cycle-impulse';
import { toast } from '@/hooks/use-toast';

const MOCK_DB_LATENCY = 500; // ms

async function saveDailyEntryToFirestore(userId: string, entry: DailyEntryData): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Saving entry for user ${userId}, date ${entry.date}:`, entry);
  const existingEntries = JSON.parse(localStorage.getItem(`firestoreMock_entries_${userId}`) || '{}');
  existingEntries[entry.date] = entry;
  localStorage.setItem(`firestoreMock_entries_${userId}`, JSON.stringify(existingEntries));
}

async function fetchDailyEntriesForMonthRange(userId: string, startDate: Date, endDate: Date): Promise<Map<string, DailyEntryData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Fetching entries for user ${userId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  const storedEntries = JSON.parse(localStorage.getItem(`firestoreMock_entries_${userId}`) || '{}');
  const entriesMap = new Map<string, DailyEntryData>();
  
  Object.keys(storedEntries).forEach(dateKey => {
    const entryDate = parseISO(dateKey);
    if (entryDate >= startDate && entryDate <= endDate) {
      entriesMap.set(dateKey, storedEntries[dateKey]);
    }
  });
  return entriesMap;
}

// --- Mock Moon Phase Data Generation ---
const moonPhaseEmojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const moonPhaseNames = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

async function fetchMoonDataForDateRange(startDate: Date, endDate: Date): Promise<Map<string, MoonPhaseData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY / 2));
  const moonDataMap = new Map<string, MoonPhaseData>();
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayOfMonth = currentDate.getDate();
    const month = currentDate.getMonth();
    // Simple cyclical mock data, not astronomically accurate
    const phaseIndex = (dayOfMonth - 1 + month * 5 + currentDate.getFullYear()) % moonPhaseEmojis.length;
    moonDataMap.set(dateKey, {
      emoji: moonPhaseEmojis[phaseIndex],
      phaseName: moonPhaseNames[phaseIndex],
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return moonDataMap;
}


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();

  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | undefined>(undefined);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('month');

  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const [entriesMap, setEntriesMap] = useState<Map<string, DailyEntryData>>(new Map());
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const [moonDataMap, setMoonDataMap] = useState<Map<string, MoonPhaseData>>(new Map());
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!user) return;

    const year = getYear(currentDisplayMonth);
    const month = getMonth(currentDisplayMonth);

    // Determine the date range for fetching data (current month + padding for outside days)
    // For react-day-picker with showOutsideDays, it shows 6 weeks.
    // Start of the first week shown, end of the last week shown.
    // This is a bit complex to calculate precisely without knowing RDP internal.
    // A simpler approach for fetching: current month +/- 1 month for padding outside days.
    const fetchStartDate = subMonths(new Date(year, month, 1), 1);
    const fetchEndDate = addMonths(new Date(year, month + 1, 0), 1);


    const loadData = async () => {
      setIsLoadingEntries(true);
      setIsLoadingMoonData(true);
      try {
        const [fetchedEntries, fetchedMoonData] = await Promise.all([
          fetchDailyEntriesForMonthRange(user.id, fetchStartDate, fetchEndDate),
          fetchMoonDataForDateRange(fetchStartDate, fetchEndDate)
        ]);
        setEntriesMap(fetchedEntries);
        setMoonDataMap(fetchedMoonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingEntries(false);
        setIsLoadingMoonData(false);
      }
    };
    loadData();
  }, [currentDisplayMonth, user]);


  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = userPreferences.language === 'de' ? 'de-DE' : 'en-US';
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const todayModifier: Modifier = { date: today, disabled: false };

  const handleTodayClick = () => {
    const newToday = new Date();
    setCurrentDisplayMonth(newToday);
  };

  const handleDayClick = (date: Date | undefined, modifiers: any, e: React.MouseEvent) => {
    if (!date || modifiers.disabled) return;
    setSelectedDateForDialog(date);
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = async (entryData: DailyEntryData) => {
    if (!user) return;
    try {
      await saveDailyEntryToFirestore(user.id, entryData);
      const newEntriesMap = new Map(entriesMap).set(entryData.date, entryData);
      setEntriesMap(newEntriesMap);
      
      // Calculate Cycle Info
      const allEntriesArray = Array.from(newEntriesMap.values());
      const cycleInfo = calculateCycleInfo(entryData.date, allEntriesArray);
      
      // Get Moon Phase
      const moonPhase = moonDataMap.get(entryData.date)?.phaseName || "Unknown";

      // Generate AI Impulse
      if (userPreferences.appMode === 'cycle') { // Only generate for cycle mode
        const impulseInput: GenerateCycleImpulseInput = {
          cyclePhase: cycleInfo.phase,
          cycleDay: cycleInfo.cycleDay,
          moonPhaseName: moonPhase,
          userMood: entryData.mood,
          userEnergyLevel: entryData.energyLevel,
          userNotes: entryData.notes,
        };
        try {
          const impulseResult = await generateCycleImpulse(impulseInput);
          const newImpulse: GeneratedImpulse = {
            date: entryData.date,
            text: impulseResult.impulseText,
            cyclePhase: cycleInfo.phase,
            moonPhase: moonPhase,
          };
          // Store in localStorage for Dashboard to pick up
          localStorage.setItem('myLunaraCycle-latestImpulse', JSON.stringify(newImpulse));
          toast({ title: t('newImpulseGenerated') });
        } catch (aiError) {
          console.error("Error generating AI impulse:", aiError);
          toast({ title: "AI Impulse Error", description: "Could not generate impulse.", variant: "destructive" });
        }
      }


      setIsEntryDialogOpen(false);
      setSelectedDateForDialog(undefined);
      // toast({ title: t('entrySaved'), description: format(parseISO(entryData.date), 'PPP', { locale: userPreferences.language === 'de' ? de : enUS }) });
    } catch (error) {
      console.error("Error saving entry:", error);
      // toast({ title: t('errorSavingEntry'), variant: 'destructive' });
    }
  };

  const handleCloseDialog = () => {
    setIsEntryDialogOpen(false);
    setSelectedDateForDialog(undefined);
  };

  const renderCalendarView = () => {
    if (isLoadingEntries || (isLoadingMoonData && userPreferences.appMode === 'cycle') ) { // Moon data only critical for cycle mode impulse
       return (
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>{t('loadingData')}</p>
        </div>
      );
    }
    
    switch (viewMode) {
      case 'month':
        return (
          <Calendar
            mode="single"
            month={currentDisplayMonth}
            onMonthChange={setCurrentDisplayMonth}
            onDayClick={handleDayClick}
            className="w-full flex-grow flex flex-col p-0 border-0 rounded-none shadow-none"
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            showOutsideDays={true}
            weekStartsOn={1} 
            classNames={{
              root: "flex flex-col flex-grow w-full h-full", 
              months: "flex flex-col sm:flex-row flex-grow h-full",
              month: "space-y-0 flex flex-col flex-grow h-full p-0", 
              caption_layout: 'flex items-center justify-between py-2 px-1 md:px-2 relative border-b',
              caption: "flex items-center gap-1", 
              caption_label: "text-lg font-semibold text-foreground text-center flex-grow justify-start",
              nav_container: "flex items-center gap-1",
              nav_button: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 hover:bg-accent/50"),
              table: "w-full border-collapse mt-0 flex-grow grid grid-rows-[auto_repeat(6,minmax(0,1fr))] border-t border-l border-border h-full", 
              head_row: "flex border-b border-border",
              head_cell: cn("text-muted-foreground font-normal text-[0.70rem] flex items-center justify-center uppercase py-2 w-[calc(100%/7)] h-10 border-r border-border", "sm:text-xs"),
              row: "flex w-full border-b border-border last:border-b-0", 
              cell: cn("text-sm p-1 relative border-r border-border text-right flex flex-col items-end justify-start min-h-[7rem] md:min-h-[9rem]", "focus-within:relative focus-within:z-10 w-[calc(100%/7)]"),
              day: cn(buttonVariants({ variant: "ghost" }), "h-full w-full p-1 font-normal flex flex-col items-start justify-start focus:z-10 rounded-none text-left hover:bg-accent/10"),
              day_today: "", 
              day_outside: "text-muted-foreground/70",
              day_disabled: "text-muted-foreground opacity-40 pointer-events-none",
              day_hidden: "invisible",
            }}
            components={{
              Caption: ({ displayMonth }) => (
                <div className="flex items-center justify-between py-2 px-2 md:px-4 border-b border-border h-14">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleTodayClick} className="text-sm h-9">
                      {t('today')} 
                    </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => subMonths(prev, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                     </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => addMonths(prev, 1))}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                     <h2 className="text-xl font-medium text-foreground ml-3">
                        {format(displayMonth, 'MMMM yyyy', { locale: userPreferences.language === 'de' ? (require('date-fns/locale/de') as any).default : (require('date-fns/locale/en-US') as any).default })}
                     </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Search className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><HelpCircle className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="h-5 w-5"/></Button>
                    <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day' | 'year')}>
                      <SelectTrigger className="w-[110px] h-9 text-sm focus:ring-0">
                        <SelectValue placeholder={t('view')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">{t('dayView')}</SelectItem>
                        <SelectItem value="week">{t('weekView')}</SelectItem>
                        <SelectItem value="month">{t('monthView')}</SelectItem>
                        <SelectItem value="year">{t('yearView')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center border border-border rounded-md ml-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none border-r border-border data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" data-active={viewMode === 'month'}><CalendarIconLucide className="h-5 w-5"/></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" data-active={false}><CheckSquare className="h-5 w-5"/></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 ml-1"><GripVertical className="h-5 w-5"/></Button>
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonth = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const isTodayDate = dateKey === format(today, 'yyyy-MM-dd');
                
                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full relative z-10"; 
                let dayText: React.ReactNode = dayDate.getDate();
                
                const entry = entriesMap.get(dateKey);
                const moonPhaseData = moonDataMap.get(dateKey);

                if (isTodayDate) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-primary text-primary-foreground font-semibold");
                } else if (!isCurrentMonth) {
                    dayNumberStyle = cn(dayNumberStyle, "text-muted-foreground/70");
                     if (dayDate.getDate() === 1) {
                        dayText = format(dayDate, 'd. MMM', { locale: userPreferences.language === 'de' ? (require('date-fns/locale/de') as any).default : (require('date-fns/locale/en-US') as any).default });
                    }
                } else {
                   dayNumberStyle = cn(dayNumberStyle, "text-foreground");
                }
                
                // Determine selected state for styling if needed
                // const isSelectedDate = selectedDateForDialog ? format(dayDate, 'yyyy-MM-dd') === format(selectedDateForDialog, 'yyyy-MM-dd') : false;
                // if (isSelectedDate && !isTodayDate) {
                //    dayNumberStyle = cn(dayNumberStyle, "ring-2 ring-accent");
                // }


                return (
                  <div className={cn("w-full h-full flex flex-col items-end p-1 pt-0 text-right")}>
                    <div className="flex items-center justify-between w-full">
                        {moonPhaseData && userPreferences.appMode === 'cycle' && <span className="text-2xl mr-auto">{moonPhaseData.emoji}</span>}
                        <span className={cn(dayNumberStyle, "mt-1 mr-1")}>{dayText}</span>
                    </div>
                    <div className="flex-grow w-full flex flex-col items-center justify-center space-y-1 mt-1">
                      {entry && (
                        <div className="flex items-center justify-center w-auto p-1 rounded-full">
                          {entry.isBleeding && entry.bleedingStrength !== 'none' ? (
                            <Droplet className="h-4 w-4 text-destructive" />
                          ) : (
                            <div className="w-2 h-2 bg-accent rounded-full"></div> // General entry indicator
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            }}
          />
        );
      case 'week':
        return <div className="flex-grow flex items-center justify-center text-muted-foreground"><p>{t('weekView')} (Not Implemented)</p></div>;
      case 'day':
        return <div className="flex-grow flex items-center justify-center text-muted-foreground"><p>{t('dayView')} (Not Implemented)</p></div>;
       case 'year':
        return <div className="flex-grow flex items-center justify-center text-muted-foreground"><p>{t('yearView')} (Not Implemented)</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full w-full bg-background">
      {renderCalendarView()}
      {selectedDateForDialog && (
        <DayEntryDialog
          isOpen={isEntryDialogOpen}
          onClose={handleCloseDialog}
          selectedDate={selectedDateForDialog}
          initialData={entriesMap.get(format(selectedDateForDialog, 'yyyy-MM-dd'))}
          onSaveEntry={handleSaveEntry}
          language={userPreferences.language}
          t={t}
          appMode={userPreferences.appMode}
        />
      )}
    </div>
  );
}
