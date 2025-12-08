import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";

const Index = () => {
  const navigate = useNavigate();
  const { onboarding } = useSAI();

  useEffect(() => {
    // Check if user has completed onboarding
    if (onboarding.completed) {
      navigate("/sai-room", { replace: true });
    } else {
      navigate("/onboarding/welcome", { replace: true });
    }
  }, [onboarding.completed, navigate]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 sai-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full sai-gradient-calm sai-breathe" />
        <p className="text-muted-foreground text-lg">Loading SAI...</p>
      </div>
    </div>
  );
};

export default Index;
