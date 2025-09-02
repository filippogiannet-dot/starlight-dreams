import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '../api/apiClient';

export interface UserSession {
  id: string;
  sessionType: 'meditation' | 'exercise' | 'breathing' | 'reading';
  duration: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  preferredDuration: number;
  preferredCategories: string[];
  notificationSettings: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    achievementAlerts: boolean;
  };
  personalityType?: string;
  goals?: string[];
}

export interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  favoriteCategory?: string;
  averageSessionLength: number;
}

export const useUserTracking = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user preferences and progress
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load preferences from Supabase
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefsData) {
        const notificationSettings = prefsData.notification_settings as any;
        setPreferences({
          preferredDuration: prefsData.preferred_duration,
          preferredCategories: prefsData.preferred_categories || [],
          notificationSettings: {
            dailyReminders: notificationSettings?.dailyReminders ?? true,
            weeklyProgress: notificationSettings?.weeklyProgress ?? true,
            achievementAlerts: notificationSettings?.achievementAlerts ?? true
          }
        });
      }

      // Calculate progress from session data
      const { data: sessions } = await supabase
        .from('session_progress')
        .select('*')
        .eq('user_id', user.id);

      if (sessions) {
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.completed);
        const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.progress_percentage || 0), 0);

        setProgress({
          totalSessions,
          totalMinutes: Math.round(totalMinutes),
          currentStreak: calculateCurrentStreak(sessions),
          longestStreak: calculateLongestStreak(sessions),
          achievementsUnlocked: Math.floor(totalSessions / 5), // Example achievement logic
          averageSessionLength: totalSessions > 0 ? totalMinutes / totalSessions : 0
        });
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Start a new session
  const startSession = useCallback(async (
    type: UserSession['sessionType'],
    metadata?: Record<string, any>
  ): Promise<string | null> => {
    if (!user || currentSession) return null;

    try {
      const sessionId = crypto.randomUUID();
      const session: UserSession = {
        id: sessionId,
        sessionType: type,
        duration: 0,
        completed: false,
        startedAt: new Date(),
        metadata
      };

      setCurrentSession(session);

      // Track session start
      await apiClient.trackSession({
        userId: user.id,
        sessionId,
        action: 'start',
        type,
        timestamp: new Date(),
        metadata
      });

      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }, [user, currentSession]);

  // Update session progress
  const updateSessionProgress = useCallback(async (
    progress: number,
    metadata?: Record<string, any>
  ) => {
    if (!currentSession || !user) return;

    try {
      const updatedSession = {
        ...currentSession,
        duration: Date.now() - currentSession.startedAt.getTime(),
        metadata: { ...currentSession.metadata, ...metadata }
      };

      setCurrentSession(updatedSession);

      // Save progress to database
      await supabase
        .from('session_progress')
        .upsert({
          user_id: user.id,
          session_id: currentSession.id,
          progress_percentage: progress,
          completed: progress >= 100
        });

      // Track progress update
      await apiClient.trackSession({
        userId: user.id,
        sessionId: currentSession.id,
        action: 'progress',
        progress,
        metadata
      });

    } catch (error) {
      console.error('Error updating session progress:', error);
    }
  }, [currentSession, user]);

  // Complete session
  const completeSession = useCallback(async (rating?: number) => {
    if (!currentSession || !user) return;

    try {
      const completedSession = {
        ...currentSession,
        completed: true,
        completedAt: new Date(),
        duration: Date.now() - currentSession.startedAt.getTime()
      };

      // Save completed session
      await supabase
        .from('session_progress')
        .upsert({
          user_id: user.id,
          session_id: currentSession.id,
          progress_percentage: 100,
          completed: true,
          completed_at: new Date().toISOString()
        });

      // Track completion
      await apiClient.trackSession({
        userId: user.id,
        sessionId: currentSession.id,
        action: 'complete',
        duration: completedSession.duration,
        rating,
        metadata: completedSession.metadata
      });

      setCurrentSession(null);
      
      // Reload progress data
      await loadUserData();

      return completedSession;
    } catch (error) {
      console.error('Error completing session:', error);
      return null;
    }
  }, [currentSession, user, loadUserData]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_duration: updated.preferredDuration,
          preferred_categories: updated.preferredCategories,
          notification_settings: updated.notificationSettings
        });

      await apiClient.updateUserPreferences(user.id, updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user, preferences]);

  // Track interaction (likes, saves, shares)
  const trackInteraction = useCallback(async (
    action: string,
    target: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    await apiClient.trackInteraction({
      userId: user.id,
      action,
      target,
      timestamp: new Date(),
      metadata
    });
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    currentSession,
    preferences,
    progress,
    loading,
    startSession,
    updateSessionProgress,
    completeSession,
    updatePreferences,
    trackInteraction,
    refreshData: loadUserData
  };
};

// Helper functions
function calculateCurrentStreak(sessions: any[]): number {
  // Implementation for calculating current consecutive days
  return Math.floor(Math.random() * 10); // Placeholder
}

function calculateLongestStreak(sessions: any[]): number {
  // Implementation for calculating longest streak
  return Math.floor(Math.random() * 20); // Placeholder
}