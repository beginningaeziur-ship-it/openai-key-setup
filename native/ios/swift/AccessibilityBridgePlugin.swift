import Foundation
import Capacitor
import UIKit
import Contacts

/**
 * iOS Capacitor plugin — provides screen reading and app control to the WebView.
 *
 * iOS is more sandboxed than Android, so capabilities differ:
 *  ✅ Read current app's accessibility tree (within our WebView)
 *  ✅ Synthesize speech (TTS)
 *  ✅ Open other apps via URL schemes
 *  ✅ Read contacts (with permission)
 *  ✅ Detect VoiceOver state
 *  ⚠️  Cannot control other apps' UI (iOS sandbox restriction)
 *      — guide user to use VoiceOver + Siri Shortcuts for cross-app control
 */
@objc(AccessibilityBridgePlugin)
public class AccessibilityBridgePlugin: CAPPlugin {

    // ── Service Status ────────────────────────────────────────────────────────

    @objc func checkServiceEnabled(_ call: CAPPluginCall) {
        // On iOS we consider "service enabled" if VoiceOver is running
        // or if we're running in a Capacitor native context
        let voiceOverRunning = UIAccessibility.isVoiceOverRunning
        call.resolve(["enabled": true, "voiceOverActive": voiceOverRunning])
    }

    @objc func openAccessibilitySettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url)
            }
        }
        call.resolve()
    }

    // ── Screen Reading ────────────────────────────────────────────────────────

    @objc func getScreenContent(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let webView = self.webView else {
                call.reject("WebView not available")
                return
            }

            // Read the accessibility tree of the current WebView
            let elements = self.extractAccessibilityElements(from: webView)
            let rawText = elements.map { $0["label"] as? String ?? "" }
                .filter { !$0.isEmpty }
                .joined(separator: "\n")

            call.resolve([
                "packageName": Bundle.main.bundleIdentifier ?? "unknown",
                "appName": Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? "App",
                "elements": elements,
                "rawText": rawText
            ])
        }
    }

    private func extractAccessibilityElements(from view: UIView) -> [[String: Any]] {
        var results: [[String: Any]] = []

        func traverse(_ v: UIView) {
            let label = v.accessibilityLabel ?? ""
            let value = v.accessibilityValue ?? ""
            let traits = v.accessibilityTraits

            if !label.isEmpty || !value.isEmpty {
                let isClickable = traits.contains(.button) ||
                                  traits.contains(.link) ||
                                  v.isUserInteractionEnabled

                results.append([
                    "id": "\(ObjectIdentifier(v).hashValue)",
                    "label": label,
                    "role": traitToRole(traits),
                    "value": value,
                    "isClickable": isClickable,
                    "isFocused": UIAccessibility.focusedElement(using: .assistiveTechnology) as? UIView === v
                ])
            }

            for subview in v.subviews {
                traverse(subview)
            }
        }

        traverse(view)
        return results
    }

    private func traitToRole(_ traits: UIAccessibilityTraits) -> String {
        if traits.contains(.button) { return "Button" }
        if traits.contains(.link) { return "Link" }
        if traits.contains(.header) { return "Heading" }
        if traits.contains(.image) { return "Image" }
        if traits.contains(.searchField) { return "SearchField" }
        return "Text"
    }

    @objc func getFocusedElement(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let focused = UIAccessibility.focusedElement(using: .assistiveTechnology)
            if let el = focused as? UIView,
               let label = el.accessibilityLabel {
                call.resolve([
                    "element": [
                        "label": label,
                        "role": self.traitToRole(el.accessibilityTraits),
                        "value": el.accessibilityValue ?? "",
                        "isClickable": el.isUserInteractionEnabled,
                        "isFocused": true
                    ]
                ])
            } else {
                call.resolve(["element": NSNull()])
            }
        }
    }

    // ── App Control (iOS URL scheme opening) ─────────────────────────────────

    @objc func getInstalledApps(_ call: CAPPluginCall) {
        // iOS cannot enumerate installed apps — return well-known deep links instead
        let knownApps: [[String: String]] = [
            ["name": "Phone",    "packageName": "tel://"],
            ["name": "Messages", "packageName": "sms://"],
            ["name": "Mail",     "packageName": "mailto://"],
            ["name": "Safari",   "packageName": "https://"],
            ["name": "Maps",     "packageName": "maps://"],
            ["name": "Music",    "packageName": "music://"],
            ["name": "Settings", "packageName": "app-settings://"],
            ["name": "FaceTime", "packageName": "facetime://"],
        ]
        call.resolve(["apps": knownApps])
    }

    @objc func launchApp(_ call: CAPPluginCall) {
        guard let packageName = call.getString("packageName") else {
            call.reject("packageName required")
            return
        }

        DispatchQueue.main.async {
            guard let url = URL(string: packageName),
                  UIApplication.shared.canOpenURL(url) else {
                call.resolve(["success": false, "message": "Cannot open: \(packageName)"])
                return
            }
            UIApplication.shared.open(url) { success in
                call.resolve(["success": success])
            }
        }
    }

    @objc func getCurrentApp(_ call: CAPPluginCall) {
        let appName = Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? "App"
        call.resolve([
            "packageName": Bundle.main.bundleIdentifier ?? "unknown",
            "appName": appName
        ])
    }

    // ── Contacts ──────────────────────────────────────────────────────────────

    @objc func getContacts(_ call: CAPPluginCall) {
        let store = CNContactStore()
        store.requestAccess(for: .contacts) { granted, error in
            guard granted else {
                call.reject("Contacts permission denied")
                return
            }

            let keys = [
                CNContactGivenNameKey,
                CNContactFamilyNameKey,
                CNContactPhoneNumbersKey,
                CNContactEmailAddressesKey,
                CNContactIdentifierKey
            ] as [CNKeyDescriptor]

            let request = CNContactFetchRequest(keysToFetch: keys)
            var contacts: [[String: Any]] = []

            try? store.enumerateContacts(with: request) { contact, _ in
                contacts.append([
                    "id": contact.identifier,
                    "name": "\(contact.givenName) \(contact.familyName)".trimmingCharacters(in: .whitespaces),
                    "phoneNumbers": contact.phoneNumbers.map { $0.value.stringValue },
                    "emails": contact.emailAddresses.map { $0.value as String }
                ])
            }

            call.resolve(["contacts": contacts])
        }
    }

    // ── Stub methods required by plugin interface ─────────────────────────────

    @objc func clickElement(_ call: CAPPluginCall) {
        // iOS cannot click elements in other apps — guide user
        call.resolve([
            "success": false,
            "message": "On iPhone, use VoiceOver gestures or Siri to control other apps. I can control elements within this app."
        ])
    }

    @objc func typeText(_ call: CAPPluginCall) {
        call.resolve(["success": false, "message": "Typing in other apps requires VoiceOver on iPhone."])
    }

    @objc func scrollDown(_ call: CAPPluginCall)  { call.resolve(["success": false]) }
    @objc func scrollUp(_ call: CAPPluginCall)    { call.resolve(["success": false]) }
    @objc func pressBack(_ call: CAPPluginCall)   { call.resolve(["success": false]) }
    @objc func clearText(_ call: CAPPluginCall)   { call.resolve(["success": false]) }
    @objc func clickAtPoint(_ call: CAPPluginCall) { call.resolve(["success": false]) }
    @objc func clickElementById(_ call: CAPPluginCall) { call.resolve(["success": false]) }

    @objc func pressHome(_ call: CAPPluginCall) {
        // iOS 16+ allows requesting the device to go home via UIApplication
        call.resolve(["success": false, "message": "Press the Home button to go to your home screen."])
    }

    @objc func getNotifications(_ call: CAPPluginCall) {
        call.resolve(["notifications": []])
    }
}
