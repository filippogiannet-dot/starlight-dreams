import React, { useState } from 'react';
import { Heart, Bookmark, Play, Clock, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FeedItem } from '@/modules/feed/types';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { cn } from '@/lib/utils';

interface FeedCardProps {
  item: FeedItem;
  onStart: (item: FeedItem) => void;
  onLike: (itemId: string) => void;
  onSave: (itemId: string) => void;
  className?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  item,
  onStart,
  onLike,
  onSave,
  className
}) => {
  const { trackInteraction } = useUserTracking();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = async () => {
    setIsGenerating(true);
    await trackInteraction('session_start', item.id, { type: item.type });
    onStart(item);
    setIsGenerating(false);
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await trackInteraction(isLiked ? 'unlike' : 'like', item.id);
    onLike(item.id);
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    await trackInteraction(isSaved ? 'unsave' : 'save', item.id);
    onSave(item.id);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      meditation: 'bg-gradient-to-r from-blue-500 to-purple-500',
      breathing: 'bg-gradient-to-r from-green-500 to-teal-500',
      sleep: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      focus: 'bg-gradient-to-r from-orange-500 to-red-500',
      anxiety: 'bg-gradient-to-r from-pink-500 to-rose-500'
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  return (
    <Card className={cn(
      "card-mindful p-6 space-y-4 animate-fade-in",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {item.user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.user.avatar_url} />
              <AvatarFallback>
                {item.user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <Badge 
              className={cn(
                "text-white border-0",
                getCategoryColor(item.category)
              )}
            >
              {item.category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <Clock className="h-4 w-4 mr-1" />
          {item.duration || 10} min
        </div>
      </div>

      {/* Image */}
      {item.imageUrl && (
        <div className="relative overflow-hidden rounded-xl aspect-video">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Metadata */}
      {item.metadata && (
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {item.metadata.difficulty && (
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {item.metadata.difficulty}
            </span>
          )}
          {item.metadata.tags && (
            <div className="flex space-x-1">
              {item.metadata.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "btn-mindful",
              isLiked && "text-red-500"
            )}
          >
            <Heart className={cn(
              "h-4 w-4 mr-1",
              isLiked && "fill-current"
            )} />
            Like
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={cn(
              "btn-mindful",
              isSaved && "text-yellow-500"
            )}
          >
            <Bookmark className={cn(
              "h-4 w-4 mr-1",
              isSaved && "fill-current"
            )} />
            Save
          </Button>
        </div>

        <Button
          onClick={handleStart}
          disabled={isGenerating}
          className={cn(
            "btn-mindful bg-primary hover:bg-primary/90 text-primary-foreground",
            "animate-glow"
          )}
        >
          {isGenerating ? (
            <div className="loading-pulse flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </div>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Start Session
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};