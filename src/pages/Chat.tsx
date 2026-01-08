import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QuickGroundingButton } from '@/components/grounding/QuickGroundingButton';
import { SceneBackground, SceneType } from '@/components/sai-room/SceneBackground';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useStressMonitor } from '@/hooks/useStressMonitor';
import { useVoiceStressDetector } from '@/hooks/useVoiceStressDetector';
import { StressIndicator } from '@/components/stress/StressIndicator';
import { ArrowLeft, Send, Loader2, Heart, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { buildCommunicationStyle } from '@/lib/disabilityResponsePatterns';
import { checkMessageSafety } from '@/lib/safetyPatterns';
import type { ChatMessage } from '@/types/sai';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sai-chat`;

type SAIStatus = 'idle' | 'listening' | 'speaking' | 'thinking';

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, selectedCategories, selectedConditions, selectedSymptoms, saiPersonality } = useSAI();
  const { audioStream, isMicEnabled, isMicMuted, setMuted } = useMicrophone();
  
  // Use centralized voice settings - SINGLE speech path
  const { 
    voiceEnabled, 
    setVoiceEnabled, 
    speak, 
    stopSpeaking, 
    isSpeaking,
    isLoading: isVoiceLoading 
  } = useVoiceSettings();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saiStatus, setSaiStatus] = useState<SAIStatus>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSpokenGreetingRef = useRef(false);
  const isProcessingResponseRef = useRef(false);

  const saiName = userProfile?.saiNickname || 'SAI';
  const userName = userProfile?.nickname || 'Friend';
  const scene = (userProfile?.scene as SceneType) || 'bedroom';

  // Stress monitoring (text-based)
  const { 
    state: stressState, 
    analyzeMessage: analyzeStress, 
    updateVoiceMetrics,
    acknowledgeIntervention,
    getTrend 
  } = useStressMonitor(saiName);

  // Voice stress detection (audio-based)
  const { 
    isAnalyzing: isVoiceAnalyzing,
    startAnalysis: startVoiceAnalysis,
    stopAnalysis: stopVoiceAnalysis,
    currentResult: voiceStressResult,
  } = useVoiceStressDetector({
    onMetricsUpdate: (metrics) => {
      updateVoiceMetrics(metrics);
    },
  });

  // Start/stop voice stress analysis based on audio stream
  useEffect(() => {
    if (audioStream && isMicEnabled && !isMicMuted && !isSpeaking) {
      const timer = setTimeout(() => {
        startVoiceAnalysis(audioStream);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      stopVoiceAnalysis();
    }
  }, [audioStream, isMicEnabled, isMicMuted, isSpeaking, startVoiceAnalysis, stopVoiceAnalysis]);

  // Mute mic when SAI is speaking to prevent overlap
  useEffect(() => {
    if (isSpeaking && isMicEnabled && !isMicMuted) {
      setMuted(true);
    }
  }, [isSpeaking, isMicEnabled, isMicMuted, setMuted]);

  // Voice input hook
  const { isRecording, isProcessing, toggleRecording } = useVoiceInput({
    onTranscription: (text) => {
      setInput(prev => prev ? `${prev} ${text}` : text);
      toast({
        description: "Got it. Ready to send.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error,
      });
    },
  });

  // Update SAI status based on various states
  useEffect(() => {
    if (isRecording) {
      setSaiStatus('listening');
    } else if (isSpeaking) {
      setSaiStatus('speaking');
    } else if (isLoading || isProcessing || isVoiceLoading) {
      setSaiStatus('thinking');
    } else {
      setSaiStatus('idle');
    }
  }, [isRecording, isSpeaking, isLoading, isProcessing, isVoiceLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting - only once
  useEffect(() => {
    if (messages.length === 0 && !hasSpokenGreetingRef.current) {
      hasSpokenGreetingRef.current = true;
      const greeting: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I'm here, ${userName}. What do you need?`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
      
      // Speak the greeting if voice is enabled
      if (voiceEnabled) {
        speak(greeting.content);
      }
    }
  }, [userName, voiceEnabled, speak, messages.length]);

  const toggleVoice = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
    toast({
      description: voiceEnabled ? "Voice off. Text only." : "Voice on.",
    });
  }, [voiceEnabled, isSpeaking, stopSpeaking, setVoiceEnabled, toast]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isProcessingResponseRef.current) return;

    isProcessingResponseRef.current = true;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Analyze stress level from the message
    const stressAnalysis = analyzeStress(userMessage.content);

    // Client-side safety check for immediate boundary setting
    const safetyCheck = checkMessageSafety(userMessage.content);
    
    // If sexual content detected, respond immediately without API call
    if (safetyCheck.triggered && safetyCheck.category === 'sexual' && safetyCheck.safeResponse) {
      const safetyResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: safetyCheck.safeResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, safetyResponse]);
      setIsLoading(false);
      isProcessingResponseRef.current = false;
      
      if (voiceEnabled) {
        speak(safetyCheck.safeResponse);
      }
      return;
    }

    // If stress monitor detected high stress and has intervention message, use it
    if (stressState.needsIntervention && stressState.interventionMessage) {
      const interventionResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: stressState.interventionMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, interventionResponse]);
      acknowledgeIntervention();
      
      if (voiceEnabled) {
        speak(stressState.interventionMessage);
      }
    }

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: userMessage.content }]),
          userContext: {
            userName,
            saiName,
            categories: selectedCategories.slice(0, 20),
            conditions: selectedConditions.flatMap(c => c.conditions).slice(0, 50),
            symptoms: selectedSymptoms.flatMap(s => s.symptoms).slice(0, 50),
            personality: saiPersonality,
            communicationStyle: buildCommunicationStyle(selectedCategories, selectedConditions, selectedSymptoms),
            stressContext: {
              level: stressAnalysis.level,
              score: stressAnalysis.score,
              triggers: stressAnalysis.triggers,
              recommendedAction: stressAnalysis.recommendedAction,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, {
                  id: 'streaming-' + crypto.randomUUID(),
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: new Date(),
                }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Finalize the message
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, id: crypto.randomUUID() } : m
          );
        }
        return prev;
      });

      // Speak the response - SINGLE call
      if (voiceEnabled && assistantContent) {
        speak(assistantContent);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = "I'm here. Connection hiccup. Take a breath.";
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
      
      if (voiceEnabled) {
        speak(errorMessage);
      }
    } finally {
      setIsLoading(false);
      isProcessingResponseRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusText = () => {
    switch (saiStatus) {
      case 'listening': return 'Listening...';
      case 'speaking': return 'Speaking...';
      case 'thinking': return 'Thinking...';
      default: return 'Your ally';
    }
  };

  return (
    <SceneBackground scene={scene} className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/sai-room')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative",
                saiStatus !== 'idle' && "animate-breathe"
              )}>
                <Heart className="w-5 h-5 text-primary" />
                {/* Status indicator */}
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                  saiStatus === 'listening' && "bg-sai-hope animate-pulse",
                  saiStatus === 'speaking' && "bg-primary animate-pulse",
                  saiStatus === 'thinking' && "bg-sai-gentle animate-pulse",
                  saiStatus === 'idle' && "bg-progress-stable"
                )} />
              </div>
              <div>
                <h1 className="font-display font-semibold">{saiName}</h1>
                <p className="text-xs text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice stress indicator */}
            {isVoiceAnalyzing && voiceStressResult && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  voiceStressResult.isBreathingRapid && "bg-orange-400 animate-pulse",
                  voiceStressResult.isPitchElevated && "bg-amber-400",
                  voiceStressResult.isSpeechFast && "bg-yellow-400",
                  !voiceStressResult.isBreathingRapid && !voiceStressResult.isPitchElevated && !voiceStressResult.isSpeechFast && "bg-emerald-400"
                )} />
                <span className="text-muted-foreground">
                  {voiceStressResult.metrics.breathing === 'rapid' || voiceStressResult.metrics.breathing === 'gasping' 
                    ? 'Breathe...' 
                    : voiceStressResult.metrics.speed === 'very-fast' 
                    ? 'Slow down...'
                    : voiceStressResult.metrics.pitch === 'shaky'
                    ? 'I hear you...'
                    : 'Listening'}
                </span>
              </div>
            )}
            
            {/* Stress indicator */}
            <StressIndicator 
              level={stressState.currentAnalysis.level}
              score={stressState.currentAnalysis.score}
              trend={getTrend()}
              showDetails={stressState.isElevated}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn(
                "rounded-full",
                !voiceEnabled && "text-muted-foreground"
              )}
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex sai-fade-in",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start sai-fade-in">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          {/* Quick actions row */}
          <div className="flex justify-center gap-4 mb-3">
            <QuickGroundingButton 
              userName={userName} 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Voice input button */}
            <Button
              variant={isRecording ? "default" : "outline"}
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing || isSpeaking}
              className={cn(
                "h-12 w-12 rounded-xl flex-shrink-0 transition-all",
                isRecording && "bg-sai-hope text-white animate-pulse"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Type or tap mic to speak..."}
              className="min-h-[48px] max-h-32 resize-none rounded-xl"
              rows={1}
              disabled={isRecording}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isRecording}
              className="h-12 w-12 rounded-xl flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Conversations are private. Not stored.
          </p>
        </div>
      </div>
    </SceneBackground>
  );
}
