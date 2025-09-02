import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  animations: boolean;
  sounds: boolean;
  notifications: {
    enabled: boolean;
    dailyReminders: boolean;
    weeklyProgress: boolean;
    achievements: boolean;
    reminderTime: string;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    shareProgress: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  meditation: {
    defaultDuration: number;
    preferredVoice: string;
    backgroundSounds: boolean;
    guidanceLevel: 'minimal' | 'moderate' | 'detailed';
  };
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loading: boolean;
  exportData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  animations: true,
  sounds: true,
  notifications: {
    enabled: true,
    dailyReminders: true,
    weeklyProgress: true,
    achievements: true,
    reminderTime: '09:00'
  },
  privacy: {
    profileVisible: true,
    activityVisible: false,
    shareProgress: false
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false
  },
  meditation: {
    defaultDuration: 10,
    preferredVoice: 'calm-female',
    backgroundSounds: true,
    guidanceLevel: 'moderate'
  }
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  // Load settings from database
  const loadSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Merge saved settings with defaults
        const savedSettings: AppSettings = {
          ...defaultSettings,
          ...(data.notification_settings ? data.notification_settings as Partial<AppSettings> : {}),
          meditation: {
            ...defaultSettings.meditation,
            defaultDuration: data.preferred_duration || defaultSettings.meditation.defaultDuration
          }
        };
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_duration: newSettings.meditation.defaultDuration,
          preferred_categories: [], // Will be populated from user selections
          notification_settings: newSettings.notifications
        });

      if (error) throw error;

      // Apply theme changes
      if (updates.theme) {
        applyTheme(updates.theme);
      }

      // Apply accessibility changes
      if (updates.accessibility) {
        applyAccessibilitySettings(updates.accessibility);
      }

      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully"
      });

    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset to defaults
  const resetSettings = async () => {
    await updateSettings(defaultSettings);
  };

  // Export user data
  const exportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [sessions, progress, preferences] = await Promise.all([
        supabase.from('meditation_sessions').select('*').eq('user_id', user.id),
        supabase.from('session_progress').select('*').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        sessions: sessions.data,
        progress: progress.data,
        preferences: preferences.data,
        settings,
        exportedAt: new Date().toISOString()
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `north-star-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully"
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive"
      });
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return;

    try {
      // This would typically be handled by a secure server endpoint
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  // Apply theme
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  // Apply accessibility settings
  const applyAccessibilitySettings = (accessibility: Partial<AppSettings['accessibility']>) => {
    const root = document.documentElement;
    
    if (accessibility.reducedMotion !== undefined) {
      root.style.setProperty('--animation-duration', accessibility.reducedMotion ? '0s' : '0.3s');
    }
    
    if (accessibility.largeText !== undefined) {
      root.style.setProperty('--text-scale', accessibility.largeText ? '1.2' : '1');
    }
  };

  // Load settings on mount
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // Apply initial theme
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    loading,
    exportData,
    deleteAccount
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};