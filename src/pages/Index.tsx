import React from 'react';
import { Play, Sparkles, TrendingUp, Clock, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeed } from '@/modules/feed/hooks/useFeed';
import { FeedCard } from '@/components/feed/FeedCard';
import { LoadingCard } from '@/components/feed/LoadingCard';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, loading, loadMore, hasMore } = useFeed();
  const { trackInteraction } = useUserTracking();

  const quickActions = [
    {
      id: '1',
      title: 'Quick Meditation',
      description: 'Start a 5-minute mindfulness session',
      duration: 5,
      icon: Play,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      category: 'meditation'
    },
    {
      id: '2', 
      title: 'Breathing Exercise',
      description: 'Guided breathing for instant calm',
      duration: 3,
      icon: Sparkles,
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      category: 'breathing'
    },
    {
      id: '3',
      title: 'Focus Session',
      description: 'Enhance concentration and clarity',
      duration: 10,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      category: 'focus'
    }
  ];

  const handleQuickStart = async (action: typeof quickActions[0]) => {
    await trackInteraction('quick_start', action.id, { category: action.category });
    // TODO: Implement session start logic
  };

  const handleFeedAction = async (action: string, itemId: string) => {
    await trackInteraction(action, itemId);
    // TODO: Implement feed actions (like, save, start)
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-6 mb-6">
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-4 animate-glow">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Your Mindful Journey
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Discover personalized meditation, breathing exercises, and mindfulness practices tailored just for you.
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-mindful bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              Start Your Journey
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6 px-4">
        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quick Start</h2>
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Personalized
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Card 
                key={action.id} 
                className="card-mindful p-4 cursor-pointer transition-mindful hover:scale-[1.02]"
                onClick={() => handleQuickStart(action)}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", action.color)}>
                    <action.icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {action.duration}m
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Personalized Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended for You</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/feed')}
              className="btn-mindful"
            >
              View All
            </Button>
          </div>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          )}

          {items.slice(0, 3).map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              onStart={(item) => handleFeedAction('start_session', item.id)}
              onLike={(itemId) => handleFeedAction('like', itemId)}
              onSave={(itemId) => handleFeedAction('save', itemId)}
              className="animate-fade-in"
            />
          ))}

          {items.length === 0 && !loading && (
            <Card className="card-mindful p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Heart className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Your Journey Awaits</h3>
                  <p className="text-muted-foreground">
                    Start with a quick meditation to receive personalized recommendations.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;