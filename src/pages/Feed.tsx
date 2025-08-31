import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Dream {
  id: string;
  title: string;
  content: string;
  ai_analysis: string;
  ai_image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
  likes: { user_id: string }[];
  is_liked?: boolean;
}

const Feed = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, [user]);

  const fetchDreams = async () => {
    try {
      // First get dreams and likes
      const { data: dreamsData, error: dreamsError } = await supabase
        .from('dreams')
        .select(`
          id,
          title,
          content,
          ai_analysis,
          ai_image_url,
          created_at,
          user_id,
          likes (
            user_id
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (dreamsError) throw dreamsError;

      // Get unique user IDs
      const userIds = [...new Set(dreamsData?.map(dream => dream.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a profile lookup map
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      // Combine dreams with profiles
      const dreamsWithProfiles = dreamsData?.map(dream => ({
        ...dream,
        profiles: profilesMap.get(dream.user_id) || null,
        is_liked: dream.likes.some(like => like.user_id === user?.id)
      })) || [];

      setDreams(dreamsWithProfiles);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error('Failed to load dreams');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (dreamId: string) => {
    if (!user) {
      toast.error('Please sign in to like dreams');
      return;
    }

    try {
      const dream = dreams.find(d => d.id === dreamId);
      const isLiked = dream?.is_liked;

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('dream_id', dreamId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ dream_id: dreamId, user_id: user.id });
      }

      // Update local state
      setDreams(prev => prev.map(d => 
        d.id === dreamId 
          ? { 
              ...d, 
              is_liked: !isLiked,
              likes: isLiked 
                ? d.likes.filter(l => l.user_id !== user.id)
                : [...d.likes, { user_id: user.id }]
            }
          : d
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-16">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dreams...</p>
        </div>
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-16 px-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">No dreams yet</h2>
          <p className="text-muted-foreground">
            Be the first to share your dreams with the world!
          </p>
          <Button 
            onClick={() => window.location.href = '/create'}
            className="bg-gradient-to-r from-primary to-accent"
          >
            Share Your First Dream
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="space-y-6 p-4">
        {dreams.map((dream) => (
          <Card key={dream.id} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50">
            {/* Dream Image */}
            {dream.ai_image_url && (
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={dream.ai_image_url}
                  alt={dream.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={dream.profiles?.avatar_url} />
                    <AvatarFallback>
                      {dream.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {dream.profiles?.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      {formatDistanceToNow(new Date(dream.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dream Content */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{dream.title}</h3>
                {dream.ai_analysis && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {dream.ai_analysis}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(dream.id)}
                  className={`flex items-center space-x-2 ${
                    dream.is_liked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={dream.is_liked ? 'fill-current' : ''} 
                  />
                  <span className="text-sm">{dream.likes.length}</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Feed;