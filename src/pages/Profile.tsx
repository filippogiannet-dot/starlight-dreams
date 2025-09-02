import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, Settings, Grid3X3, Clock, Target, Award, Calendar, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Profile {
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
}

interface UserStats {
  sessionsCount: number;
  totalMinutes: number;
  currentStreak: number;
  achievements: number;
  favoriteCategory: string;
}

interface RecentSession {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  completed_at: string;
  progress: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    sessionsCount: 0,
    totalMinutes: 0,
    currentStreak: 0,
    achievements: 0,
    favoriteCategory: 'meditation'
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchRecentSessions();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch meditation sessions count and total minutes
      const { data: sessions, error } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes, category, completed_at')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null);

      if (error) throw error;

      const totalMinutes = sessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const categoryCount = sessions?.reduce((acc: Record<string, number>, session) => {
        acc[session.category] = (acc[session.category] || 0) + 1;
        return acc;
      }, {}) || {};
      
      const favoriteCategory = Object.keys(categoryCount).length > 0 
        ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
        : 'meditation';

      // Calculate current streak (simplified)
      const currentStreak = Math.floor(Math.random() * 15) + 1; // Placeholder
      const achievements = Math.floor(totalMinutes / 60); // 1 achievement per hour

      setStats({
        sessionsCount: sessions?.length || 0,
        totalMinutes,
        currentStreak,
        achievements,
        favoriteCategory
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('id, title, category, duration_minutes, completed_at')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const sessionsWithProgress = data?.map(session => ({
        ...session,
        progress: 100 // Completed sessions have 100% progress
      })) || [];

      setRecentSessions(sessionsWithProgress);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      meditation: '🧘',
      breathing: '🌬️',
      sleep: '🌙',
      focus: '🎯',
      anxiety: '💚',
      stress: '🌊'
    };
    return icons[category as keyof typeof icons] || '🧘';
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-16">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="btn-mindful">
              <Settings size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="btn-mindful">
              <LogOut size={20} />
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="card-mindful p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20 meditation-ring">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-primary to-accent text-white">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-xl font-bold">
                  {profile?.full_name || profile?.username || 'Mindful Explorer'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  @{profile?.username || 'user'}
                </p>
              </div>
              {profile?.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                {stats.currentStreak} day streak 🔥
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-mindful p-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
                <Target className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.sessionsCount}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </Card>

          <Card className="card-mindful p-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto">
                <Clock className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-primary">{Math.floor(stats.totalMinutes / 60)}h</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </Card>

          <Card className="card-mindful p-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto">
                <TrendingUp className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </Card>

          <Card className="card-mindful p-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-pink-500 flex items-center justify-center mx-auto">
                <Award className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-primary">{stats.achievements}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </Card>
        </div>

        {/* Favorite Category */}
        <Card className="card-mindful p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getCategoryIcon(stats.favoriteCategory)}</div>
              <div>
                <h3 className="font-semibold">Favorite Practice</h3>
                <p className="text-sm text-muted-foreground capitalize">{stats.favoriteCategory}</p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              Most Used
            </Badge>
          </div>
        </Card>

        {/* Recent Sessions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-muted-foreground" />
            <h3 className="font-semibold">Recent Sessions</h3>
          </div>

          {recentSessions.length === 0 ? (
            <Card className="card-mindful p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Target className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground mb-4">No sessions completed yet</p>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="btn-mindful bg-gradient-to-r from-primary to-accent text-white"
                  >
                    Start Your First Session
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Card key={session.id} className="card-mindful p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getCategoryIcon(session.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{session.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="capitalize">{session.category}</span>
                        <span>•</span>
                        <span>{session.duration_minutes}m</span>
                        <span>•</span>
                        <span>{new Date(session.completed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={session.progress} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground">{session.progress}%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;