import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SAIProvider } from "@/contexts/SAIContext";
import { MicrophoneProvider } from "@/contexts/MicrophoneContext";
import { VoiceSettingsProvider } from "@/contexts/VoiceSettingsContext";
import { GlobalMicButton } from "@/components/voice/GlobalMicButton";
import { MicrophoneActivationPrompt } from "@/components/voice/MicrophoneWarningDialog";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import SAIRoom from "./pages/SAIRoom";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Watcher from "./pages/Watcher";

// Onboarding Pages
import Welcome from "./pages/onboarding/Welcome";
import CyName from "./pages/onboarding/CyName";
import UserInfo from "./pages/onboarding/UserInfo";
import WHOModel from "./pages/onboarding/WHOModel";
import Categories from "./pages/onboarding/Categories";
import Conditions from "./pages/onboarding/Conditions";
import Symptoms from "./pages/onboarding/Symptoms";
import Preferences from "./pages/onboarding/Preferences";
import SceneSelect from "./pages/onboarding/SceneSelect";
import GoalProposal from "./pages/onboarding/GoalProposal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SAIProvider>
      <MicrophoneProvider>
        <VoiceSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Main entry - redirects based on onboarding status */}
                <Route path="/" element={<Index />} />
                
                {/* Onboarding flow */}
                <Route path="/onboarding/welcome" element={<Welcome />} />
                <Route path="/onboarding/cy-name" element={<CyName />} />
                <Route path="/onboarding/user-info" element={<UserInfo />} />
                <Route path="/onboarding/who-model" element={<WHOModel />} />
                <Route path="/onboarding/categories" element={<Categories />} />
                <Route path="/onboarding/conditions" element={<Conditions />} />
                <Route path="/onboarding/symptoms" element={<Symptoms />} />
                <Route path="/onboarding/preferences" element={<Preferences />} />
                <Route path="/onboarding/scene" element={<SceneSelect />} />
                <Route path="/onboarding/goals" element={<GoalProposal />} />
                
                {/* Main app */}
                <Route path="/sai-room" element={<SAIRoom />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/watcher" element={<Watcher />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Global floating mic button - visible on all screens */}
              <GlobalMicButton variant="floating" />
              
              {/* Microphone activation prompt - shows warning on first use */}
              <MicrophoneActivationPrompt />
            </BrowserRouter>
          </TooltipProvider>
        </VoiceSettingsProvider>
      </MicrophoneProvider>
    </SAIProvider>
  </QueryClientProvider>
);

export default App;