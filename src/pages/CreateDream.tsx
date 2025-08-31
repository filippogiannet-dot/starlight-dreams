import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Mic, MicOff, Wand2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CreateDream = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to create dreams');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll create the dream without AI analysis/image generation
      // This can be enhanced later with actual AI integration
      const { error } = await supabase
        .from('dreams')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          is_public: isPublic,
          ai_analysis: "Dream analysis coming soon...", // Placeholder
          ai_image_url: null // Will be added with AI integration
        });

      if (error) throw error;

      toast.success(isPublic ? 'Dream shared publicly!' : 'Dream saved privately!');
      navigate('/');
    } catch (error) {
      console.error('Error creating dream:', error);
      toast.error('Failed to save dream');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    // Voice recording functionality will be implemented later
    setIsRecording(!isRecording);
    toast.info('Voice recording coming soon!');
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Share Your Dream</h1>
          <p className="text-muted-foreground">
            Transform your dreams into beautiful memories
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wand2 size={20} className="text-primary" />
              <span>Dream Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Dream Title</Label>
                <Input
                  id="title"
                  placeholder="Give your dream a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Dream Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleRecording}
                    className={`flex items-center space-x-1 ${
                      isRecording ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span className="text-xs">
                      {isRecording ? 'Stop' : 'Record'}
                    </span>
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Describe your dream in detail..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="bg-input/50 border-border/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="public">Share publicly</Label>
                  <p className="text-xs text-muted-foreground">
                    Let others see and like your dream
                  </p>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 smooth-transition"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Creating Dream...</span>
                  </div>
                ) : (
                  'Create Dream'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDream;