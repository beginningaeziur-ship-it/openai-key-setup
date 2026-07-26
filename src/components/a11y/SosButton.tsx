import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOS_EVENT } from '@/hooks/useGlobalA11yShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const BG = '#0A1628';
const ACCENT = '#028090';

interface SosButtonProps {
  /** Second of the exactly-two crisis options. Defaults to the safety plan page. */
  onSafetyPlan?: () => void;
  /** Optional extra content rendered inside the dialog above the options. */
  children?: ReactNode;
}

/**
 * Persistent emergency control.
 * Rendered last in the DOM so it is the final element in tab order,
 * fixed to the bottom of the viewport, above everything else.
 * Crisis mode always offers exactly two options — never three.
 */
export function SosButton({ onSafetyPlan, children }: SosButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener(SOS_EVENT, handler);
    return () => document.removeEventListener(SOS_EVENT, handler);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Return focus to the trigger when the dialog closes.
    if (!next) window.setTimeout(() => triggerRef.current?.focus(), 120);
  };

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 flex justify-center px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <button
          ref={triggerRef}
          type="button"
          role="button"
          tabIndex={0}
          aria-label="Emergency SOS - get help now"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="pointer-events-auto min-h-[64px] min-w-[64px] px-10 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          SOS
        </button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="border-white/20 text-white"
          style={{ backgroundColor: BG, zIndex: 10000 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">You're not alone.</DialogTitle>
            <DialogDescription className="text-base text-[#B0BEC5]">
              Choose one.
            </DialogDescription>
          </DialogHeader>
          {children}
          <div className="flex flex-col gap-3 mt-2">
            <a
              href="tel:988"
              aria-label="Talk to a crisis counselor, call 988"
              className="min-h-[64px] flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Talk to a crisis counselor (988)
            </a>
            <button
              type="button"
              aria-label="Build an immediate safety plan"
              onClick={() => {
                handleOpenChange(false);
                if (onSafetyPlan) onSafetyPlan();
                else navigate('/onboarding/safety-plan');
              }}
              className="min-h-[64px] rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ backgroundColor: ACCENT }}
            >
              Build an immediate safety plan
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
