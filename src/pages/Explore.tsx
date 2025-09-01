import { useState } from 'react';
import { Search, TrendingUp, Filter, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const trendingDreams = [
  {
    id: '1',
    title: 'Flying Over Cities',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    duration: '2:34',
    views: '12.5K',
    category: 'Flying',
    username: 'dreamer_sky'
  },
  {
    id: '2',
    title: 'Ocean of Stars',
    thumbnail: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=400&fit=crop',
    duration: '1:48',
    views: '8.9K',
    category: 'Fantasy',
    username: 'cosmic_mind'
  },
  {
    id: '3',
    title: 'Childhood Memories',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    duration: '3:12',
    views: '15.2K',
    category: 'Nostalgia',
    username: 'memory_lane'
  },
  {
    id: '4',
    title: 'Talking Animals',
    thumbnail: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
    duration: '2:05',
    views: '6.7K',
    category: 'Animals',
    username: 'wild_dreams'
  },
  {
    id: '5',
    title: 'Lost in Maze',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    duration: '4:23',
    views: '9.1K',
    category: 'Mystery',
    username: 'puzzle_walker'
  },
  {
    id: '6',
    title: 'Time Travel Adventure',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    duration: '3:56',
    views: '11.3K',
    category: 'Adventure',
    username: 'time_voyager'
  }
];

const categories = ['All', 'Flying', 'Fantasy', 'Nostalgia', 'Animals', 'Mystery', 'Adventure'];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDreams = trendingDreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dream.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dream.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search dreams, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/30 focus:bg-card"
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
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary" size={20} />
          <h2 className="text-lg font-semibold">Trending Dreams</h2>
        </div>

        {/* Dream Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredDreams.map((dream) => (
            <Card key={dream.id} className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:scale-105 transition-transform">
              <div className="relative aspect-square">
                <img
                  src={dream.thumbnail}
                  alt={dream.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="text-white fill-white" size={24} />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {dream.duration}
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {dream.category}
                  </Badge>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{dream.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>@{dream.username}</span>
                  <span>{dream.views} views</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full">
            Load More Dreams
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Explore;