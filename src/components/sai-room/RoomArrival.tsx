import React, { useEffect, useState } from "react";
import { useVoiceSettings } from "@/contexts/VoiceSettingsContext";
import { cn } from "@/lib/utils";

interface RoomArrivalProps {
  userName: string;
  saiName: string;
  onComplete?: () => void;
}

export function RoomArrival({ userName, saiName, onComplete }: RoomArrivalProps) {
  const { speak, stopSpeaking } = useVoiceSettings();
  
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sai_room_intro_seen") !== "true";
  });

  useEffect(() => {
    if (!showIntro) {
      onComplete?.();
      return;
    }

    // SAI speaks the greeting softly using centralized voice
    speak(`You made it, ${userName}. I'm ${saiName}. This is your space. You're safe here. We move at your pace.`);

    // After greeting, SAI gives the verbal tutorial
    const tourTimer = setTimeout(() => {
      speak(`Let me give you a quick tour. Each object in this room has a purpose. Tap anything when you're ready.`);
    }, 3500);

    // Mark intro as seen after a few seconds
    const completeTimer = setTimeout(() => {
      localStorage.setItem("sai_room_intro_seen", "true");
      setShowIntro(false);
      onComplete?.();
    }, 7000);

    return () => {
      clearTimeout(tourTimer);
      clearTimeout(completeTimer);
      stopSpeaking();
    };
  }, [showIntro, userName, saiName, onComplete, speak, stopSpeaking]);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {/* Soft ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className={cn(
        "relative bg-card/90 backdrop-blur-md p-8 rounded-2xl max-w-md text-center",
        "shadow-2xl border border-border/40"
      )}>
        {/* SAI presence indicator */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/40 animate-arrival-breathe" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-arrival-glow" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3 text-foreground">
          Welcome, {userName}
        </h2>

        <p className="text-sm text-foreground/80 leading-relaxed">
          This is your <strong className="text-primary">{saiName}</strong> Room.
          <br />
          Nothing here is a test. There's no rush.
        </p>

        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          I'll talk you through the space once, then stay mostly quiet unless you talk to me or tap something.
        </p>

        {/* Skip button */}
        <button
          onClick={() => {
            stopSpeaking();
            localStorage.setItem("sai_room_intro_seen", "true");
            setShowIntro(false);
            onComplete?.();
          }}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors mt-6"
        >
          tap to skip
        </button>
      </div>
    </div>
  );
}
