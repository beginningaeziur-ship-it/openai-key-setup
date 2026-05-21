# Native Accessibility Bridge — Setup Guide

## What this does
Gives Aria full control over every app on your Android or iPhone.
Without this, Aria only controls THIS app. With it, Aria controls EVERYTHING.

---

## Android Setup (Full device control)

### Step 1 — Generate the Android project
```bash
npx cap add android
```

### Step 2 — Copy native files
```
native/android/kotlin/InterpreterAccessibilityService.kt
  → android/app/src/main/java/app/lovable/interpreter/

native/android/kotlin/AccessibilityBridgePlugin.kt
  → android/app/src/main/java/app/lovable/interpreter/

native/android/xml/interpreter_accessibility_service.xml
  → android/app/src/main/res/xml/
```

### Step 3 — Update AndroidManifest.xml
Add the contents of `native/android/kotlin/AndroidManifestAdditions.xml`
into `android/app/src/main/AndroidManifest.xml` inside the `<application>` tag.

### Step 4 — Register the Capacitor plugin
In `android/app/src/main/java/.../MainActivity.kt`:
```kotlin
import app.lovable.interpreter.AccessibilityBridgePlugin

class MainActivity : BridgeActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    registerPlugin(AccessibilityBridgePlugin::class.java)
    super.onCreate(savedInstanceState)
  }
}
```

### Step 5 — Build and install
```bash
npx cap sync android
npx cap open android
# Build and install to device from Android Studio
```

### Step 6 — Enable on the phone
1. Go to **Settings → Accessibility**
2. Find **"Aria Interpreter"** (or your app name)
3. Tap it → turn **ON**
4. Accept the permission dialog

That's it. Aria now controls every app on your phone.

---

## iOS Setup (Limited — within-app control only)

iOS sandboxing prevents apps from controlling other apps.
What works on iPhone:
- Reading current screen content
- Opening other apps by URL scheme ("Open Messages", "Open Maps")
- Reading contacts
- Detecting VoiceOver state

### Step 1 — Generate the iOS project
```bash
npx cap add ios
```

### Step 2 — Copy native files
```
native/ios/swift/AccessibilityBridgePlugin.swift
  → ios/App/App/
```

### Step 3 — Register the plugin
In `ios/App/App/AppDelegate.swift`, register `AccessibilityBridgePlugin`.

### Step 4 — Add permissions to Info.plist
```xml
<key>NSContactsUsageDescription</key>
<string>Aria needs contacts to call and message people by name.</string>
```

### Step 5 — Build
```bash
npx cap sync ios
npx cap open ios
# Build and install from Xcode
```

---

## Web / Desktop (current — no setup needed)
The engine works right now in the browser with:
- Full DOM control of THIS app
- Voice commands
- AI-powered screen reading
- Shopping and form automation

Native device control requires the mobile app steps above.
