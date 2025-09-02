import React, { useState } from 'react';
import { Search, TrendingUp, Filter, Play, Clock, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { cn } from '@/lib/utils';

const trendingSessions = [
  {
    id: '1',
    title: 'Morning Mindfulness',
    description: 'Start your day with gentle awareness and intention setting',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    duration: 10,
    participants: '12.5K',
    category: 'morning',
    difficulty: 'beginner',
    instructor: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['mindfulness', 'morning', 'beginner']
  },
  {
    id: '2',
    title: 'Deep Breathing for Calm',
    description: 'Powerful breathing techniques to reduce stress instantly',
    thumbnail: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=400&fit=crop',
    duration: 5,
    participants: '8.9K',
    category: 'breathing',
    difficulty: 'beginner',
    instructor: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      rating: 4.8
    },
    tags: ['breathing', 'stress-relief', 'quick']
  },
  {
    id: '3',
    title: 'Focus Enhancement',
    description: 'Sharpen your concentration with advanced meditation',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    duration: 20,
    participants: '15.2K',
    category: 'focus',
    difficulty: 'advanced',
    instructor: {
      name: 'Dr. Michael Park',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['focus', 'concentration', 'advanced']
  },
  {
    id: '4',
    title: 'Sleep Preparation',
    description: 'Wind down peacefully for restorative sleep',
    thumbnail: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
    duration: 15,
    participants: '6.7K',
    category: 'sleep',
    difficulty: 'beginner',
    instructor: {
      name: 'Luna Williams',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
      rating: 4.7
    },
    tags: ['sleep', 'relaxation', 'evening']
  },
  {
    id: '5',
    title: 'Anxiety Relief',
    description: 'Gentle techniques to ease worry and find peace',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    duration: 12,
    participants: '9.1K',
    category: 'anxiety',
    difficulty: 'intermediate',
    instructor: {
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      rating: 4.8
    },
    tags: ['anxiety', 'calm', 'healing']
  },
  {
    id: '6',
    title: 'Body Scan Meditation',
    description: 'Progressive relaxation for full-body awareness',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    duration: 25,
    participants: '11.3K',
    category: 'body-scan',
    difficulty: 'intermediate',
    instructor: {
      name: 'James Kumar',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['body-scan', 'relaxation', 'mindfulness']
  }
];

const categories = [
  'All', 'Morning', 'Breathing', 'Focus', 'Sleep', 'Anxiety', 'Body-scan'
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { trackInteraction } = useUserTracking();

  const filteredSessions = trendingSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           session.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      morning: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      breathing: 'bg-gradient-to-r from-green-400 to-teal-400',
      focus: 'bg-gradient-to-r from-blue-400 to-purple-400',
      sleep: 'bg-gradient-to-r from-purple-400 to-indigo-400',
      anxiety: 'bg-gradient-to-r from-pink-400 to-rose-400',
      'body-scan': 'bg-gradient-to-r from-teal-400 to-cyan-400'
    };
    return colors[category] || 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const handleSessionClick = async (session: typeof trendingSessions[0]) => {
    await trackInteraction('session_preview', session.id, {
      category: session.category,
      difficulty: session.difficulty,
      duration: session.duration
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search meditations, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/30 focus:bg-card transition-mindful"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "whitespace-nowrap btn-mindful",
                  selectedCategory === category && "bg-primary text-primary-foreground"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-primary" size={20} />
          <h2 className="text-lg font-semibold">Popular Sessions</h2>
          <Badge variant="secondary" className="ml-auto">
            {filteredSessions.length} sessions
          </Badge>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className="card-mindful overflow-hidden cursor-pointer group"
              onClick={() => handleSessionClick(session)}
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={session.thumbnail}
                  alt={session.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                    <Play className="text-white fill-white" size={28} />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {session.duration}m
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    className={cn(
                      "text-white border-0 text-xs",
                      getDifficultyColor(session.difficulty)
                    )}
                  >
                    {session.difficulty}
                  </Badge>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={cn(
                      "text-white border-0 text-xs",
                      getCategoryColor(session.category)
                    )}
                  >
                    {session.category}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{session.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {session.description}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.instructor.avatar} />
                    <AvatarFallback>
                      {session.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.instructor.name}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">{session.instructor.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="w-3 h-3 mr-1" />
                    {session.participants}
                  </div>
                  <div className="flex space-x-1">
                    {session.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredSessions.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" className="w-full sm:w-auto btn-mindful">
              Load More Sessions
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Search className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;