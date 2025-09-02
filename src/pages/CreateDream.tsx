import React, { useState } from 'react';
import { Mic, Save, Share2, Moon, Video, Brain, Download, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DreamStudio = () => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  
  // Shared states
  const [activeTab, setActiveTab] = useState('dream');
  const [isRecording, setIsRecording] = useState(false);
  
  // Dream Analysis states
  const [dreamText, setDreamText] = useState('');
  const [isAnalyzingDream, setIsAnalyzingDream] = useState(false);
  const [dreamAnalysis, setDreamAnalysis] = useState<any>(null);
  const [dreamProgress, setDreamProgress] = useState(0);
  
  // Video Generation states (based on dream analysis)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [isPostingToFeed, setIsPostingToFeed] = useState(false);

  const videoStyles = [
    { value: 'cinematic', label: '🎬 Cinematic', desc: 'Movie-like quality with dramatic lighting' },
    { value: 'surreal', label: '🌀 Surreal', desc: 'Dream-like and fantastical' },
    { value: 'peaceful', label: '☁️ Peaceful', desc: 'Calm and serene atmosphere' },
    { value: 'vivid', label: '🎨 Vivid', desc: 'Bright colors and sharp details' },
    { value: 'ethereal', label: '✨ Ethereal', desc: 'Mystical and otherworldly' }
  ];

  // Reset states when switching tabs
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === 'dream') {
      setGeneratedVideo(null);
    }
  };

  // Dream Analysis (Mock Implementation - Ready for Real API)
  const handleAnalyzeDream = async () => {
    if (!dreamText.trim()) {
      toast({
        title: "Missing dream description",
        description: "Please describe your dream to get an analysis",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to analyze dreams",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzingDream(true);
    setDreamProgress(0);

    await trackInteraction('dream_analysis_start', 'analysis', {
      dreamLength: dreamText.length
    });

    // Simulate AI analysis process
    const progressSteps = [20, 45, 70, 90, 100];
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setDreamProgress(progressSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
        
        // Mock dream analysis - Replace with real API call
        const analysis = generateDreamAnalysis(dreamText);
        
        setDreamAnalysis(analysis);
        setIsAnalyzingDream(false);
        
        toast({
          title: "Dream Analysis Complete! 🧠",
          description: "Your dream interpretation is ready",
        });

        trackInteraction('dream_analysis_complete', analysis.id);
      }
    }, 1000);
  };

  // Dream-to-Video Generation
  const handleGenerateDreamVideo = async () => {
    if (!dreamAnalysis) {
      toast({
        title: "No dream to visualize",
        description: "Please analyze a dream first before creating a video",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate dream videos",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);

    await trackInteraction('dream_video_generation_start', dreamAnalysis.id, {
      dreamTheme: dreamAnalysis.mainTheme,
      videoStyle
    });

    // Simulate video generation process
    const progressSteps = [15, 35, 55, 75, 90, 100];
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setVideoProgress(progressSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
        
        // Generate video based on dream analysis
        const video = generateDreamVideo(dreamAnalysis, videoStyle);
        
        setGeneratedVideo(video);
        setIsGeneratingVideo(false);
        
        toast({
          title: "Dream Video Created! 🎬",
          description: "Your dream has been brought to life",
        });

        trackInteraction('dream_video_generation_complete', video.id);
      }
    }, 1200);
  };

  // Post dream video to feed
  const handlePostToFeed = async () => {
    if (!generatedVideo || !dreamAnalysis) return;
    
    setIsPostingToFeed(true);
    
    try {
      await trackInteraction('dream_video_posted', generatedVideo.id, {
        dreamTheme: dreamAnalysis.mainTheme,
        videoStyle: generatedVideo.style
      });
      
      // Simulate posting to feed (replace with real implementation)
      setTimeout(() => {
        setIsPostingToFeed(false);
        toast({
          title: "Posted to Feed! 📱",
          description: "Your dream video is now shared with the community",
        });
      }, 2000);
    } catch (error) {
      setIsPostingToFeed(false);
      toast({
        title: "Failed to post",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Mock generation functions (Replace with real API calls)
  const generateDreamAnalysis = (dreamText: string) => {
    const themes = ['transformation', 'anxiety', 'freedom', 'relationships', 'creativity', 'fear', 'success', 'healing'];
    const emotions = ['curious', 'anxious', 'hopeful', 'confused', 'peaceful', 'excited', 'concerned', 'inspired'];
    
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      id: `dream-${Date.now()}`,
      originalDream: dreamText,
      mainTheme: randomTheme,
      emotion: randomEmotion,
      interpretation: `Your dream appears to center around themes of ${randomTheme}. The imagery suggests you may be feeling ${randomEmotion} about recent changes in your life. This dream could represent your subconscious processing of personal growth and transformation. The symbols in your dream often reflect your inner emotional state and desires for the future.`,
      keySymbols: [
        { symbol: 'Water', meaning: 'Emotional flow and cleansing' },
        { symbol: 'Flying', meaning: 'Freedom and transcendence' },
        { symbol: 'Animals', meaning: 'Instinctual wisdom and nature connection' }
      ],
      psychologicalInsights: `From a psychological perspective, this dream may indicate your mind's way of processing ${randomTheme}-related experiences. It suggests a healthy subconscious dialogue about your life's direction.`,
      recommendations: [
        'Practice mindfulness meditation',
        'Keep a dream journal',
        'Reflect on recent life changes',
        'Consider talking to a counselor if themes persist'
      ],
      createdAt: new Date().toISOString()
    };
  };

  const generateDreamVideo = (dreamAnalysis: any, style: string) => {
    const mockVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
    
    // Create video prompt based on dream analysis
    const dreamPrompt = `${dreamAnalysis.originalDream} - visualized in ${style} style with themes of ${dreamAnalysis.mainTheme}`;
    
    return {
      id: `dream-video-${Date.now()}`,
      dreamId: dreamAnalysis.id,
      dreamTheme: dreamAnalysis.mainTheme,
      prompt: dreamPrompt,
      style,
      videoUrl: mockVideos[Math.floor(Math.random() * mockVideos.length)],
      thumbnailUrl: '/placeholder.svg',
      duration: '0:20',
      resolution: '1280x720',
      status: 'completed',
      createdAt: new Date().toISOString(),
      tags: ['dream', dreamAnalysis.mainTheme, style]
    };
  };


  const handleVoiceInput = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice input",
        description: "Listening... (This is a demo feature)",
      });
      
      setTimeout(() => {
        if (activeTab === 'dream') {
          setDreamText(prev => prev + " I was flying over a beautiful landscape with mountains and rivers below");
        }
        
        setIsRecording(false);
        toast({
          title: "Voice captured",
          description: "Your input has been added",
        });
      }, 2000);
    }
  };

  const handleSave = async (type: string, item: any) => {
    await trackInteraction(`${type}_saved`, item.id);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Saved`,
      description: "Added to your personal library",
    });
  };

  const handleShare = async (type: string, item: any) => {
    await trackInteraction(`${type}_shared`, item.id);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Shared`,
      description: "Share link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-glow">
            <Moon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Dream Studio</h1>
            <p className="text-sm text-muted-foreground">Analyze dreams & bring them to life</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dream" className="flex items-center gap-2">
              <Moon size={16} />
              Dream Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center gap-2"
              disabled={!dreamAnalysis}
            >
              <Video size={16} />
              Dream to Video
            </TabsTrigger>
          </TabsList>


          {/* DREAM ANALYSIS TAB */}
          <TabsContent value="dream" className="space-y-6">
            {!dreamAnalysis ? (
              <>
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Moon className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Describe Your Dream</h2>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="I had a dream where I was flying over a beautiful landscape. There were mountains in the distance and I felt completely free and peaceful. I could see a river flowing below me, and there were birds flying alongside me..."
                        value={dreamText}
                        onChange={(e) => setDreamText(e.target.value)}
                        className="min-h-[150px] bg-background/50 resize-none pr-12 transition-mindful"
                        maxLength={1000}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoiceInput}
                        className={cn(
                          "absolute bottom-2 right-2 btn-mindful",
                          isRecording && "text-red-500"
                        )}
                      >
                        <Mic size={16} className={isRecording ? "animate-pulse" : ""} />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Include as many details as you remember</span>
                      <span>{dreamText.length}/1000</span>
                    </div>
                  </div>
                </Card>

                {isAnalyzingDream && (
                  <Card className="card-mindful p-6 animate-breathe">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Brain className="text-primary animate-pulse" size={20} />
                        <h3 className="font-semibold">Analyzing Your Dream...</h3>
                      </div>
                      <Progress value={dreamProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {dreamProgress < 30 ? 'Processing dream symbols...' :
                         dreamProgress < 60 ? 'Identifying psychological patterns...' :
                         dreamProgress < 90 ? 'Generating interpretation...' :
                         'Analysis complete!'}
                      </p>
                    </div>
                  </Card>
                )}

                <Button 
                  onClick={handleAnalyzeDream}
                  disabled={isAnalyzingDream || !dreamText.trim()}
                  className="w-full h-12 btn-mindful bg-gradient-to-r from-primary to-accent text-white font-semibold animate-glow"
                >
                  {isAnalyzingDream ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      Analyzing Dream...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Brain size={20} />
                      Analyze Dream
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Dream Analysis</h2>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        Complete
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Main Theme: {dreamAnalysis.mainTheme}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {dreamAnalysis.interpretation}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Symbols:</h4>
                        <div className="space-y-2">
                          {dreamAnalysis.keySymbols.map((symbol: any, index: number) => (
                            <div key={index} className="bg-background/50 p-3 rounded-lg">
                              <span className="font-medium">{symbol.symbol}:</span>
                              <span className="text-muted-foreground ml-2">{symbol.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Psychological Insights:</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {dreamAnalysis.psychologicalInsights}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {dreamAnalysis.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleSave('dream', dreamAnalysis)} className="btn-mindful">
                        <Save className="mr-2" size={16} />
                        Save Analysis
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare('dream', dreamAnalysis)} className="btn-mindful">
                        <Share2 className="mr-2" size={16} />
                        Share
                      </Button>
                    </div>

                    <Button 
                      onClick={() => setDreamAnalysis(null)}
                      variant="outline" 
                      className="w-full btn-mindful"
                    >
                      Analyze Another Dream
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* DREAM TO VIDEO TAB */}
          <TabsContent value="video" className="space-y-6">
            {!dreamAnalysis ? (
              <Card className="card-mindful p-6 text-center">
                <div className="space-y-4">
                  <Moon className="text-muted-foreground mx-auto" size={48} />
                  <h2 className="text-lg font-semibold">Analyze a Dream First</h2>
                  <p className="text-muted-foreground">
                    You need to analyze a dream before you can create a video visualization of it.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('dream')}
                    variant="outline"
                    className="btn-mindful"
                  >
                    Go to Dream Analysis
                  </Button>
                </div>
              </Card>
            ) : !generatedVideo ? (
              <>
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Video className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Bring Your Dream to Life</h2>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Your Dream Summary:</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Theme:</strong> {dreamAnalysis.mainTheme}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dreamAnalysis.originalDream.substring(0, 200)}...
                      </p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      We'll create a video visualization based on your dream analysis, incorporating the key themes and symbols identified.
                    </p>
                  </div>
                </Card>

                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Video className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Video Style</h2>
                    </div>

                    <Select value={videoStyle} onValueChange={setVideoStyle}>
                      <SelectTrigger className="bg-background/50 transition-mindful">
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
                </Card>

                {isGeneratingVideo && (
                  <Card className="card-mindful p-6 animate-breathe">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Video className="text-primary animate-pulse" size={20} />
                        <h3 className="font-semibold">Creating Your Dream Video...</h3>
                      </div>
                      <Progress value={videoProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {videoProgress < 20 ? 'Interpreting dream imagery...' :
                         videoProgress < 40 ? 'Generating visual elements...' :
                         videoProgress < 60 ? 'Adding dream-like effects...' :
                         videoProgress < 80 ? 'Compositing scenes...' :
                         videoProgress < 100 ? 'Finalizing dream video...' :
                         'Dream video ready!'}
                      </p>
                    </div>
                  </Card>
                )}

                <Button 
                  onClick={handleGenerateDreamVideo}
                  disabled={isGeneratingVideo}
                  className="w-full h-12 btn-mindful bg-gradient-to-r from-primary to-accent text-white font-semibold animate-glow"
                >
                  {isGeneratingVideo ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      Creating Dream Video...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Video size={20} />
                      Create Dream Video
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Your Dream Video</h2>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        Ready
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-background/50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Dream Theme:</strong> {generatedVideo.dreamTheme}</p>
                        <p className="text-sm"><strong>Style:</strong> {generatedVideo.style}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {generatedVideo.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-full object-cover"
                        poster={generatedVideo.thumbnailUrl}
                      >
                        <source src={generatedVideo.videoUrl} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSave('video', generatedVideo)} 
                        className="btn-mindful"
                      >
                        <Save className="mr-2" size={16} />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleShare('video', generatedVideo)} 
                        className="btn-mindful"
                      >
                        <Download className="mr-2" size={16} />
                        Download
                      </Button>
                      <Button 
                        onClick={handlePostToFeed}
                        disabled={isPostingToFeed}
                        size="sm" 
                        className="btn-mindful bg-gradient-to-r from-primary to-accent text-white"
                      >
                        {isPostingToFeed ? (
                          <RefreshCw className="mr-2 animate-spin" size={16} />
                        ) : (
                          <Send className="mr-2" size={16} />
                        )}
                        Post to Feed
                      </Button>
                    </div>

                    <Button 
                      onClick={() => setGeneratedVideo(null)}
                      variant="outline" 
                      className="w-full btn-mindful"
                    >
                      Create Another Dream Video
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DreamStudio;
