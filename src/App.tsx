import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SAIProvider } from "@/contexts/SAIContext";
import { MicrophoneProvider } from "@/contexts/MicrophoneContext";
import { VoiceSettingsProvider } from "@/contexts/VoiceSettingsContext";
import { EmotionalStateProvider } from "@/contexts/EmotionalStateContext";
import { SupportMapProvider } from "@/contexts/SupportMapContext";
import { SelfStartProvider } from "@/contexts/SelfStartContext";
import { SpeechOnlyProvider } from "@/contexts/SpeechOnlyContext";
import { ServiceDogProvider } from "@/contexts/ServiceDogContext";
import { SAINarratorProvider } from "@/contexts/SAINarratorContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { TourProvider } from "@/components/tour/TourProvider";
import { GlobalMicButton } from "@/components/voice/GlobalMicButton";
import { MicrophoneActivationPrompt } from "@/components/voice/MicrophoneWarningDialog";
import { CompanionCheckIn } from "@/components/companion/CompanionCheckIn";
import { PendingRoutinePopup } from "@/components/routines/PendingRoutinePopup";
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
import WaterProfileExplanation from "./pages/onboarding/WaterProfileExplanation";
import SafetyPlan from "./pages/onboarding/SafetyPlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <SAIProvider>
        <EmotionalStateProvider>
          <SupportMapProvider>
            <MicrophoneProvider>
              <VoiceSettingsProvider>
                <SpeechOnlyProvider>
                  <SelfStartProvider>
                    <ServiceDogProvider>
                      <SAINarratorProvider>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <BrowserRouter>
                            <TourProvider>
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
                                <Route path="/onboarding/safety-plan" element={<SafetyPlan />} />
                                <Route path="/onboarding/scene" element={<SceneSelect />} />
                                <Route path="/onboarding/goals" element={<GoalProposal />} />
                                <Route path="/onboarding/water-profile" element={<WaterProfileExplanation />} />
                                
                                {/* Main app */}
                                <Route path="/sai-room" element={<SAIRoom />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/watcher" element={<Watcher />} />
                                
                                {/* Catch-all */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                              
                              {/* Global floating mic button */}
                              <GlobalMicButton variant="floating" />
                              
                              {/* Companion check-in */}
                              <CompanionCheckIn />
                              
                              {/* Pending routine popups */}
                              <PendingRoutinePopup />
                              
                              {/* Microphone activation prompt */}
                              <MicrophoneActivationPrompt />
                            </TourProvider>
                          </BrowserRouter>
                        </TooltipProvider>
                      </SAINarratorProvider>
                    </ServiceDogProvider>
                  </SelfStartProvider>
                </SpeechOnlyProvider>
              </VoiceSettingsProvider>
            </MicrophoneProvider>
          </SupportMapProvider>
        </EmotionalStateProvider>
      </SAIProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;