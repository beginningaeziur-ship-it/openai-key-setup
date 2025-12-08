import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GroundingExercise, GroundingPicker, GroundingType } from './GroundingExercises';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickGroundingButtonProps {
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function QuickGroundingButton({ 
  userName, 
  variant = 'outline',
  size = 'default',
  className 
}: QuickGroundingButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<GroundingType | null>(null);

  const handleSelect = (type: GroundingType) => {
    setSelectedExercise(type);
  };

  const handleComplete = () => {
    toast({
      description: "Nice work. You did that for yourself.",
    });
    setSelectedExercise(null);
    setOpen(false);
  };

  const handleDismiss = () => {
    setSelectedExercise(null);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setOpen(true)}
        className={className}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Ground Me
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
          {selectedExercise ? (
            <GroundingExercise
              type={selectedExercise}
              userName={userName}
              onComplete={handleComplete}
              onDismiss={handleDismiss}
            />
          ) : (
            <GroundingPicker
              userName={userName}
              onSelect={handleSelect}
              onDismiss={handleDismiss}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}