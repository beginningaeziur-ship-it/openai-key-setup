package app.lovable.interpreter

import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.provider.ContactsContract
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback

/**
 * Capacitor plugin that exposes InterpreterAccessibilityService to the WebView.
 * Registered in MainActivity.kt: add(AccessibilityBridgePlugin::class.java)
 */
@CapacitorPlugin(
    name = "AccessibilityBridge",
    permissions = [
        Permission(strings = ["android.permission.READ_CONTACTS"], alias = "contacts")
    ]
)
class AccessibilityBridgePlugin : Plugin() {

    private val service get() = InterpreterAccessibilityService.instance

    // ── Service Status ────────────────────────────────────────────────────────

    @PluginMethod
    fun checkServiceEnabled(call: PluginCall) {
        call.resolve(JSObject().apply {
            put("enabled", service != null)
        })
    }

    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve()
    }

    // ── Screen Reading ────────────────────────────────────────────────────────

    @PluginMethod
    fun getScreenContent(call: PluginCall) {
        val svc = service ?: run {
            call.reject("Accessibility service not running")
            return
        }
        val content = svc.getScreenContent()
        call.resolve(JSObject().apply {
            put("packageName", content.packageName)
            put("appName", content.appName)
            put("rawText", content.rawText)
            put("elements", JSArray().apply {
                content.elements.forEach { el ->
                    put(JSObject().apply {
                        put("id", el.id)
                        put("label", el.label)
                        put("role", el.role)
                        put("value", el.value)
                        put("isClickable", el.isClickable)
                        put("isFocused", el.isFocused)
                        el.bounds?.let { b ->
                            put("bounds", JSObject().apply {
                                put("left", b.left)
                                put("top", b.top)
                                put("right", b.right)
                                put("bottom", b.bottom)
                            })
                        }
                    })
                }
            })
        })
    }

    @PluginMethod
    fun getFocusedElement(call: PluginCall) {
        val svc = service ?: run {
            call.resolve(JSObject().apply { put("element", null as String?) })
            return
        }
        val content = svc.getScreenContent()
        val focused = content.elements.firstOrNull { it.isFocused }
        call.resolve(JSObject().apply {
            put("element", focused?.let { el ->
                JSObject().apply {
                    put("id", el.id)
                    put("label", el.label)
                    put("role", el.role)
                    put("value", el.value)
                    put("isClickable", el.isClickable)
                    put("isFocused", true)
                }
            })
        })
    }

    // ── UI Automation ─────────────────────────────────────────────────────────

    @PluginMethod
    fun clickElement(call: PluginCall) {
        val label = call.getString("label") ?: run {
            call.reject("label required")
            return
        }
        val svc = service ?: run {
            call.reject("Service not running")
            return
        }
        val ok = svc.clickByLabel(label)
        call.resolve(JSObject().apply {
            put("success", ok)
            put("message", if (ok) "Clicked $label" else "Element not found: $label")
        })
    }

    @PluginMethod
    fun clickElementById(call: PluginCall) {
        val id = call.getString("id") ?: run {
            call.reject("id required")
            return
        }
        val ok = service?.clickById(id) ?: false
        call.resolve(JSObject().apply { put("success", ok) })
    }

    @PluginMethod
    fun clickAtPoint(call: PluginCall) {
        // Uses a gesture path to simulate a tap at (x, y)
        val x = call.getFloat("x") ?: run { call.reject("x required"); return }
        val y = call.getFloat("y") ?: run { call.reject("y required"); return }

        val svc = service ?: run { call.reject("Service not running"); return }

        val path = android.graphics.Path().apply { moveTo(x, y) }
        val stroke = android.accessibilityservice.GestureDescription.StrokeDescription(path, 0L, 100L)
        val gesture = android.accessibilityservice.GestureDescription.Builder()
            .addStroke(stroke)
            .build()

        val dispatched = svc.dispatchGesture(gesture, null, null)
        call.resolve(JSObject().apply { put("success", dispatched) })
    }

    @PluginMethod
    fun typeText(call: PluginCall) {
        val text = call.getString("text") ?: run {
            call.reject("text required")
            return
        }
        val ok = service?.typeText(text) ?: false
        call.resolve(JSObject().apply {
            put("success", ok)
            put("message", if (ok) "Typed: $text" else "No focused input field")
        })
    }

    @PluginMethod
    fun clearText(call: PluginCall) {
        val ok = service?.clearText() ?: false
        call.resolve(JSObject().apply { put("success", ok) })
    }

    @PluginMethod
    fun scrollDown(call: PluginCall) {
        val ok = service?.scrollDown() ?: false
        call.resolve(JSObject().apply { put("success", ok) })
    }

    @PluginMethod
    fun scrollUp(call: PluginCall) {
        val ok = service?.scrollUp() ?: false
        call.resolve(JSObject().apply { put("success", ok) })
    }

    @PluginMethod
    fun pressBack(call: PluginCall) {
        service?.pressBack()
        call.resolve(JSObject().apply { put("success", true) })
    }

    @PluginMethod
    fun pressHome(call: PluginCall) {
        service?.pressHome()
        call.resolve(JSObject().apply { put("success", true) })
    }

    // ── App Control ───────────────────────────────────────────────────────────

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        val pm = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            .filter { pm.getLaunchIntentForPackage(it.packageName) != null }
            .map { appInfo ->
                JSObject().apply {
                    put("name", pm.getApplicationLabel(appInfo).toString())
                    put("packageName", appInfo.packageName)
                }
            }
        call.resolve(JSObject().apply {
            put("apps", JSArray(apps))
        })
    }

    @PluginMethod
    fun launchApp(call: PluginCall) {
        val packageName = call.getString("packageName") ?: run {
            call.reject("packageName required")
            return
        }
        val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            context.startActivity(intent.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK })
            call.resolve(JSObject().apply {
                put("success", true)
                put("message", "Launched $packageName")
            })
        } else {
            call.resolve(JSObject().apply {
                put("success", false)
                put("message", "App not found: $packageName")
            })
        }
    }

    @PluginMethod
    fun getCurrentApp(call: PluginCall) {
        val content = service?.getScreenContent()
        call.resolve(JSObject().apply {
            put("packageName", content?.packageName ?: "unknown")
            put("appName", content?.appName ?: "Unknown")
        })
    }

    // ── Contacts ──────────────────────────────────────────────────────────────

    @PluginMethod
    fun getContacts(call: PluginCall) {
        if (getPermissionState("contacts").name != "GRANTED") {
            requestPermissionForAlias("contacts", call, "contactsPermissionCallback")
            return
        }
        deliverContacts(call)
    }

    @PermissionCallback
    private fun contactsPermissionCallback(call: PluginCall) {
        if (getPermissionState("contacts").name == "GRANTED") {
            deliverContacts(call)
        } else {
            call.reject("Contacts permission denied")
        }
    }

    private fun deliverContacts(call: PluginCall) {
        val contacts = JSArray()
        val cursor: Cursor? = context.contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ),
            null, null,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
        )

        val contactMap = mutableMapOf<String, JSObject>()

        cursor?.use {
            val idIdx = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.CONTACT_ID)
            val nameIdx = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
            val numberIdx = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)

            while (it.moveToNext()) {
                val id = it.getString(idIdx) ?: continue
                val name = it.getString(nameIdx) ?: continue
                val number = it.getString(numberIdx) ?: continue

                if (!contactMap.containsKey(id)) {
                    contactMap[id] = JSObject().apply {
                        put("id", id)
                        put("name", name)
                        put("phoneNumbers", JSArray().apply { put(number) })
                        put("emails", JSArray())
                    }
                } else {
                    val existing = contactMap[id]!!
                    val phones = existing.getJSArray("phoneNumbers") ?: JSArray()
                    phones.put(number)
                    existing.put("phoneNumbers", phones)
                }
            }
        }

        contactMap.values.forEach { contacts.put(it) }
        call.resolve(JSObject().apply { put("contacts", contacts) })
    }

    // ── Notifications ─────────────────────────────────────────────────────────

    @PluginMethod
    fun getNotifications(call: PluginCall) {
        // Requires NotificationListenerService (separate service)
        // For now returns placeholder — full implementation in NotificationBridgeService.kt
        call.resolve(JSObject().apply {
            put("notifications", JSArray())
        })
    }
}
