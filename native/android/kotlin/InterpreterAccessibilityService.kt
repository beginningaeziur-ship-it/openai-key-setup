package app.lovable.interpreter

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Android Accessibility Service — gives Aria control over every app on the device.
 *
 * Setup: declared in AndroidManifest.xml and enabled by user in
 *   Settings → Accessibility → Aria Interpreter → ON
 */
class InterpreterAccessibilityService : AccessibilityService() {

    companion object {
        // Static reference so the Capacitor plugin can call us synchronously
        @Volatile var instance: InterpreterAccessibilityService? = null

        // Callbacks fired when the visible screen changes (any app)
        val screenChangeListeners = mutableListOf<(ScreenContent) -> Unit>()
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onServiceConnected() {
        instance = this
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = (
                AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                AccessibilityServiceInfo.FLAG_REQUEST_TOUCH_EXPLORATION_MODE or
                AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            )
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    override fun onInterrupt() { /* required override */ }

    // ── Event Handling ────────────────────────────────────────────────────────

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                val content = buildScreenContent(event)
                screenChangeListeners.forEach { it(content) }
            }
        }
    }

    // ── Screen Reading ────────────────────────────────────────────────────────

    fun getScreenContent(): ScreenContent {
        val root = rootInActiveWindow
        val pkgName = root?.packageName?.toString() ?: "unknown"
        val elements = mutableListOf<ScreenElement>()
        val rawText = StringBuilder()

        root?.let { extractNode(it, elements, rawText, 0) }

        return ScreenContent(
            packageName = pkgName,
            appName = getAppName(pkgName),
            elements = elements,
            rawText = rawText.toString().trim()
        )
    }

    private fun buildScreenContent(event: AccessibilityEvent): ScreenContent {
        val pkgName = event.packageName?.toString() ?: "unknown"
        return getScreenContent().copy(packageName = pkgName, appName = getAppName(pkgName))
    }

    private fun extractNode(
        node: AccessibilityNodeInfo,
        elements: MutableList<ScreenElement>,
        rawText: StringBuilder,
        depth: Int
    ) {
        val text = node.text?.toString()?.trim() ?: ""
        val desc = node.contentDescription?.toString()?.trim() ?: ""
        val label = desc.ifBlank { text }
        val role = node.className?.toString()?.substringAfterLast('.') ?: "View"

        if (label.isNotBlank()) {
            elements.add(
                ScreenElement(
                    id = node.viewIdResourceName ?: "$depth-${elements.size}",
                    label = label,
                    role = role,
                    value = if (node.isEditable) text else null,
                    isClickable = node.isClickable,
                    isFocused = node.isFocused,
                    bounds = node.getBoundsInScreen()
                )
            )
            if (node.isClickable) rawText.append("Button: $label\n")
            else rawText.append("$label\n")
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            extractNode(child, elements, rawText, depth + 1)
            child.recycle()
        }
    }

    // ── UI Automation ─────────────────────────────────────────────────────────

    fun clickByLabel(label: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val node = findNodeByLabel(root, label) ?: return false
        val result = node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        node.recycle()
        return result
    }

    fun clickById(viewId: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val nodes = root.findAccessibilityNodeInfosByViewId(viewId)
        if (nodes.isEmpty()) return false
        val result = nodes[0].performAction(AccessibilityNodeInfo.ACTION_CLICK)
        nodes.forEach { it.recycle() }
        return result
    }

    fun typeText(text: String): Boolean {
        // Type into whichever input currently has focus
        val focused = rootInActiveWindow?.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
            ?: return false
        val args = Bundle().apply {
            putCharSequence(
                AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                text
            )
        }
        val result = focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
        focused.recycle()
        return result
    }

    fun clearText(): Boolean {
        return typeText("")
    }

    fun scrollDown(): Boolean = performGlobalAction(GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS)
        .also { scrollInDirection(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_FORWARD) }
        .let { true }

    fun scrollUp(): Boolean {
        scrollInDirection(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_BACKWARD)
        return true
    }

    private fun scrollInDirection(action: AccessibilityNodeInfo.AccessibilityAction): Boolean {
        val root = rootInActiveWindow ?: return false
        return findScrollable(root)?.let {
            val result = it.performAction(action.id)
            it.recycle()
            result
        } ?: false
    }

    private fun findScrollable(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (node.isScrollable) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findScrollable(child)
            if (found != null) return found
            child.recycle()
        }
        return null
    }

    fun pressBack()  { performGlobalAction(GLOBAL_ACTION_BACK) }
    fun pressHome()  { performGlobalAction(GLOBAL_ACTION_HOME) }
    fun pressRecents() { performGlobalAction(GLOBAL_ACTION_RECENTS) }

    // ── Node Search ───────────────────────────────────────────────────────────

    private fun findNodeByLabel(
        node: AccessibilityNodeInfo,
        label: String
    ): AccessibilityNodeInfo? {
        val text = node.text?.toString() ?: ""
        val desc = node.contentDescription?.toString() ?: ""
        val match = text.contains(label, ignoreCase = true) ||
                    desc.contains(label, ignoreCase = true)

        if (match && node.isClickable) return node

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val found = findNodeByLabel(child, label)
            if (found != null) return found
            child.recycle()
        }
        return null
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun getAppName(packageName: String): String {
        return try {
            val pm = applicationContext.packageManager
            pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    private fun AccessibilityNodeInfo.getBoundsInScreen(): ElementBounds {
        val rect = android.graphics.Rect()
        getBoundsInScreen(rect)
        return ElementBounds(rect.left, rect.top, rect.right, rect.bottom)
    }
}

// ── Data Classes ──────────────────────────────────────────────────────────────

data class ScreenContent(
    val packageName: String,
    val appName: String,
    val elements: List<ScreenElement>,
    val rawText: String
)

data class ScreenElement(
    val id: String,
    val label: String,
    val role: String,
    val value: String?,
    val isClickable: Boolean,
    val isFocused: Boolean,
    val bounds: ElementBounds?
)

data class ElementBounds(
    val left: Int,
    val top: Int,
    val right: Int,
    val bottom: Int
)
