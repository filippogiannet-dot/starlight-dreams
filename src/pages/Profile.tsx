import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { LogOut, Settings, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
}

interface UserStats {
  dreamsCount: number;
  followersCount: number;
  followingCount: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({ dreamsCount: 0, followersCount: 0, followingCount: 0 });
  const [userDreams, setUserDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchUserDreams();
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
      // Fetch dreams count
      const { count: dreamsCount } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);

      // Fetch following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user?.id);

      setStats({
        dreamsCount: dreamsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserDreams = async () => {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('id, title, ai_image_url, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserDreams(data || []);
    } catch (error) {
      console.error('Error fetching user dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
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
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Settings size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={20} />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xl">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold">
                {profile?.full_name || profile?.username || 'Dream Explorer'}
              </h2>
              <p className="text-muted-foreground text-sm">
                @{profile?.username || 'user'}
              </p>
              {profile?.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-around mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.dreamsCount}</p>
              <p className="text-xs text-muted-foreground">Dreams</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </Card>

        {/* Dreams Grid */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Grid3X3 size={20} className="text-muted-foreground" />
            <h3 className="font-semibold">Your Dreams</h3>
          </div>

          {userDreams.length === 0 ? (
            <Card className="p-8 text-center bg-card/80 backdrop-blur-sm border-border/50">
              <p className="text-muted-foreground mb-4">No dreams shared yet</p>
              <Button 
                onClick={() => window.location.href = '/create'}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Share Your First Dream
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {userDreams.map((dream) => (
                <div
                  key={dream.id}
                  className="aspect-square rounded-lg overflow-hidden bg-muted/50 border border-border/50"
                >
                  {dream.ai_image_url ? (
                    <img
                      src={dream.ai_image_url}
                      alt={dream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <p className="text-xs text-center p-2 text-muted-foreground font-medium">
                        {dream.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;