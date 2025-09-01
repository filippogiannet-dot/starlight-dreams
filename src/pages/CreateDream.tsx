import { useState } from 'react';
import { Sparkles, Video, Settings, Zap, Play, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const CreateDream = () => {
  const [dreamText, setDreamText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoDuration, setVideoDuration] = useState([30]);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!dreamText.trim()) {
      toast.error('Please describe your dream first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI video generation process
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          setGeneratedVideo('https://player.vimeo.com/video/76979871'); // Placeholder
          toast.success('Dream video generated successfully!');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const videoStyles = [
    { value: 'cinematic', label: '🎬 Cinematic', desc: 'Movie-like quality' },
    { value: 'dreamy', label: '✨ Dreamy', desc: 'Soft, ethereal feel' },
    { value: 'surreal', label: '🎨 Surreal', desc: 'Abstract and artistic' },
    { value: 'realistic', label: '📸 Realistic', desc: 'Photorealistic style' },
    { value: 'animated', label: '🎭 Animated', desc: 'Cartoon-like animation' }
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Dream Generator</h1>
            <p className="text-sm text-muted-foreground">Transform your dreams into videos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!generatedVideo ? (
          <>
            {/* Dream Input */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video className="text-primary" size={20} />
                  <h2 className="text-lg font-semibold">Describe Your Dream</h2>
                </div>
                <Textarea
                  placeholder="I was flying over a beautiful city at sunset, with golden light reflecting off glass buildings. The sky was painted in shades of purple and orange, and I could feel the wind beneath my wings..."
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  className="min-h-[120px] bg-background/50 resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Be detailed for better results</span>
                  <span>{dreamText.length}/500</span>
                </div>
              </div>
            </Card>

            {/* Video Settings */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Settings className="text-primary" size={20} />
                  <h2 className="text-lg font-semibold">Video Settings</h2>
                </div>

                {/* Style Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Video Style</label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div className="flex flex-col items-start">
                            <span>{style.label}</span>
                            <span className="text-xs text-muted-foreground">{style.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Duration</label>
                    <Badge variant="outline">{videoDuration[0]}s</Badge>
                  </div>
                  <Slider
                    value={videoDuration}
                    onValueChange={setVideoDuration}
                    max={60}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>15s</span>
                    <span>60s</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="p-6 bg-card/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary animate-pulse" size={20} />
                    <h3 className="font-semibold">Generating Your Dream Video...</h3>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {generationProgress < 30 ? 'Analyzing dream content...' :
                     generationProgress < 60 ? 'Creating visual elements...' :
                     generationProgress < 90 ? 'Applying artistic style...' :
                     'Finalizing video...'}
                  </p>
                </div>
              </Card>
            )}

            {/* Premium Features Placeholder */}
            <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <h3 className="font-semibold">Premium Features</h3>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">Coming Soon</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>HD Quality (1080p)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>No Watermark</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Extended Duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>Custom Music</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Watch Ad for Free HD Generation
                </Button>
              </div>
            </Card>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !dreamText.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-semibold"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  Generate Dream Video
                </div>
              )}
            </Button>
          </>
        ) : (
          /* Generated Video Result */
          <div className="space-y-6">
            <Card className="p-6 bg-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Dream Video</h2>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    Generated
                  </Badge>
                </div>
                
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Button size="lg" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    <Play className="mr-2" size={24} />
                    Play Video
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2" size={16} />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2" size={16} />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="mr-2" size={16} />
                    Post to Feed
                  </Button>
                </div>
              </div>
            </Card>

            {/* Generate Another */}
            <Button 
              onClick={() => {
                setGeneratedVideo(null);
                setDreamText('');
                setGenerationProgress(0);
              }}
              variant="outline" 
              className="w-full"
            >
              Generate Another Dream
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDream;