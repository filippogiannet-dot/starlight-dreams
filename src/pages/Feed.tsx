import React, { useState, useCallback } from 'react';
import { Filter, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useFeed } from '@/modules/feed/hooks/useFeed';
import { FeedCard } from '@/components/feed/FeedCard';
import { LoadingCard } from '@/components/feed/LoadingCard';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Feed = () => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const { 
    items, 
    loading, 
    hasMore, 
    filters, 
    loadMore, 
    refreshFeed, 
    updateFilters,
    generatePersonalizedContent 
  } = useFeed();

  const [localFilters, setLocalFilters] = useState(filters);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = [
    { id: 'meditation', name: 'Meditation', color: 'bg-blue-500' },
    { id: 'breathing', name: 'Breathing', color: 'bg-green-500' },
    { id: 'sleep', name: 'Sleep', color: 'bg-purple-500' },
    { id: 'focus', name: 'Focus', color: 'bg-orange-500' },
    { id: 'anxiety', name: 'Anxiety Relief', color: 'bg-pink-500' },
    { id: 'stress', name: 'Stress Relief', color: 'bg-teal-500' }
  ];

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    trackInteraction('filter_applied', 'feed', { filters: localFilters });
  };

  const handleGenerateContent = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate personalized content",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePersonalizedContent("Generate a meditation session based on my current needs");
      await refreshFeed();
      toast({
        title: "Content Generated",
        description: "New personalized content has been added to your feed",
      });
      trackInteraction('content_generated', 'feed');
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate content right now. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedAction = useCallback(async (action: string, itemId: string, metadata?: any) => {
    await trackInteraction(action, itemId, metadata);
    
    switch (action) {
      case 'start_session':
        // TODO: Navigate to session player
        break;
      case 'like':
        // TODO: Update like status
        break;
      case 'save':
        // TODO: Save to favorites
        break;
    }
  }, [trackInteraction]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">Mindful Feed</h1>
            <Badge variant="outline" className="text-xs">
              {items.length} sessions
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* AI Generate Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="btn-mindful"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshFeed}
              disabled={loading}
              className="btn-mindful"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="btn-mindful">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Content</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Categories */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Categories</h3>
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={localFilters.category === category.id}
                          onCheckedChange={(checked) => {
                            setLocalFilters(prev => ({
                              ...prev,
                              category: checked ? category.id : undefined
                            }));
                          }}
                        />
                        <label htmlFor={category.id} className="text-sm font-medium">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Max Duration</h3>
                      <Badge variant="outline">{localFilters.duration || 60} min</Badge>
                    </div>
                    <Slider
                      value={[localFilters.duration || 60]}
                      onValueChange={([value]) => setLocalFilters(prev => ({ ...prev, duration: value }))}
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Sort By</h3>
                    {['recent', 'popular', 'recommended', 'duration'].map((sort) => (
                      <div key={sort} className="flex items-center space-x-2">
                        <Checkbox
                          id={sort}
                          checked={localFilters.sortBy === sort}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setLocalFilters(prev => ({ ...prev, sortBy: sort as any }));
                            }
                          }}
                        />
                        <label htmlFor={sort} className="text-sm font-medium capitalize">
                          {sort}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleApplyFilters} className="w-full btn-mindful">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="space-y-4 p-4">
        {loading && items.length === 0 && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        )}

        {items.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onStart={(item) => handleFeedAction('start_session', item.id, { type: item.type })}
            onLike={(itemId) => handleFeedAction('like', itemId)}
            onSave={(itemId) => handleFeedAction('save', itemId)}
            className="animate-fade-in"
          />
        ))}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={loadMore}
              className="btn-mindful"
            >
              Load More Sessions
            </Button>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or generate new personalized content.
            </p>
            <Button 
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="btn-mindful bg-gradient-to-r from-primary to-accent text-white"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;