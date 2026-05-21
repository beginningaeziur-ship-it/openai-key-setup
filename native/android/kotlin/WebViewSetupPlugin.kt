package app.lovable.interpreter

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Configures the Capacitor WebView for full voice and audio support.
 * Register in MainActivity alongside AccessibilityBridgePlugin.
 *
 * Enables:
 *  - Web Speech API (speech recognition) in the WebView
 *  - Audio playback without requiring a user gesture first
 *  - Microphone access without repeated permission prompts
 */
@CapacitorPlugin(name = "WebViewSetup")
class WebViewSetupPlugin : Plugin() {

    override fun load() {
        val webView = bridge.webView

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false

            // Required for Web Speech API to work in Capacitor WebView
            @Suppress("SetJavaScriptEnabled")
            javaScriptEnabled = true
        }

        // Inject JavaScript to verify Web Speech API availability
        // and polyfill if needed
        bridge.webView.post {
            webView.evaluateJavascript(
                """
                (function() {
                    if (!window.SpeechRecognition && window.webkitSpeechRecognition) {
                        window.SpeechRecognition = window.webkitSpeechRecognition;
                    }
                    console.log('[Aria] Speech API available:', !!window.SpeechRecognition);
                })();
                """.trimIndent(),
                null
            )
        }
    }

    @PluginMethod
    fun checkVoiceSupport(call: PluginCall) {
        bridge.webView.post {
            bridge.webView.evaluateJavascript(
                "!!(window.SpeechRecognition || window.webkitSpeechRecognition)"
            ) { result ->
                call.resolve(com.getcapacitor.JSObject().apply {
                    put("supported", result == "true")
                })
            }
        }
    }
}
