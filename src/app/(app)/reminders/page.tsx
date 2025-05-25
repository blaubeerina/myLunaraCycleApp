'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import type { Reminder } from '@/lib/types';
import { useState } from 'react';

const mockReminders: Reminder[] = [
  { id: '1', type: 'period_due', date: '2024-08-15', message: 'Your period might be starting soon.', isEnabled: true },
  { id: '2', type: 'ovulation_approaching', date: '2024-08-01', message: 'Ovulation is likely approaching.', isEnabled: true },
  { id: '3', type: 'custom', date: '2024-07-25', message: 'Remember to take your supplements.', isEnabled: false },
];

export default function RemindersPage() {
  const { t, userPreferences } = useAppContext();
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);

  const toggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r)
    );
  };

  const relevantReminders = reminders.filter(r => {
    if (userPreferences.appMode === 'cycle' && (r.type === 'period_due' || r.type === 'ovulation_approaching' || r.type === 'custom')) return true;
    if (userPreferences.appMode === 'pregnancy' && (r.type === 'pregnancy_milestone' || r.type === 'custom')) return true; // Add pregnancy_milestone to mock if needed
    return false;
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">{t('reminders')}</CardTitle>
            <CardDescription>
              Configure personalized reminders for your {userPreferences.appMode === 'cycle' ? 'cycle' : 'pregnancy'}.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => alert('Add new reminder UI not implemented.')}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Reminder
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {relevantReminders.length > 0 ? (
            relevantReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4 flex items-center justify-between bg-secondary/20">
                <div>
                  <p className="font-semibold">{reminder.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {reminder.type === 'custom' ? 'Custom' : (userPreferences.appMode === 'cycle' ? 'Cycle based' : 'Pregnancy based')} - Due: {new Date(reminder.date).toLocaleDateString(userPreferences.language)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`reminder-${reminder.id}`}
                    checked={reminder.isEnabled}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                    aria-label={`Toggle reminder ${reminder.message}`}
                  />
                  <Label htmlFor={`reminder-${reminder.id}`} className="sr-only">Toggle reminder</Label>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No reminders configured for {userPreferences.appMode === 'cycle' ? t('cycleMode') : t('pregnancyMode')}. Add some!
            </p>
          )}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive reminders (e.g., push notifications, email).</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Full notification settings (push, email) are not implemented in this demo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
