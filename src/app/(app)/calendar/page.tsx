
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo } from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, CalendarDays as CalendarIconLucide, CheckSquare, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import type { DailyEntryData } from '@/lib/types';

// Mock moon phase data (replace with actual API call if available)
interface MoonData {
  [date: string]: { phase: string }; // e.g., "2024-07-25": { phase: "New Moon" }
}

// Simplified mock moon data generation
const getMockMoonPhaseEmoji = (date: Date): string => {
  const day = date.getDate();
  // Simple cycle for demonstration, not astronomically accurate
  if (day >= 1 && day <= 3) return '🌑'; // New Moon
  if (day >= 4 && day <= 7) return '🌒'; // Waxing Crescent
  if (day >= 8 && day <= 11) return '🌓'; // First Quarter
  if (day >= 12 && day <= 15) return '🌔'; // Waxing Gibbous
  if (day >= 16 && day <= 18) return '🌕'; // Full Moon
  if (day >= 19 && day <= 22) return '🌖'; // Waning Gibbous
  if (day >= 23 && day <= 26) return '🌗'; // Last Quarter
  if (day >= 27 && day <= 31) return '🌘'; // Waning Crescent
  return '🌑'; // Default
};


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [dateForEntry, setDateForEntry] = useState<Date | undefined>(undefined);

  const today = useMemo(() => new Date(), []);

  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = userPreferences.language === 'de' ? 'de-DE' : 'en-US';
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const todayModifier: Modifier = { date: today, disabled: false };

  const handleTodayClick = () => {
    const newToday = new Date();
    setCurrentDisplayMonth(newToday);
    setSelectedDate(newToday);
  };

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setDateForEntry(date);
    setIsEntryDialogOpen(true);
  };

  const handleSaveEntry = (entry: DailyEntryData) => {
    console.log('Saving entry:', entry);
    // Here you would typically save to a backend/Firestore
    // For now, just log it and close the dialog
    setDateForEntry(undefined);
    setIsEntryDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setDateForEntry(undefined);
    setIsEntryDialogOpen(false);
  };


  // Note: Full week/day view rendering is not implemented here.
  // This switch would eventually control which calendar component is rendered.
  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            month={currentDisplayMonth}
            onMonthChange={setCurrentDisplayMonth}
            className="w-full flex-grow flex flex-col"
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            showOutsideDays={true}
            weekStartsOn={1} // Monday
            classNames={{
              root: "flex flex-col flex-grow w-full", 
              months: "flex flex-col sm:flex-row flex-grow",
              month: "space-y-0 flex flex-col flex-grow p-0", 
              
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

              table: "w-full border-collapse mt-0 flex-grow grid grid-rows-[auto_repeat(6,minmax(0,1fr))] border-t border-l border-border", 
              head_row: "flex border-b border-border",
              head_cell: cn(
                "text-muted-foreground font-normal text-[0.70rem] flex items-center justify-center uppercase pt-1 pb-1 w-[calc(100%/7)] h-10 border-r border-border",
                "sm:text-xs"
              ),

              row: "flex w-full border-b border-border last:border-b-0",
              cell: cn(
                "text-sm p-0 relative border-r border-border text-right flex flex-col items-end justify-start", 
                "focus-within:relative focus-within:z-10 w-[calc(100%/7)]" 
              ),
              day: cn( 
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-1 font-normal flex flex-col items-end justify-start focus:z-10 rounded-none text-left" 
              ),
              day_selected: "", 
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
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() -1, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous Month</span>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next Month</span>
                    </Button>
                     <h2 className="text-xl font-medium text-foreground ml-3">
                        {displayMonth.toLocaleDateString(userPreferences.language, { month: 'long', year: 'numeric' })}
                     </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Search className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><HelpCircle className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="h-5 w-5"/></Button>
                    <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}>
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
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"><CheckSquare className="h-5 w-5"/></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 ml-1"><GripVertical className="h-5 w-5"/></Button>
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonth = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const isTodayDate = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();
                const isSelectedDate = selectedDate?.toDateString() === dayDate.toDateString();

                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full relative z-10"; 
                let dayText: React.ReactNode = dayDate.getDate();
                
                const moonEmoji = getMockMoonPhaseEmoji(dayDate);

                if (isTodayDate) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-primary text-primary-foreground font-semibold");
                } else if (isSelectedDate && isCurrentMonth) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-accent/30 ring-1 ring-primary text-primary");
                } else if (!isCurrentMonth) {
                    dayNumberStyle = cn(dayNumberStyle, "text-muted-foreground");
                     if (dayDate.getDate() === 1) {
                        dayText = dayDate.toLocaleDateString(userPreferences.language, { day: 'numeric', month: 'short' });
                    }
                } else {
                   dayNumberStyle = cn(dayNumberStyle, "text-foreground");
                }

                return (
                  <div className={cn(
                    "w-full h-full flex flex-col items-end p-1 pt-0 text-right", 
                  )}>
                    <span className={cn(dayNumberStyle, "mt-1 mr-1")}>{dayText}</span>
                    <span className="text-3xl mt-auto mb-1 mr-1">{moonEmoji}</span>
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
      default:
        return null;
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full w-full">
      {renderCalendarView()}
      {dateForEntry && (
        <DayEntryDialog
          isOpen={isEntryDialogOpen}
          onClose={handleCloseDialog}
          selectedDate={dateForEntry}
          onSaveEntry={handleSaveEntry}
          language={userPreferences.language}
          t={t}
        />
      )}
    </div>
  );
}
