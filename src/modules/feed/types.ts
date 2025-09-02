// Feed Module Types
export interface MeditationSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  category: string;
  audio_url?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Additional computed fields
  user_profile?: UserProfile;
  is_liked?: boolean;
  likes_count?: number;
  progress?: SessionProgress;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface SessionProgress {
  id: string;
  user_id: string;
  session_id: string;
  progress_percentage: number;
  completed: boolean;
  completed_at?: string;
}

export interface FeedItem {
  id: string;
  type: 'meditation' | 'exercise' | 'tip' | 'achievement';
  title: string;
  description: string;
  duration?: number;
  category: string;
  imageUrl?: string;
  audioUrl?: string;
  user?: UserProfile;
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    personalizedScore?: number;
  };
  created_at: string;
}

export interface FeedFilters {
  category?: string;
  duration?: number;
  difficulty?: string;
  sortBy?: 'recent' | 'popular' | 'recommended' | 'duration';
}

export interface FeedState {
  items: FeedItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  filters: FeedFilters;
}