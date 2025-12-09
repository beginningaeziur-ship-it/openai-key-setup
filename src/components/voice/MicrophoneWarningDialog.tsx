import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mic, MicOff, Shield } from 'lucide-react';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { cn } from '@/lib/utils';

interface MicrophoneWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onDecline: () => void;
}

export const MicrophoneWarningDialog: React.FC<MicrophoneWarningDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onDecline,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-8 h-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Live Voice Connection
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center">
              <p>
                SAI works best as a live conversation. Your microphone will stay 
                <span className="font-semibold text-foreground"> active </span> 
                so you can speak naturally without pressing buttons.
              </p>
              
              <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <Mic className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Always listening when unmuted</p>
                    <p className="text-xs text-muted-foreground">SAI hears you in real-time for natural conversation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MicOff className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Mute anytime with mic button</p>
                    <p className="text-xs text-muted-foreground">Visible on every screen for quick muting</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Your privacy is protected</p>
                    <p className="text-xs text-muted-foreground">Audio is processed locally, never stored</p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={onConfirm}
            className="w-full h-12 rounded-xl"
          >
            <Mic className="w-5 h-5 mr-2" />
            Enable Live Microphone
          </Button>
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="w-full h-12 rounded-xl"
          >
            Not Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Component to trigger the warning on first interaction
export const MicrophoneActivationPrompt: React.FC = () => {
  const { 
    isMicEnabled, 
    hasSeenWarning, 
    acknowledgeWarning,
    enableMicrophone 
  } = useMicrophone();
  
  const [showDialog, setShowDialog] = React.useState(false);

  // Show dialog when user hasn't seen warning and mic is not enabled
  React.useEffect(() => {
    if (!hasSeenWarning && !isMicEnabled) {
      // Small delay to not overwhelm user immediately
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWarning, isMicEnabled]);

  const handleConfirm = async () => {
    acknowledgeWarning();
    await enableMicrophone();
    setShowDialog(false);
  };

  const handleDecline = () => {
    acknowledgeWarning();
    setShowDialog(false);
  };

  return (
    <MicrophoneWarningDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onConfirm={handleConfirm}
      onDecline={handleDecline}
    />
  );
};