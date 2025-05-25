
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo } from 'react';
import type { Locale } from 'date-fns';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getYear, getMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, CalendarDays as CalendarIconLucide, CheckSquare, Loader2, Droplet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import type { DailyEntryData, MoonPhaseData } from '@/lib/types';

// --- Mock Firestore Functions ---
// In a real app, these would interact with Firebase Firestore.
const MOCK_DB_LATENCY = 500; // ms

async function saveDailyEntryToFirestore(userId: string, entry: DailyEntryData): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Saving entry for user ${userId}, date ${entry.date}:`, entry);
  // Simulate saving to a local storage for persistence in mock, or update a global mock store
  const existingEntries = JSON.parse(localStorage.getItem(`firestoreMock_entries_${userId}`) || '{}');
  existingEntries[entry.date] = entry;
  localStorage.setItem(`firestoreMock_entries_${userId}`, JSON.stringify(existingEntries));
}

async function fetchDailyEntriesForMonth(userId: string, year: number, month: number): Promise<Map<string, DailyEntryData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Fetching entries for user ${userId}, year ${year}, month ${month}`);
  const storedEntries = JSON.parse(localStorage.getItem(`firestoreMock_entries_${userId}`) || '{}');
  const entriesMap = new Map<string, DailyEntryData>();
  
  // Filter entries for the given month (and potentially some padding for outside days)
  Object.keys(storedEntries).forEach(dateKey => {
    // A more sophisticated filter might be needed if we show many outside days from other months
    // For now, this example assumes dateKey is YYYY-MM-DD
    const entryDate = new Date(dateKey + 'T00:00:00'); // Ensure parsing as local date
    if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
      entriesMap.set(dateKey, storedEntries[dateKey]);
    }
  });
  return entriesMap;
}

// --- Mock Moon Phase Data Generation ---
const moonPhaseEmojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
const moonPhaseNames = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

async function fetchMoonDataForMonth(year: number, month: number): Promise<Map<string, MoonPhaseData>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY / 2)); // Faster than DB
  const moonDataMap = new Map<string, MoonPhaseData>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = format(date, 'yyyy-MM-dd');
    // Simple cyclical mock data, not astronomically accurate
    const phaseIndex = (day - 1 + month * 5) % moonPhaseEmojis.length; // Vary based on day and month
    moonDataMap.set(dateKey, {
      emoji: moonPhaseEmojis[phaseIndex],
      phaseName: moonPhaseNames[phaseIndex],
    });
  }
  return moonDataMap;
}


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth(); // Get user for Firestore path (even if mocked)

  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | undefined>(undefined);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('month'); // Added year

  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const [entriesMap, setEntriesMap] = useState<Map<string, DailyEntryData>>(new Map());
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const [moonDataMap, setMoonDataMap] = useState<Map<string, MoonPhaseData>>(new Map());
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false);

  const today = useMemo(() => new Date(), []);

  // Fetch entries and moon data when month or user changes
  useEffect(() => {
    if (!user) return;

    const year = getYear(currentDisplayMonth);
    const month = getMonth(currentDisplayMonth); // 0-indexed

    const loadData = async () => {
      setIsLoadingEntries(true);
      setIsLoadingMoonData(true);
      try {
        const [fetchedEntries, fetchedMoonData] = await Promise.all([
          fetchDailyEntriesForMonth(user.id, year, month),
          fetchMoonDataForMonth(year, month)
        ]);
        setEntriesMap(fetchedEntries);
        setMoonDataMap(fetchedMoonData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error display if needed
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
    // setSelectedDateForDialog(newToday); // Optionally select today
  };

  const handleDayClick = (date: Date | undefined, modifiers: any, e: React.MouseEvent) => {
    if (!date || modifiers.disabled) return;
    setSelectedDateForDialog(date);
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = async (entry: DailyEntryData) => {
    if (!user) return;
    try {
      await saveDailyEntryToFirestore(user.id, entry);
      setEntriesMap(prevMap => new Map(prevMap).set(entry.date, entry));
      setIsEntryDialogOpen(false);
      setSelectedDateForDialog(undefined);
      // toast({ title: t('entrySaved'), description: format(new Date(entry.date), 'PPP', { locale: userPreferences.language === 'de' ? de : enUS }) });
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
            // selected={selectedDateForDialog} // We handle selection for dialog, not direct calendar visual
            onDayClick={handleDayClick}
            month={currentDisplayMonth}
            onMonthChange={setCurrentDisplayMonth}
            className="w-full flex-grow flex flex-col p-0 border-0 rounded-none shadow-none" // Full width, no card like styling
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            showOutsideDays={true}
            weekStartsOn={1} // Monday
            classNames={{
              root: "flex flex-col flex-grow w-full h-full", 
              months: "flex flex-col sm:flex-row flex-grow h-full",
              month: "space-y-0 flex flex-col flex-grow h-full p-0", 
              
              caption_layout: 'flex items-center justify-between py-2 px-1 md:px-2 relative border-b',
              caption: "flex items-center gap-1", 
              caption_label: "text-lg font-semibold text-foreground text-center flex-grow justify-start",

              nav_container: "flex items-center gap-1",
              nav_button: cn(
                buttonVariants({ variant: "ghost" }),
                "h-8 w-8 p-0 hover:bg-accent/50"
              ),
              nav_button_previous: "", 
              nav_button_next: "", 

              table: "w-full border-collapse mt-0 flex-grow grid grid-rows-[auto_repeat(6,minmax(0,1fr))] border-t border-l border-border h-full", 
              head_row: "flex border-b border-border",
              head_cell: cn(
                "text-muted-foreground font-normal text-[0.70rem] flex items-center justify-center uppercase py-2 w-[calc(100%/7)] h-10 border-r border-border",
                "sm:text-xs"
              ),

              row: "flex w-full border-b border-border last:border-b-0", // flex-grow causes issues here
              cell: cn(
                "text-sm p-1 relative border-r border-border text-right flex flex-col items-end justify-start min-h-[6rem] md:min-h-[8rem]", // min-h for larger cells
                "focus-within:relative focus-within:z-10 w-[calc(100%/7)]" 
              ),
              day: cn( 
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-1 font-normal flex flex-col items-end justify-start focus:z-10 rounded-none text-left hover:bg-accent/10" 
              ),
              day_selected: "bg-accent/20", // Example: visual cue for selected, though click opens dialog
              day_today: "", // Handled in DayContent
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
                        <span className="sr-only">Previous Month</span>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => addMonths(prev, 1))}>
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next Month</span>
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" data-active={false}><CheckSquare className="h-5 w-5"/></Button> {/* Task view placeholder */}
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 ml-1"><GripVertical className="h-5 w-5"/></Button>
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonth = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const isTodayDate = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                // const isSelectedDate = selectedDateForDialog ? format(dayDate, 'yyyy-MM-dd') === format(selectedDateForDialog, 'yyyy-MM-dd') : false;

                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full relative z-10"; 
                let dayText: React.ReactNode = dayDate.getDate();
                
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const entry = entriesMap.get(dateKey);
                const moonPhase = moonDataMap.get(dateKey);

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

                return (
                  <div className={cn(
                    "w-full h-full flex flex-col items-end p-1 pt-0 text-right", 
                  )}>
                    <span className={cn(dayNumberStyle, "mt-1 mr-1")}>{dayText}</span>
                    <div className="flex-grow w-full flex flex-col items-center justify-center space-y-1 mt-1">
                      {moonPhase && <span className="text-2xl">{moonPhase.emoji}</span>}
                      {entry && (
                        <div className="flex items-center justify-center w-full">
                          {entry.isBleeding && entry.bleedingStrength !== 'none' ? (
                            <Droplet className="h-4 w-4 text-destructive" />
                          ) : (
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
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
    <div className="flex-grow flex flex-col h-full w-full bg-background"> {/* Ensure background color is applied */}
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
        />
      )}
    </div>
  );
}
