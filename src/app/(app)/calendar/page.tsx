
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Locale } from 'date-fns';
import { format, addMonths, subMonths, getYear, getMonth, parseISO, startOfDay, isEqual } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, CalendarDays as CalendarIconLucide, CheckSquare, Loader2, Droplet, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import type { DailyEntryData, MoonPhaseData, GeneratedImpulse, CycleInfo } from '@/lib/types';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { generateCycleImpulse, type GenerateCycleImpulseInput } from '@/ai/flows/generate-cycle-impulse';
import { toast } from '@/hooks/use-toast';

const MOCK_DB_LATENCY = 300; // ms

async function saveDailyEntryToFirestore(userId: string, entry: DailyEntryData): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Saving entry for user ${userId}, date ${entry.date}:`, entry);
  const existingEntries = JSON.parse(localStorage.getItem(`myLunaraCycle_entries_${userId}`) || '{}');
  existingEntries[entry.date] = entry;
  localStorage.setItem(`myLunaraCycle_entries_${userId}`, JSON.stringify(existingEntries));
}

async function fetchDailyEntriesForMonthRange(userId: string, startDate: Date, endDate: Date): Promise<Map<string, DailyEntryData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  // console.log(`[Mock Firestore] Fetching entries for user ${userId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  const storedEntries = JSON.parse(localStorage.getItem(`myLunaraCycle_entries_${userId}`) || '{}');
  const entriesMap = new Map<string, DailyEntryData>();
  
  Object.keys(storedEntries).forEach(dateKey => {
    // Ensure dateKey is valid before parsing
    if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        try {
            const entryDate = parseISO(dateKey);
             if (entryDate >= startDate && entryDate <= endDate) {
                entriesMap.set(dateKey, storedEntries[dateKey]);
            }
        } catch (e) {
            console.warn(`Invalid date key found in localStorage: ${dateKey}`, e);
        }
    }
  });
  return entriesMap;
}

const moonPhaseEmojisList = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const moonPhaseNamesList = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

async function fetchMoonDataForDateRange(startDate: Date, endDate: Date): Promise<Map<string, MoonPhaseData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY / 2));
  const moonDataMap = new Map<string, MoonPhaseData>();
  let currentDateIter = new Date(startDate);

  while (currentDateIter <= endDate) {
    const dateKey = format(currentDateIter, 'yyyy-MM-dd');
    const dayOfMonth = currentDateIter.getDate();
    const month = currentDateIter.getMonth();
    const phaseIndex = (dayOfMonth - 1 + month * 3 + currentDateIter.getFullYear() * 2) % moonPhaseEmojisList.length;
    moonDataMap.set(dateKey, {
      emoji: moonPhaseEmojisList[phaseIndex],
      phaseName: moonPhaseNamesList[phaseIndex],
    });
    currentDateIter.setDate(currentDateIter.getDate() + 1);
  }
  return moonDataMap;
}


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();

  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | undefined>(undefined);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(startOfDay(new Date()));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const [entriesMap, setEntriesMap] = useState<Map<string, DailyEntryData>>(new Map());
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [moonDataMap, setMoonDataMap] = useState<Map<string, MoonPhaseData>>(new Map());
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(true); // Start true
  
  // Store cycle info for each day in the currently viewed range
  const [cycleInfoMap, setCycleInfoMap] = useState<Map<string, CycleInfo>>(new Map());

  const today = useMemo(() => startOfDay(new Date()), []);

  const loadDataForDisplayMonth = useCallback(async () => {
    if (!user) return;
    setIsLoadingEntries(true);
    setIsLoadingMoonData(true);

    const year = getYear(currentDisplayMonth);
    const month = getMonth(currentDisplayMonth);
    
    // Fetch for a wider range to cover outside days and cycle calculations
    const fetchStartDate = subMonths(new Date(year, month, 1), 2); // Go back 2 months for cycle history
    const fetchEndDate = addMonths(new Date(year, month + 1, 0), 2); // Go forward 2 months for predictions

    try {
      const [fetchedEntries, fetchedMoonData] = await Promise.all([
        fetchDailyEntriesForMonthRange(user.id, fetchStartDate, fetchEndDate),
        fetchMoonDataForDateRange(fetchStartDate, fetchEndDate)
      ]);
      
      setEntriesMap(fetchedEntries);
      setMoonDataMap(fetchedMoonData);

      // Calculate CycleInfo for all days in the current display month and padding
      const newCycleInfoMap = new Map<string, CycleInfo>();
      const allFetchedEntriesArray = Array.from(fetchedEntries.values());
      
      let dayToCalc = new Date(subMonths(new Date(year, month, 1),1));
      const endDayToCalc = new Date(addMonths(new Date(year, month+1,0),1));

      while(dayToCalc <= endDayToCalc) {
        const dateKey = format(dayToCalc, 'yyyy-MM-dd');
        newCycleInfoMap.set(dateKey, calculateCycleInfo(dateKey, allFetchedEntriesArray));
        dayToCalc = addDays(dayToCalc, 1);
      }
      setCycleInfoMap(newCycleInfoMap);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Data Loading Error", description: "Could not load calendar data.", variant: "destructive" });
    } finally {
      setIsLoadingEntries(false);
      setIsLoadingMoonData(false);
    }
  }, [currentDisplayMonth, user]);

  useEffect(() => {
    loadDataForDisplayMonth();
  }, [loadDataForDisplayMonth]);


  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = userPreferences.language === 'de' ? 'de-DE' : 'en-US';
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const todayModifier: Modifier = { date: today, disabled: false };

  const handleTodayClick = () => {
    const newToday = startOfDay(new Date());
    setCurrentDisplayMonth(newToday);
  };

  const handleDayClick = (date: Date | undefined, modifiers: any, e: React.MouseEvent) => {
    if (!date || modifiers.disabled) return;
    setSelectedDateForDialog(startOfDay(date));
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = async (entryData: DailyEntryData) => {
    if (!user) return;
    try {
      await saveDailyEntryToFirestore(user.id, entryData);
      // Optimistically update local entriesMap
      const newEntriesMap = new Map(entriesMap).set(entryData.date, entryData);
      setEntriesMap(newEntriesMap);
      
      // Re-calculate cycle info for the display based on new entry
      await loadDataForDisplayMonth(); // This will re-calculate and update cycleInfoMap

      const currentCycleInfo = calculateCycleInfo(entryData.date, Array.from(newEntriesMap.values()));
      const moonPhase = moonDataMap.get(entryData.date)?.phaseName || "Unknown";

      if (userPreferences.appMode === 'cycle') {
        const impulseInput: GenerateCycleImpulseInput = {
          cyclePhase: currentCycleInfo.phase,
          cycleDay: currentCycleInfo.cycleDay,
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
            cyclePhase: currentCycleInfo.phase,
            moonPhase: moonPhase,
          };
          localStorage.setItem('myLunaraCycle-latestImpulse', JSON.stringify(newImpulse));
          toast({ title: t('newImpulseGenerated') });
        } catch (aiError) {
          console.error("Error generating AI impulse:", aiError);
          toast({ title: "AI Impulse Error", description: "Could not generate impulse.", variant: "destructive" });
        }
      }
      setIsEntryDialogOpen(false);
      setSelectedDateForDialog(undefined);
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({ title: "Error", description: "Could not save entry.", variant: "destructive" });
    }
  };

  const handleCloseDialog = () => {
    setIsEntryDialogOpen(false);
    setSelectedDateForDialog(undefined);
  };

  const renderCalendarView = () => {
    if (isLoadingEntries || isLoadingMoonData) {
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
            selected={selectedDateForDialog} // Keeps selected day visually marked
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
              day: cn(buttonVariants({ variant: "ghost" }), "h-full w-full p-1 font-normal flex flex-col items-end justify-start focus:z-10 rounded-none text-left hover:bg-accent/10 data-[selected=true]:bg-accent/20"),
              day_today: "data-[selected=false]:bg-transparent", // Remove default DayPicker today style if not selected
              day_outside: "text-muted-foreground/70 data-[selected=false]:bg-transparent",
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" data-active={false}><CheckSquare className="h-5 w-5"/></Button> {/* Placeholder for Task view */}
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 ml-1"><GripVertical className="h-5 w-5"/></Button>
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonthDay = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const isTodayDate = isEqual(startOfDay(dayDate), today);
                
                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full relative z-10"; 
                let dayText: React.ReactNode = dayDate.getDate();
                
                const entry = entriesMap.get(dateKey);
                const moonPhase = moonDataMap.get(dateKey);
                const cycleDayInfo = cycleInfoMap.get(dateKey);

                if (isTodayDate) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-primary text-primary-foreground font-semibold");
                } else if (!isCurrentMonthDay) {
                    dayNumberStyle = cn(dayNumberStyle, "text-muted-foreground/70");
                     if (dayDate.getDate() === 1) { // Display '1. Mmm' for first day of outside month
                        dayText = format(dayDate, 'd. MMM', { locale: userPreferences.language === 'de' ? (require('date-fns/locale/de') as any).default : (require('date-fns/locale/en-US') as any).default });
                    }
                } else {
                   dayNumberStyle = cn(dayNumberStyle, "text-foreground");
                }

                return (
                  <div className={cn("w-full h-full flex flex-col items-start justify-start p-1 pt-0 text-left")}>
                    <div className="w-full flex justify-end">
                        <span className={cn(dayNumberStyle, "mt-1 mr-1")}>{dayText}</span>
                    </div>
                    <div className="flex-grow w-full flex flex-col items-start justify-end space-y-1 mt-1 pl-1 pb-1"> {/* Content at bottom-left */}
                      {moonPhase && userPreferences.appMode === 'cycle' && (
                        <span className="text-xl leading-none" style={{filter: 'grayscale(1) invert(1) brightness(1.5)'}}>{moonPhase.emoji}</span>
                      )}
                      {userPreferences.appMode === 'cycle' && cycleDayInfo && (
                        <div className="flex items-center space-x-1">
                            {entry?.isBleeding && <Droplet className="h-3.5 w-3.5 text-destructive" />}
                            {cycleDayInfo.isOvulationDay && <Star className="h-3.5 w-3.5 text-[hsl(var(--lunara-ovulation-glow))] fill-[hsl(var(--lunara-ovulation-glow))]" />}
                            {cycleDayInfo.isFertile && !cycleDayInfo.isOvulationDay && !entry?.isBleeding && (
                                <div className="w-2 h-2 rounded-full bg-[hsl(var(--lunara-ovulation-glow))]"></div>
                            )}
                            {entry && !entry.isBleeding && !cycleDayInfo.isOvulationDay && !cycleDayInfo.isFertile && (
                                 <div className="w-2 h-2 bg-accent rounded-full"></div> // General entry indicator
                            )}
                        </div>
                      )}
                       {userPreferences.appMode === 'pregnancy' && entry && (
                         <div className="w-2 h-2 bg-green-500 rounded-full" title="Pregnancy related entry"></div>
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
