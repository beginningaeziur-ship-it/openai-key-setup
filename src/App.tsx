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
import { SAIDailyEngineProvider } from "@/contexts/SAIDailyEngineContext";
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

// Onboarding Pages - New Flow
import WaitingRoom from "./pages/onboarding/WaitingRoom";
import SecurityBriefing from "./pages/onboarding/SecurityBriefing";
import Assessment from "./pages/onboarding/Assessment";
import SafetyPlan from "./pages/onboarding/SafetyPlan";
import OfficeExit from "./pages/onboarding/OfficeExit";
import HomeEntrance from "./pages/onboarding/HomeEntrance";
import PlayRoom from "./pages/PlayRoom";
import BedroomHome from "./pages/BedroomHome";
import SAIHome from "./pages/SAIHome";
import BeachScene from "./pages/BeachScene";
import CabinScene from "./pages/CabinScene";
// ForestScene removed - merged into CabinScene per AEZUIR spec

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
                        <SAIDailyEngineProvider>
                          <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <BrowserRouter>
                            <TourProvider>
                              <Routes>
                                {/* Main entry - logo splash */}
                                <Route path="/" element={<Index />} />
                                
                                {/* New onboarding flow */}
                                <Route path="/onboarding/waiting-room" element={<WaitingRoom />} />
                                <Route path="/onboarding/security" element={<SecurityBriefing />} />
                                <Route path="/onboarding/assessment" element={<Assessment />} />
                                <Route path="/onboarding/safety-plan" element={<SafetyPlan />} />
                                <Route path="/onboarding/exit" element={<OfficeExit />} />
                                <Route path="/onboarding/play-room" element={<PlayRoom />} />
                                <Route path="/onboarding/home-entrance" element={<HomeEntrance />} />
                                
                                {/* Main app with PIN gate */}
                                <Route path="/bedroom" element={<BedroomHome />} />
                                
                                {/* Main app - AEZUIR Room System */}
                                <Route path="/sai-room" element={<SAIHome />} />
                                <Route path="/sai-home" element={<SAIHome />} />
                                <Route path="/bedroom" element={<SAIHome />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/watcher" element={<Watcher />} />
                                <Route path="/beach" element={<BeachScene />} />
                                <Route path="/cabin" element={<CabinScene />} />
                                {/* /forest removed - merged into /cabin */}
                                
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
                        </SAIDailyEngineProvider>
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
