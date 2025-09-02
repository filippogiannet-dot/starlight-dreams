import React, { useState } from 'react';
import { Sparkles, Mic, Settings, Zap, Play, Save, Share2, Wand2, Moon, Video, Brain, Download, RefreshCw } from 'lucide-react';
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

const CreateSession = () => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  
  // Shared states
  const [activeTab, setActiveTab] = useState('session');
  const [isRecording, setIsRecording] = useState(false);
  
  // Session Generator states
  const [sessionPrompt, setSessionPrompt] = useState('');
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionType, setSessionType] = useState('meditation');
  const [duration, setDuration] = useState([10]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [generatedSession, setGeneratedSession] = useState<any>(null);
  
  // Dream Analysis states
  const [dreamText, setDreamText] = useState('');
  const [isAnalyzingDream, setIsAnalyzingDream] = useState(false);
  const [dreamAnalysis, setDreamAnalysis] = useState<any>(null);
  const [dreamProgress, setDreamProgress] = useState(0);
  
  // Video Generation states
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [videoStyle, setVideoStyle] = useState('cinematic');

  const sessionTypes = [
    { value: 'meditation', label: '🧘 Meditation', desc: 'Mindfulness and awareness' },
    { value: 'breathing', label: '🌬️ Breathing', desc: 'Breath-focused exercises' },
    { value: 'body-scan', label: '🎯 Body Scan', desc: 'Progressive relaxation' },
    { value: 'loving-kindness', label: '💚 Loving Kindness', desc: 'Compassion practice' },
    { value: 'sleep', label: '🌙 Sleep', desc: 'Rest and recovery' },
    { value: 'focus', label: '⚡ Focus', desc: 'Concentration training' }
  ];

  const videoStyles = [
    { value: 'cinematic', label: '🎬 Cinematic', desc: 'Movie-like quality with dramatic lighting' },
    { value: 'nature', label: '🌿 Nature', desc: 'Natural scenes and environments' },
    { value: 'abstract', label: '🎨 Abstract', desc: 'Artistic and surreal visuals' },
    { value: 'minimal', label: '⚪ Minimal', desc: 'Clean and simple aesthetics' },
    { value: 'dreamy', label: '☁️ Dreamy', desc: 'Soft, ethereal atmosphere' }
  ];

  // Session Generation
  const handleGenerateSession = async () => {
    if (!sessionPrompt.trim()) {
      toast({
        title: "Missing input",
        description: "Please describe what kind of session you'd like",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate custom sessions",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSession(true);
    setSessionProgress(0);

    await trackInteraction('session_generation_start', 'custom', {
      sessionType,
      duration: duration[0],
      difficulty,
      promptLength: sessionPrompt.length
    });

    const progressSteps = [15, 35, 60, 80, 95, 100];
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setSessionProgress(progressSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
        
        const session = {
          id: `custom-${Date.now()}`,
          title: generateSessionTitle(sessionType, sessionPrompt),
          description: generateSessionDescription(sessionType, sessionPrompt),
          type: sessionType,
          duration: duration[0],
          difficulty,
          script: generateSessionScript(sessionType, duration[0], sessionPrompt),
          audioUrl: null,
          createdAt: new Date().toISOString()
        };
        
        setGeneratedSession(session);
        setIsGeneratingSession(false);
        
        toast({
          title: "Session Generated! 🎉",
          description: `Your ${duration[0]}-minute ${sessionType} session is ready`,
        });

        trackInteraction('session_generation_complete', session.id, {
          sessionType,
          duration: duration[0],
          difficulty
        });
      }
    }, 800);
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

  // Video Generation (Mock Implementation - Ready for Real API)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast({
        title: "Missing video prompt",
        description: "Please describe the video you'd like to create",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate videos",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);

    await trackInteraction('video_generation_start', 'video', {
      promptLength: videoPrompt.length,
      style: videoStyle
    });

    // Simulate video generation process (typically takes longer)
    const progressSteps = [10, 25, 45, 65, 85, 100];
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setVideoProgress(progressSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
        
        // Mock video generation - Replace with real API call
        const video = generateVideoResult(videoPrompt, videoStyle);
        
        setGeneratedVideo(video);
        setIsGeneratingVideo(false);
        
        toast({
          title: "Video Generated! 🎬",
          description: "Your video is ready to view",
        });

        trackInteraction('video_generation_complete', video.id);
      }
    }, 1500);
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

  const generateVideoResult = (prompt: string, style: string) => {
    const mockVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
    
    return {
      id: `video-${Date.now()}`,
      prompt,
      style,
      videoUrl: mockVideos[Math.floor(Math.random() * mockVideos.length)],
      thumbnailUrl: '/placeholder.svg',
      duration: '0:15',
      resolution: '1280x720',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
  };

  const generateSessionTitle = (type: string, prompt: string) => {
    const titles: Record<string, string[]> = {
      meditation: ['Peaceful Awareness', 'Mindful Presence', 'Inner Stillness'],
      breathing: ['Calming Breaths', 'Breath Awareness', 'Rhythmic Flow'],
      'body-scan': ['Full Body Relaxation', 'Progressive Peace', 'Body Awareness'],
      'loving-kindness': ['Heart Opening', 'Compassionate Mind', 'Loving Awareness'],
      sleep: ['Deep Rest', 'Peaceful Slumber', 'Sleep Sanctuary'],
      focus: ['Clear Mind', 'Focused Attention', 'Mental Clarity']
    };
    
    const typeBasedTitles = titles[type] || titles.meditation;
    const randomTitle = typeBasedTitles[Math.floor(Math.random() * typeBasedTitles.length)];
    
    if (prompt.toLowerCase().includes('stress')) return `Stress Relief ${randomTitle}`;
    if (prompt.toLowerCase().includes('anxiety')) return `Anxiety Soothing ${randomTitle}`;
    if (prompt.toLowerCase().includes('energy')) return `Energy Boosting ${randomTitle}`;
    
    return randomTitle;
  };

  const generateSessionDescription = (type: string, prompt: string) => {
    return `A personalized ${type} session crafted based on your needs. This practice will guide you through techniques designed to help you achieve a state of calm and presence.`;
  };

  const generateSessionScript = (type: string, duration: number, prompt: string) => {
    return `This is a ${duration}-minute ${type} session. Begin by finding a comfortable position and taking three deep breaths...`;
  };

  const handleVoiceInput = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice input",
        description: "Listening... (This is a demo feature)",
      });
      
      setTimeout(() => {
        const currentPrompt = activeTab === 'session' ? sessionPrompt : 
                           activeTab === 'dream' ? dreamText : videoPrompt;
        const addition = activeTab === 'session' ? " I need help with relaxation and stress relief" :
                        activeTab === 'dream' ? " I was flying over a beautiful landscape" :
                        " A peaceful sunset over calm ocean waves";
        
        if (activeTab === 'session') setSessionPrompt(prev => prev + addition);
        else if (activeTab === 'dream') setDreamText(prev => prev + addition);
        else setVideoPrompt(prev => prev + addition);
        
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
            <Wand2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Creation Studio</h1>
            <p className="text-sm text-muted-foreground">Generate sessions, analyze dreams & create videos</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Sparkles size={16} />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="dream" className="flex items-center gap-2">
              <Moon size={16} />
              Dreams
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video size={16} />
              Videos
            </TabsTrigger>
          </TabsList>

          {/* SESSION GENERATOR TAB */}
          <TabsContent value="session" className="space-y-6">
            {!generatedSession ? (
              <>
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Describe Your Needs</h2>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="I'm feeling stressed from work and need help relaxing. I'd like something to calm my mind and release tension in my body. Maybe something with gentle breathing and body awareness..."
                        value={sessionPrompt}
                        onChange={(e) => setSessionPrompt(e.target.value)}
                        className="min-h-[120px] bg-background/50 resize-none pr-12 transition-mindful"
                        maxLength={500}
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
                      <span>Be specific for better personalization</span>
                      <span>{sessionPrompt.length}/500</span>
                    </div>
                  </div>
                </Card>

                <Card className="card-mindful p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Settings className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Session Settings</h2>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Session Type</label>
                      <Select value={sessionType} onValueChange={setSessionType}>
                        <SelectTrigger className="bg-background/50 transition-mindful">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sessionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col items-start">
                                <span>{type.label}</span>
                                <span className="text-xs text-muted-foreground">{type.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Duration</label>
                        <Badge variant="outline">{duration[0]} minutes</Badge>
                      </div>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        max={60}
                        min={3}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Experience Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="bg-background/50 transition-mindful">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">🌱 Beginner</SelectItem>
                          <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                          <SelectItem value="advanced">🌳 Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {isGeneratingSession && (
                  <Card className="card-mindful p-6 animate-breathe">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="text-primary animate-pulse" size={20} />
                        <h3 className="font-semibold">Creating Your Session...</h3>
                      </div>
                      <Progress value={sessionProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {sessionProgress < 20 ? 'Analyzing your request...' :
                         sessionProgress < 40 ? 'Crafting session structure...' :
                         sessionProgress < 65 ? 'Generating guided content...' :
                         sessionProgress < 85 ? 'Adding personalization...' :
                         sessionProgress < 100 ? 'Finalizing session...' :
                         'Session ready!'}
                      </p>
                    </div>
                  </Card>
                )}

                <Button 
                  onClick={handleGenerateSession}
                  disabled={isGeneratingSession || !sessionPrompt.trim()}
                  className="w-full h-12 btn-mindful bg-gradient-to-r from-primary to-accent text-white font-semibold animate-glow"
                >
                  {isGeneratingSession ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      Generating Session...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 size={20} />
                      Generate Custom Session
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <Card className="card-mindful p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Custom Session</h2>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                      Generated
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">{generatedSession.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {generatedSession.description}
                    </p>
                  </div>

                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <Button size="lg" className="btn-mindful bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20">
                      <Play className="mr-2" size={24} />
                      Start Session
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleSave('session', generatedSession)} className="btn-mindful">
                      <Save className="mr-2" size={16} />
                      Save Session
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('session', generatedSession)} className="btn-mindful">
                      <Share2 className="mr-2" size={16} />
                      Share
                    </Button>
                  </div>

                  <Button 
                    onClick={() => setGeneratedSession(null)}
                    variant="outline" 
                    className="w-full btn-mindful"
                  >
                    Generate Another Session
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

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

          {/* VIDEO GENERATION TAB */}
          <TabsContent value="video" className="space-y-6">
            {!generatedVideo ? (
              <>
                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Video className="text-primary" size={20} />
                      <h2 className="text-lg font-semibold">Describe Your Video</h2>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="A peaceful sunset over calm ocean waves. The camera slowly pans across the horizon as seagulls fly by. The golden light reflects on the water creating a meditative atmosphere..."
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        className="min-h-[120px] bg-background/50 resize-none pr-12 transition-mindful"
                        maxLength={500}
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
                      <span>Describe the scene, mood, and visual elements</span>
                      <span>{videoPrompt.length}/500</span>
                    </div>
                  </div>
                </Card>

                <Card className="card-mindful p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="text-primary" size={20} />
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
                        <h3 className="font-semibold">Generating Your Video...</h3>
                      </div>
                      <Progress value={videoProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {videoProgress < 20 ? 'Setting up scene...' :
                         videoProgress < 40 ? 'Rendering frames...' :
                         videoProgress < 70 ? 'Adding effects...' :
                         videoProgress < 90 ? 'Finalizing video...' :
                         'Video ready!'}
                      </p>
                    </div>
                  </Card>
                )}

                <Button 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  className="w-full h-12 btn-mindful bg-gradient-to-r from-primary to-accent text-white font-semibold animate-glow"
                >
                  {isGeneratingVideo ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      Generating Video...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Video size={20} />
                      Generate Video
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <Card className="card-mindful p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Generated Video</h2>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                      Ready
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-muted-foreground">{generatedVideo.prompt}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{generatedVideo.style}</Badge>
                      <Badge variant="outline">{generatedVideo.duration}</Badge>
                      <Badge variant="outline">{generatedVideo.resolution}</Badge>
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

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" onClick={() => handleSave('video', generatedVideo)} className="btn-mindful">
                      <Download className="mr-2" size={16} />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('video', generatedVideo)} className="btn-mindful">
                      <Share2 className="mr-2" size={16} />
                      Share
                    </Button>
                  </div>

                  <Button 
                    onClick={() => setGeneratedVideo(null)}
                    variant="outline" 
                    className="w-full btn-mindful"
                  >
                    Generate Another Video
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateSession;
