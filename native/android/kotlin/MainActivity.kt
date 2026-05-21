package app.lovable

import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import com.getcapacitor.BridgeActivity
import app.lovable.interpreter.AccessibilityBridgePlugin

/**
 * MainActivity — replace the generated one at:
 *   android/app/src/main/java/app/lovable/MainActivity.kt
 *
 * Key additions vs the default Capacitor MainActivity:
 *  1. Registers AccessibilityBridgePlugin
 *  2. Overrides WebChromeClient to grant microphone permission to the WebView
 *     (required for Web Speech API / voice input to work)
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Register the Aria native accessibility plugin
        registerPlugin(AccessibilityBridgePlugin::class.java)

        super.onCreate(savedInstanceState)

        // Grant WebView permission to use the microphone (Web Speech API)
        bridge.webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                // Grant microphone + camera if requested by the WebView
                request.grant(request.resources)
            }
        }

        // Allow WebView to autoplay audio (needed for TTS without user gesture)
        bridge.webView.settings.mediaPlaybackRequiresUserGesture = false
    }
}
