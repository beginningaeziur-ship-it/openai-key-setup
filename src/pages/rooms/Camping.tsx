import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SAICharacter } from '@/components/aezuir/SAICharacter';
import { PanicButton } from '@/components/aezuir/PanicButton';
import { useSAI } from '@/contexts/SAIContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import {
  ChevronLeft,
  Tent,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  QrCode,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import cabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * Camping — Settings and privacy room.
 *
 * Four tabs:
 *  1. Voice — TTS on/off, speech speed, microphone
 *  2. Privacy — what is stored, how to clear, device-only guarantee
 *  3. Safety — PIN, professional contact, PAI QR code access
 *  4. Account — display name, SAI nickname, data export/reset
 */

// ─── Component ────────────────────────────────────────────────────────────────

export default function Camping() {
  const navigate = useNavigate();
  const { userProfile } = useSAI();
  const {
    voiceEnabled,
    setVoiceEnabled,
    speak,
    isSpeaking,
  } = useVoiceSettings();
  const { hasPermission, enableMicrophone, isSupported } = useMicrophone();

  const [activeTab, setActiveTab] = useState<'voice' | 'privacy' | 'safety' | 'account'>('voice');
  const [saiMessage, setSaiMessage] = useState("Your settings. Your control. Always.");

  // Voice settings
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem('aezuir_speech_rate');
    return saved ? parseFloat(saved) : 1;
  });

  // Safety settings
  const [pin, setPin] = useState(localStorage.getItem('sai_security_pin') || '');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [professionalContact, setProfessionalContact] = useState(
    localStorage.getItem('sai_professional_contact') || ''
  );
  const [contactEditing, setContactEditing] = useState(false);
  const [contactInput, setContactInput] = useState(professionalContact);

  // Account settings
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [saiNickname, setSaiNickname] = useState(userProfile?.saiNickname || 'SAI');
  const [nameEditing, setNameEditing] = useState(false);

  const say = useCallback(
    (msg: string) => {
      setSaiMessage(msg);
      if (voiceEnabled) speak(msg);
    },
    [voiceEnabled, speak]
  );

  // ── Voice ──
  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      setTimeout(() => speak("Voice enabled."), 100);
    }
    setSaiMessage(enabled ? "Voice enabled." : "Voice off — text mode.");
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('aezuir_speech_rate', rate.toString());
  };

  // ── PIN ──
  const savePIN = () => {
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }
    localStorage.setItem('sai_security_pin', newPin);
    setPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
    say("PIN updated. Keep it somewhere safe.");
  };

  // ── Professional contact ──
  const saveContact = () => {
    localStorage.setItem('sai_professional_contact', contactInput);
    setProfessionalContact(contactInput);
    setContactEditing(false);
    say("Professional contact saved.");
  };

  // ── Data export ──
  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      goals: localStorage.getItem('aezuir_goals'),
      nineSteps: localStorage.getItem('aezuir_nine_steps_done'),
      memos: localStorage.getItem('sai_memos'),
      prepLists: localStorage.getItem('sai_prep_lists'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aezuir-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    say("Your data has been exported to your device.");
  };

  // ── Clear all data ──
  const clearAllData = () => {
    const keysToRemove = [
      'aezuir_goals',
      'aezuir_goals_date',
      'aezuir_nine_steps_done',
      'aezuir_nine_steps_current',
      'sai_memos',
      'sai_prep_lists',
      'sai_security_pin',
      'sai_professional_contact',
      'sai_reached_safe_house',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    say("All data cleared from this device.");
    setTimeout(() => navigate('/'), 1500);
  };

  const saiState = isSpeaking ? 'speaking' : 'attentive';

  const RATE_OPTIONS = [
    { value: 0.75, label: 'Slow' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: 'Fast' },
    { value: 1.5, label: 'Faster' },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${cabinBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/50 via-black/30 to-amber-900/60" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-20 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/aezuir')}
              className="text-white/70 hover:text-white"
              aria-label="Go back to home"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2">
              <Tent className="w-5 h-5 text-amber-300" aria-hidden="true" />
              <span className="font-semibold text-white">Cabin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">

          {/* SAI */}
          <div className="flex justify-center">
            <SAICharacter state={saiState} size="sm" />
          </div>

          {/* SAI message */}
          <div
            role="status"
            aria-live="polite"
            className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20"
          >
            <p className="text-white text-sm leading-relaxed text-center">{saiMessage}</p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList className="grid grid-cols-4 bg-black/40 backdrop-blur-sm border border-white/10">
              {[
                { value: 'voice', Icon: Volume2, label: 'Voice' },
                { value: 'privacy', Icon: Shield, label: 'Privacy' },
                { value: 'safety', Icon: Lock, label: 'Safety' },
                { value: 'account', Icon: User, label: 'Account' },
              ].map(({ value, Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 flex flex-col gap-0.5 h-12 px-1"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[10px]">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── VOICE ── */}
            <TabsContent value="voice" className="mt-4 space-y-3">
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardContent className="pt-5 space-y-5">
                  {/* Voice on/off */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold flex items-center gap-2">
                        {voiceEnabled ? (
                          <Volume2 className="w-4 h-4 text-amber-300" aria-hidden="true" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-white/40" aria-hidden="true" />
                        )}
                        Voice narration
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        SAI speaks responses aloud
                      </p>
                    </div>
                    <Switch
                      checked={voiceEnabled}
                      onCheckedChange={handleVoiceToggle}
                      aria-label={`Voice narration is ${voiceEnabled ? 'on' : 'off'}`}
                    />
                  </div>

                  {/* Speech rate */}
                  {voiceEnabled && (
                    <div>
                      <p className="text-white text-sm font-semibold mb-2">Speech speed</p>
                      <div className="flex gap-2">
                        {RATE_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            variant={speechRate === opt.value ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                              'flex-1 border-white/20 text-xs',
                              speechRate !== opt.value && 'text-white bg-white/10'
                            )}
                            onClick={() => handleRateChange(opt.value)}
                            aria-label={`Set speech speed to ${opt.label}`}
                            aria-pressed={speechRate === opt.value}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Microphone */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-white font-semibold flex items-center gap-2">
                        {hasPermission ? (
                          <Mic className="w-4 h-4 text-green-400" aria-hidden="true" />
                        ) : (
                          <MicOff className="w-4 h-4 text-white/40" aria-hidden="true" />
                        )}
                        Microphone
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {!isSupported
                          ? 'Voice input not supported on this device'
                          : hasPermission
                          ? 'Access granted — voice input enabled'
                          : hasPermission === false
                          ? 'Access denied — check device settings'
                          : 'Tap Enable to allow voice input'}
                      </p>
                    </div>
                    {isSupported && !hasPermission && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-white/10"
                        onClick={enableMicrophone}
                        aria-label="Request microphone access"
                      >
                        Enable
                      </Button>
                    )}
                    {hasPermission && (
                      <span className="text-green-400 text-sm" aria-label="Microphone access granted">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── PRIVACY ── */}
            <TabsContent value="privacy" className="mt-4 space-y-3">
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" aria-hidden="true" />
                    Privacy Promise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { text: 'No permanent storage of your conversations', ok: true },
                    { text: 'Patterns tracked, not personal details', ok: true },
                    { text: 'Journal entries save only to your device', ok: true },
                    { text: 'No third-party data sharing', ok: true },
                    { text: 'No advertising or data monetization', ok: true },
                    { text: 'You control your data, always', ok: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-white/80">{item.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">What is stored on your device</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Your goals (you can reset these)',
                    'Memos and prep lists',
                    'Nine-step program progress',
                    'App settings (voice, PIN)',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <Info className="w-3 h-3 text-amber-400 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/20 text-white bg-white/10"
                  onClick={exportData}
                  aria-label="Export all your data to a file"
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Export my data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/30 text-red-400 bg-red-900/10 hover:bg-red-900/20"
                      aria-label="Delete all data permanently"
                    >
                      <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Delete all data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all goals, memos, progress, and settings
                        from this device. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>

            {/* ── SAFETY ── */}
            <TabsContent value="safety" className="mt-4 space-y-3">
              {/* PIN setup */}
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-300" aria-hidden="true" />
                    Access PIN
                  </CardTitle>
                  <CardDescription className="text-white/50 text-xs">
                    Used for panic button cancellation and home entry.
                    Keep this private.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pin && (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
                      <Check className="w-4 h-4" aria-hidden="true" />
                      PIN is set
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        maxLength={4}
                        pattern="\d{4}"
                        value={newPin}
                        onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                        placeholder="New PIN (4 digits)"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="New PIN, 4 digits"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      pattern="\d{4}"
                      value={confirmPin}
                      onChange={(e) => { setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                      placeholder="Confirm new PIN"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Confirm new PIN"
                      autoComplete="new-password"
                    />
                  </div>

                  {pinError && (
                    <p role="alert" className="text-red-400 text-xs">{pinError}</p>
                  )}
                  {pinSuccess && (
                    <p role="status" className="text-green-400 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      PIN saved successfully
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={savePIN}
                    disabled={newPin.length !== 4 || confirmPin.length !== 4}
                    aria-label="Save new PIN"
                  >
                    {pin ? 'Update PIN' : 'Set PIN'}
                  </Button>
                </CardContent>
              </Card>

              {/* Professional contact */}
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-300" aria-hidden="true" />
                    Professional Contact
                  </CardTitle>
                  <CardDescription className="text-white/50 text-xs">
                    When the panic button timer expires, this contact receives an alert.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contactEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        placeholder="Name or phone / email of professional"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Professional contact information"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/50 hover:text-white"
                          onClick={() => { setContactEditing(false); setContactInput(professionalContact); }}
                          aria-label="Cancel editing contact"
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveContact} className="flex-1" aria-label="Save contact">
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-white/70 text-sm">
                        {professionalContact || 'No contact set'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white bg-white/10"
                        onClick={() => { setContactEditing(true); setContactInput(professionalContact); }}
                        aria-label={professionalContact ? 'Edit professional contact' : 'Add professional contact'}
                      >
                        {professionalContact ? 'Edit' : 'Add'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* PAI QR code */}
              <Card className="bg-black/60 backdrop-blur-sm border-purple-500/20">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-purple-300" aria-hidden="true" />
                    <p className="text-white font-semibold text-sm">Professional Dashboard (PAI)</p>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Professionals access your anonymized patterns only through
                    a one-time QR code scan. You control when this is shared.
                    No permanent access is ever granted.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-white bg-purple-900/20 hover:bg-purple-900/40 w-full"
                    onClick={() => say("PAI QR code generation is available when connected to your professional.")}
                    aria-label="Generate PAI access QR code (requires professional setup)"
                  >
                    <QrCode className="w-4 h-4 mr-2" aria-hidden="true" />
                    Generate PAI access code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ACCOUNT ── */}
            <TabsContent value="account" className="mt-4 space-y-3">
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-300" aria-hidden="true" />
                    Your Identity Here
                  </CardTitle>
                  <CardDescription className="text-white/50 text-xs">
                    These names stay on your device. No account required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nameEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/60 text-xs mb-1 block" htmlFor="nickname-input">
                          Your name (how SAI greets you)
                        </label>
                        <input
                          id="nickname-input"
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Your name or nickname"
                          maxLength={30}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs mb-1 block" htmlFor="sainame-input">
                          SAI's name (what you call your companion)
                        </label>
                        <input
                          id="sainame-input"
                          type="text"
                          value={saiNickname}
                          onChange={(e) => setSaiNickname(e.target.value)}
                          placeholder="SAI, Buddy, Scout..."
                          maxLength={20}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/50 hover:text-white"
                          onClick={() => setNameEditing(false)}
                          aria-label="Cancel name editing"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // In production this would update the SAI context
                            localStorage.setItem('aezuir_nickname', nickname);
                            localStorage.setItem('aezuir_sainame', saiNickname);
                            setNameEditing(false);
                            say(`Names saved. I'll call you ${nickname || 'Friend'} from now on.`);
                          }}
                          aria-label="Save names"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white/50 text-xs">Your name</p>
                          <p className="text-white font-medium">{nickname || 'Not set'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-xs">SAI's name</p>
                          <p className="text-white font-medium">{saiNickname}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white bg-white/10 w-full"
                        onClick={() => setNameEditing(true)}
                        aria-label="Edit names"
                      >
                        Edit names
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing info */}
              <Card className="bg-black/60 backdrop-blur-sm border-amber-500/20">
                <CardContent className="pt-5 space-y-2">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                    Aezuir Pricing
                  </p>
                  {[
                    { tier: 'Micro', price: '$600/mo', note: 'Individual use' },
                    { tier: 'Small', price: '$1,000/mo', note: 'Small practice' },
                    { tier: 'Medium', price: '$2,000/mo', note: 'Group practice' },
                    { tier: 'Large', price: '$3,500/mo', note: 'Organization' },
                  ].map((plan) => (
                    <div key={plan.tier} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">
                        {plan.tier} <span className="text-white/40 text-xs">— {plan.note}</span>
                      </span>
                      <span className="text-amber-300 font-semibold">{plan.price}</span>
                    </div>
                  ))}
                  <p className="text-white/30 text-xs pt-1">
                    Contact Aezuir for enterprise or nonprofit pricing.
                  </p>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white/60 w-full gap-2"
                onClick={() => navigate('/sai-home')}
                aria-label="Return to home"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Return to home
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-white/20 text-xs text-center mt-2 pb-4">
            Your space. Your rules. Always.
          </p>
        </div>
      </main>

      <PanicButton variant="floating" />
    </div>
  );
}
