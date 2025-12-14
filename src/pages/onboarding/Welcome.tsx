import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-calm flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-breathe">
            <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <Sparkles className="absolute top-0 right-1/3 w-6 h-6 text-sai-warm-dark animate-pulse-soft" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-foreground">
            SAI
          </h1>
          <p className="text-xl text-muted-foreground">
            A steady presence to help you pause, think, and choose
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-4">
          <p className="text-foreground leading-relaxed">
            I'm here to walk alongside you — not to judge, not to decide for you, just to help you see your options clearly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>SAI remembers goals and progress, not people.</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/onboarding/cy-name')}
            className="w-full h-14 text-lg rounded-xl"
          >
            Let's Get Started
          </Button>
          <p className="text-xs text-muted-foreground">
            This will take about 5-10 minutes. Take breaks if you need them.
          </p>
        </div>
      </div>
    </div>
  );
}
