
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Language, AppMode } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthContext';
// themes are now imported from AppContext
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { t, userPreferences, setUserPreferences, activeTheme, setActiveTheme, availableThemes } = useAppContext();
  const { user, logout } = useAuth();

  const handleLanguageChange = (lang: Language) => {
    setUserPreferences(prev => ({ ...prev, language: lang }));
  };

  const handleModeChange = (mode: AppMode) => {
    setUserPreferences(prev => ({ ...prev, appMode: mode }));
  };

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId); // This now updates context which handles saving and applying
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">{t('settings')}</CardTitle>
          <CardDescription className="text-muted-foreground">Manage your application preferences and account settings.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-important-text">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-2 block text-card-foreground">{t('language')}</Label>
            <RadioGroup
              value={userPreferences.language}
              onValueChange={(value) => handleLanguageChange(value as Language)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="lang-en" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                <Label htmlFor="lang-en" className="text-card-foreground">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="de" id="lang-de" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                <Label htmlFor="lang-de" className="text-card-foreground">Deutsch</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block text-card-foreground">{t('appMode')}</Label>
            <RadioGroup
              value={userPreferences.appMode}
              onValueChange={(value) => handleModeChange(value as AppMode)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cycle" id="mode-cycle" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                <Label htmlFor="mode-cycle" className="text-card-foreground">{t('cycleMode')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pregnancy" id="mode-pregnancy" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                <Label htmlFor="mode-pregnancy" className="text-card-foreground">{t('pregnancyMode')}</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-important-text">Theme Selection</CardTitle>
          <CardDescription className="text-muted-foreground">Choose your preferred color theme for the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableThemes.map((theme) => (
            <Button
              key={theme.id}
              variant={activeTheme === theme.id ? "secondary" : "outline"}
              className={cn(
                "w-full justify-start h-auto py-3 text-left border-border hover:bg-accent/10",
                activeTheme === theme.id ? "bg-primary/20 border-primary text-primary" : "bg-input text-card-foreground"
              )}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="flex items-center w-full">
                <div className="flex-grow">
                  <p className="font-semibold">{theme.name}</p>
                  <div className="flex space-x-1 mt-1.5">
                    {theme.previewColors.map((color, index) => (
                      <div
                        key={index}
                        className="h-5 w-5 rounded-sm border border-border/50"
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

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-important-text">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <p className="text-card-foreground">Logged in as: <span className="font-semibold">{user.displayName || user.email}</span></p>
              <Button variant="outline" onClick={() => alert('Password change not implemented.')} className="border-border text-card-foreground hover:bg-muted/50">Change Password</Button>
              <Button variant="destructive" onClick={logout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('logout')}
              </Button>
            </>
          )}
           <p className="text-sm text-muted-foreground">Full account management (linking accounts, deleting account) would be available here.</p>
        </CardContent>
      </Card>
       <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-important-text">Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Information about data storage, privacy policy, and options to export or delete data would be here.</p>
          <Button variant="link" className="p-0 h-auto mt-2 text-primary hover:text-primary/80">View Privacy Policy (Not Implemented)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
