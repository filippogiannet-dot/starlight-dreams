import { useState } from 'react';
import { Bell, Heart, UserPlus, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const notifications = [
  {
    id: '1',
    type: 'like',
    username: 'cosmic_dreamer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    message: 'liked your dream "Flying Over Mountains"',
    timestamp: '2 min ago',
    isRead: false,
    dreamTitle: 'Flying Over Mountains'
  },
  {
    id: '2',
    type: 'follow',
    username: 'night_walker',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    message: 'started following you',
    timestamp: '15 min ago',
    isRead: false
  },
  {
    id: '3',
    type: 'system',
    message: 'Your dream video "Ocean Waves" is now trending!',
    timestamp: '1 hour ago',
    isRead: true,
    dreamTitle: 'Ocean Waves'
  },
  {
    id: '4',
    type: 'like',
    username: 'star_gazer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    message: 'liked your dream "Lost in Space"',
    timestamp: '3 hours ago',
    isRead: true,
    dreamTitle: 'Lost in Space'
  },
  {
    id: '5',
    type: 'follow',
    username: 'dream_weaver',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    message: 'started following you',
    timestamp: '1 day ago',
    isRead: true
  }
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" size={20} />;
      case 'follow':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'system':
        return <Star className="text-yellow-500" size={20} />;
      default:
        return <Bell className="text-primary" size={20} />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'likes') return notification.type === 'like';
    if (activeTab === 'follows') return notification.type === 'follow';
    return true; // 'all' tab
  });

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-primary" size={24} />
            <h1 className="text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Settings size={20} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="follows">Follows</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center bg-card/50">
                <Bell className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'unread' 
                    ? "You're all caught up! No new notifications." 
                    : "When someone interacts with your dreams, you'll see it here."}
                </p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 cursor-pointer hover:scale-[1.02] transition-transform ${
                    !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon or Avatar */}
                    <div className="flex-shrink-0">
                      {notification.type === 'system' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      ) : (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            {notification.username?.[0]?.toUpperCase() || 'N'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">
                            {notification.username && (
                              <span className="font-semibold">@{notification.username} </span>
                            )}
                            <span>{notification.message}</span>
                          </p>
                          {notification.dreamTitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{notification.dreamTitle}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Mark All as Read */}
        {unreadCount > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full">
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;