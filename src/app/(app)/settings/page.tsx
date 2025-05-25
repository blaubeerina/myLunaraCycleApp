
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Language, AppMode } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthContext';
import { themes } from '@/lib/themes'; // Import theme definitions
import { CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { t, userPreferences, setUserPreferences, activeTheme, setActiveTheme } = useAppContext();
  const { user, logout } = useAuth();

  const handleLanguageChange = (lang: Language) => {
    setUserPreferences(prev => ({ ...prev, language: lang }));
  };

  const handleModeChange = (mode: AppMode) => {
    setUserPreferences(prev => ({ ...prev, appMode: mode }));
  };

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t('settings')}</CardTitle>
          <CardDescription>Manage your application preferences and account settings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-2 block">Language</Label>
            <RadioGroup
              value={userPreferences.language}
              onValueChange={(value) => handleLanguageChange(value as Language)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="de" id="lang-de" />
                <Label htmlFor="lang-de">Deutsch</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">Application Mode</Label>
            <RadioGroup
              value={userPreferences.appMode}
              onValueChange={(value) => handleModeChange(value as AppMode)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cycle" id="mode-cycle" />
                <Label htmlFor="mode-cycle">{t('cycleMode')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pregnancy" id="mode-pregnancy" />
                <Label htmlFor="mode-pregnancy">{t('pregnancyMode')}</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Selection</CardTitle>
          <CardDescription>Choose your preferred color theme for the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {themes.map((theme) => (
            <Button
              key={theme.id}
              variant={activeTheme === theme.id ? "secondary" : "outline"}
              className="w-full justify-start h-auto py-3 text-left"
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="flex items-center w-full">
                <div className="flex-grow">
                  <p className="font-semibold">{theme.name}</p>
                  <div className="flex space-x-1 mt-1.5">
                    {theme.previewColors.map((color, index) => (
                      <div
                        key={index}
                        className="h-5 w-5 rounded-sm border border-border"
                        style={{ backgroundColor: color }}
                        aria-label={`${theme.name} color swatch ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                {activeTheme === theme.id && <CheckCircle className="h-5 w-5 text-primary ml-2 shrink-0" />}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <p>Logged in as: <span className="font-semibold">{user.displayName || user.email}</span></p>
              <Button variant="outline" onClick={() => alert('Password change not implemented.')}>Change Password</Button>
              <Button variant="destructive" onClick={logout}>
                {t('logout')}
              </Button>
            </>
          )}
           <p className="text-sm text-muted-foreground">Full account management (linking accounts, deleting account) would be available here.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Information about data storage, privacy policy, and options to export or delete data would be here.</p>
          <Button variant="link" className="p-0 h-auto mt-2">View Privacy Policy (Not Implemented)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
