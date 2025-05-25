
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Locale } from 'date-fns';
import { format, addMonths, subMonths, getYear, getMonth, parseISO, startOfDay, isEqual, addDays as dateFnsAddDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, CalendarDays as CalendarIconLucide, CheckSquare, Loader2, Droplet, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import type { DailyEntryData, MoonPhaseData, GeneratedImpulse, CycleInfo, CyclePhase } from '@/lib/types';
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
  const storedEntries = JSON.parse(localStorage.getItem(`myLunaraCycle_entries_${userId}`) || '{}');
  const entriesMap = new Map<string, DailyEntryData>();
  
  Object.keys(storedEntries).forEach(dateKey => {
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

// Re-activate moon phase data fetching
const moonPhaseEmojisList = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const moonPhaseNamesList = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

async function fetchMoonDataForDateRange(startDate: Date, endDate: Date): Promise<Map<string, MoonPhaseData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY / 2)); // Simulate API call
  const moonDataMap = new Map<string, MoonPhaseData>();
  let currentDateIter = new Date(startDate);

  while (currentDateIter <= endDate) {
    const dateKey = format(currentDateIter, 'yyyy-MM-dd');
    const dayOfYear = (parseISO(dateKey).valueOf() - new Date(currentDateIter.getFullYear(), 0, 0).valueOf()) / (1000 * 60 * 60 * 24);
    const phaseIndex = Math.floor(dayOfYear % moonPhaseEmojisList.length);
    
    moonDataMap.set(dateKey, {
      emoji: moonPhaseEmojisList[phaseIndex],
      phaseName: moonPhaseNamesList[phaseIndex],
    });
    currentDateIter = dateFnsAddDays(currentDateIter, 1);
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
  
  // Re-activate moon phase state
  const [moonDataMap, setMoonDataMap] = useState<Map<string, MoonPhaseData>>(new Map());
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false); 
  
  const [cycleInfoMap, setCycleInfoMap] = useState<Map<string, CycleInfo>>(new Map());

  const today = useMemo(() => startOfDay(new Date()), []);

  const loadDataForDisplayMonth = useCallback(async () => {
    if (!user) return;
    setIsLoadingEntries(true);
    setIsLoadingMoonData(true); // Set loading for moon data

    const year = getYear(currentDisplayMonth);
    const month = getMonth(currentDisplayMonth);
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const fetchStartDate = dateFnsAddDays(firstDayOfMonth, -42); 
    const fetchEndDate = dateFnsAddDays(lastDayOfMonth, 42);

    try {
      const [fetchedEntries, fetchedMoonData] = await Promise.all([
        fetchDailyEntriesForMonthRange(user.id, fetchStartDate, fetchEndDate),
        fetchMoonDataForDateRange(fetchStartDate, fetchEndDate) // Fetch moon data
      ]);
      
      setEntriesMap(fetchedEntries);
      setMoonDataMap(fetchedMoonData); // Set moon data

      const newCycleInfoMap = new Map<string, CycleInfo>();
      const allFetchedEntriesArray = Array.from(fetchedEntries.values());
      
      let dayToCalc = dateFnsAddDays(firstDayOfMonth, - (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() -1) - 7 ); 
      const endDayToCalc = dateFnsAddDays(lastDayOfMonth, 14); 

      while(dayToCalc <= endDayToCalc) {
        const dateKey = format(dayToCalc, 'yyyy-MM-dd');
        newCycleInfoMap.set(dateKey, calculateCycleInfo(dateKey, allFetchedEntriesArray));
        dayToCalc = dateFnsAddDays(dayToCalc, 1);
      }
      setCycleInfoMap(newCycleInfoMap);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Data Loading Error", description: "Could not load calendar data.", variant: "destructive" });
    } finally {
      setIsLoadingEntries(false);
      setIsLoadingMoonData(false); // Clear loading for moon data
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
      const newEntriesMap = new Map(entriesMap).set(entryData.date, entryData);
      setEntriesMap(newEntriesMap);
      
      await loadDataForDisplayMonth(); 

      const currentCycleInfo = calculateCycleInfo(entryData.date, Array.from(newEntriesMap.values()));
      const moonPhaseForDay = moonDataMap.get(entryData.date); // Use updated moonDataMap
      const moonPhaseName = moonPhaseForDay?.phaseName || "Unknown";


      if (userPreferences.appMode === 'cycle') {
        const impulseInput: GenerateCycleImpulseInput = {
          cyclePhase: currentCycleInfo.phase,
          cycleDay: currentCycleInfo.cycleDay,
          moonPhaseName: moonPhaseName,
          userMood: entryData.mood,
          userEnergyLevel: entryData.energyLevel,
          userNotes: entryData.notes,
        };
        try {
          const impulseResult = await generateCycleImpulse(impulseInput);
          const newImpulse: GeneratedImpulse = {
            date: entryData.date,
            text: impulseResult.impulseText,
            cyclePhase: currentCycleInfo.phase as CyclePhase, 
            moonPhase: moonPhaseName,
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
    if (isLoadingEntries || isLoadingMoonData) { // Check isLoadingMoonData as well
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
            selected={selectedDateForDialog} 
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
              cell: cn("text-sm p-0 relative border-r border-border text-left flex flex-col items-stretch justify-stretch min-h-[7rem] md:min-h-[9rem]", "focus-within:relative focus-within:z-10 w-[calc(100%/7)]"),
              day: cn(buttonVariants({ variant: "ghost" }), "h-full w-full p-0 font-normal flex flex-col items-stretch justify-stretch focus:z-10 rounded-none text-left hover:bg-accent/10 data-[selected=true]:bg-accent/20"),
              day_today: "data-[selected=false]:bg-transparent", 
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" data-active={false}><CheckSquare className="h-5 w-5"/></Button> 
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 ml-1"><GripVertical className="h-5 w-5"/></Button>
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonthDay = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const isTodayDate = isEqual(startOfDay(dayDate), today);
                
                let dayTextNode: React.ReactNode = dayDate.getDate();
                const entry = entriesMap.get(dateKey);
                const cycleDayInfo = cycleInfoMap.get(dateKey);
                const moonPhaseForDay = moonDataMap.get(dateKey); // Get moon data for the day

                let numberDisplayClasses = "text-xs font-medium";
                let numberContainerDivClasses = "flex items-center justify-center p-0.5";

                if (isTodayDate) {
                    numberDisplayClasses = cn(numberDisplayClasses, "text-primary-foreground");
                    numberContainerDivClasses = cn(numberContainerDivClasses, "bg-primary rounded-full w-5 h-5");
                } else if (!isCurrentMonthDay) {
                    numberDisplayClasses = cn(numberDisplayClasses, "text-muted-foreground/70");
                    if (dayDate.getDate() === 1) {
                        dayTextNode = format(dayDate, 'd. MMM', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : require('date-fns/locale/en-US').default });
                    }
                } else {
                    numberDisplayClasses = cn(numberDisplayClasses, "text-foreground");
                }
                
                return (
                  <div className={cn("w-full h-full flex flex-col p-1")}> {/* Main DayContent container */}
                    {/* Moon and Day Number - Grouped and aligned to Top Right */}
                    <div className="flex items-center ml-auto space-x-1"> {/* ml-auto pushes to right */}
                      {moonPhaseForDay && (
                        <span className="text-xs leading-none" style={{filter: 'grayscale(1) invert(1) brightness(1.5)'}}>
                          {moonPhaseForDay.emoji}
                        </span>
                      )}
                      <div className={numberContainerDivClasses}>
                        <span className={numberDisplayClasses}>
                          {dayTextNode}
                        </span>
                      </div>
                    </div>
                
                    <div className="flex-grow"></div> {/* Spacer */}
                
                    {/* Cycle Indicators - Bottom Left */}
                    <div className="flex items-center space-x-1 self-start text-xs">
                      {userPreferences.appMode === 'cycle' && (entry || cycleDayInfo?.isOvulationDay || cycleDayInfo?.isFertile) && (
                        <>
                          {entry?.isBleeding && <Droplet className="h-3 w-3 text-destructive" />}
                          {cycleDayInfo?.isOvulationDay && <Star className="h-3 w-3 text-[hsl(var(--lunara-ovulation-glow))] fill-[hsl(var(--lunara-ovulation-glow))]" />}
                          {cycleDayInfo?.isFertile && !cycleDayInfo.isOvulationDay && !entry?.isBleeding && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--lunara-ovulation-glow))]"></div>
                          )}
                          {entry && !entry.isBleeding && !cycleDayInfo?.isOvulationDay && !cycleDayInfo?.isFertile && (
                            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                          )}
                        </>
                      )}
                       {userPreferences.appMode === 'pregnancy' && entry && (
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Pregnancy related entry"></div>
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
