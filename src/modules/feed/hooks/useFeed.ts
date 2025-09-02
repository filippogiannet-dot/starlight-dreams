import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeedItem, FeedFilters, FeedState, MeditationSession } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export const useFeed = () => {
  const { user } = useAuth();
  const [feedState, setFeedState] = useState<FeedState>({
    items: [],
    loading: false,
    error: null,
    hasMore: true,
    filters: {}
  });

  const fetchFeedItems = useCallback(async (
    filters: FeedFilters = {},
    offset = 0,
    append = false
  ) => {
    if (!user) return;

    try {
      setFeedState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch meditation sessions as feed items
      let query = supabase
        .from('meditation_sessions')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            bio
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.duration) {
        query = query.lte('duration_minutes', filters.duration);
      }

      const { data: sessions, error } = await query;

      if (error) throw error;

      const feedItems: FeedItem[] = sessions?.map((session: any) => ({
        id: session.id,
        type: 'meditation' as const,
        title: session.title,
        description: session.description || '',
        duration: session.duration_minutes,
        category: session.category,
        audioUrl: session.audio_url,
        user: session.profiles,
        created_at: session.created_at,
        metadata: {
          personalizedScore: Math.random() * 100 // Placeholder for recommendation score
        }
      })) || [];

      setFeedState(prev => ({
        ...prev,
        items: append ? [...prev.items, ...feedItems] : feedItems,
        loading: false,
        hasMore: feedItems.length === ITEMS_PER_PAGE,
        filters
      }));

    } catch (error: any) {
      console.error('Error fetching feed:', error);
      setFeedState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      toast({
        title: "Error",
        description: "Failed to load feed content",
        variant: "destructive"
      });
    }
  }, [user]);

  const loadMore = useCallback(() => {
    if (feedState.loading || !feedState.hasMore) return;
    fetchFeedItems(feedState.filters, feedState.items.length, true);
  }, [feedState.filters, feedState.items.length, feedState.loading, feedState.hasMore, fetchFeedItems]);

  const refreshFeed = useCallback(() => {
    fetchFeedItems(feedState.filters);
  }, [feedState.filters, fetchFeedItems]);

  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    const updatedFilters = { ...feedState.filters, ...newFilters };
    fetchFeedItems(updatedFilters);
  }, [feedState.filters, fetchFeedItems]);

  // Generate personalized content recommendation
  const generatePersonalizedContent = useCallback(async (prompt: string) => {
    try {
      // Placeholder for AI API call - ready for Replit integration
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          userId: user?.id,
          preferences: {} // Will be populated from user preferences
        })
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Content generation error:', error);
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFeedItems();
    }
  }, [user, fetchFeedItems]);

  return {
    ...feedState,
    loadMore,
    refreshFeed,
    updateFilters,
    generatePersonalizedContent
  };
};