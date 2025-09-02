import React, { useState } from 'react';
import { Sparkles, Mic, Settings, Zap, Play, Save, Share2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useUserTracking } from '@/modules/tracking/useUserTracking';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CreateSession = () => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sessionType, setSessionType] = useState('meditation');
  const [duration, setDuration] = useState([10]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [generatedSession, setGeneratedSession] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const sessionTypes = [
    { value: 'meditation', label: '🧘 Meditation', desc: 'Mindfulness and awareness' },
    { value: 'breathing', label: '🌬️ Breathing', desc: 'Breath-focused exercises' },
    { value: 'body-scan', label: '🎯 Body Scan', desc: 'Progressive relaxation' },
    { value: 'loving-kindness', label: '💚 Loving Kindness', desc: 'Compassion practice' },
    { value: 'sleep', label: '🌙 Sleep', desc: 'Rest and recovery' },
    { value: 'focus', label: '⚡ Focus', desc: 'Concentration training' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
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

    setIsGenerating(true);
    setGenerationProgress(0);

    // Track the generation request
    await trackInteraction('session_generation_start', 'custom', {
      sessionType,
      duration: duration[0],
      difficulty,
      promptLength: prompt.length
    });

    // Simulate AI generation process with realistic progress
    const progressSteps = [
      { progress: 15, message: 'Analyzing your request...' },
      { progress: 35, message: 'Crafting session structure...' },
      { progress: 60, message: 'Generating guided content...' },
      { progress: 80, message: 'Adding personalization...' },
      { progress: 95, message: 'Finalizing session...' },
      { progress: 100, message: 'Session ready!' }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setGenerationProgress(progressSteps[stepIndex].progress);
        stepIndex++;
      } else {
        clearInterval(progressInterval);
        
        // Generate session data
        const session = {
          id: `custom-${Date.now()}`,
          title: generateSessionTitle(sessionType, prompt),
          description: generateSessionDescription(sessionType, prompt),
          type: sessionType,
          duration: duration[0],
          difficulty,
          script: generateSessionScript(sessionType, duration[0], prompt),
          audioUrl: null, // Would be generated in real implementation
          createdAt: new Date().toISOString()
        };
        
        setGeneratedSession(session);
        setIsGenerating(false);
        
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
    
    // Add personalization based on prompt keywords
    if (prompt.toLowerCase().includes('stress')) return `Stress Relief ${randomTitle}`;
    if (prompt.toLowerCase().includes('anxiety')) return `Anxiety Soothing ${randomTitle}`;
    if (prompt.toLowerCase().includes('energy')) return `Energy Boosting ${randomTitle}`;
    
    return randomTitle;
  };

  const generateSessionDescription = (type: string, prompt: string) => {
    return `A personalized ${type} session crafted based on your needs. This practice will guide you through techniques designed to help you achieve a state of calm and presence.`;
  };

  const generateSessionScript = (type: string, duration: number, prompt: string) => {
    // This would be generated by AI in a real implementation
    return `This is a ${duration}-minute ${type} session. Begin by finding a comfortable position and taking three deep breaths...`;
  };

  const handleVoiceInput = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      toast({
        title: "Voice input",
        description: "Listening... (This is a demo feature)",
      });
      
      // Simulate voice recognition
      setTimeout(() => {
        setPrompt(prev => prev + " I need help with relaxation and stress relief");
        setIsRecording(false);
        toast({
          title: "Voice captured",
          description: "Your request has been added",
        });
      }, 2000);
    }
  };

  const handleSaveSession = async () => {
    if (!generatedSession) return;
    
    // TODO: Save to database
    await trackInteraction('session_saved', generatedSession.id);
    toast({
      title: "Session Saved",
      description: "Added to your personal library",
    });
  };

  const handleShareSession = async () => {
    if (!generatedSession) return;
    
    await trackInteraction('session_shared', generatedSession.id);
    toast({
      title: "Session Shared",
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
            <h1 className="text-xl font-semibold">AI Session Generator</h1>
            <p className="text-sm text-muted-foreground">Create personalized mindfulness sessions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!generatedSession ? (
          <>
            {/* Input Section */}
            <Card className="card-mindful p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <h2 className="text-lg font-semibold">Describe Your Needs</h2>
                </div>
                
                <div className="relative">
                  <Textarea
                    placeholder="I'm feeling stressed from work and need help relaxing. I'd like something to calm my mind and release tension in my body. Maybe something with gentle breathing and body awareness..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
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
                  <span>{prompt.length}/500</span>
                </div>
              </div>
            </Card>

            {/* Session Settings */}
            <Card className="card-mindful p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Settings className="text-primary" size={20} />
                  <h2 className="text-lg font-semibold">Session Settings</h2>
                </div>

                {/* Session Type */}
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

                {/* Duration */}
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-background/50 transition-mindful">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">🌱 Beginner - New to meditation</SelectItem>
                      <SelectItem value="intermediate">🌿 Intermediate - Some experience</SelectItem>
                      <SelectItem value="advanced">🌳 Advanced - Regular practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="card-mindful p-6 animate-breathe">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary animate-pulse" size={20} />
                    <h3 className="font-semibold">Creating Your Session...</h3>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {generationProgress < 20 ? 'Analyzing your request...' :
                     generationProgress < 40 ? 'Crafting session structure...' :
                     generationProgress < 65 ? 'Generating guided content...' :
                     generationProgress < 85 ? 'Adding personalization...' :
                     generationProgress < 100 ? 'Finalizing session...' :
                     'Session ready!'}
                  </p>
                </div>
              </Card>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 btn-mindful bg-gradient-to-r from-primary to-accent text-white font-semibold animate-glow"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          /* Generated Session Result */
          <div className="space-y-6">
            <Card className="card-mindful p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Sparkles className="text-white" size={16} />
                    </div>
                    <h2 className="text-lg font-semibold">Your Custom Session</h2>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                    Generated
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">{generatedSession.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {generatedSession.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {generatedSession.type}
                    </Badge>
                    <Badge variant="outline">
                      {generatedSession.duration} minutes
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {generatedSession.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Session Preview */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Button size="lg" className="btn-mindful bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20">
                    <Play className="mr-2" size={24} />
                    Start Session
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" onClick={handleSaveSession} className="btn-mindful">
                    <Save className="mr-2" size={16} />
                    Save Session
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareSession} className="btn-mindful">
                    <Share2 className="mr-2" size={16} />
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Generate Another */}
            <Button 
              onClick={() => {
                setGeneratedSession(null);
                setPrompt('');
                setGenerationProgress(0);
              }}
              variant="outline" 
              className="w-full btn-mindful"
            >
              Generate Another Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSession;