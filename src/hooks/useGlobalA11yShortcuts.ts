import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SOS_EVENT = 'sai:open-sos';

/** Opens the SOS flow from anywhere. */
export function openSOS() {
  document.dispatchEvent(new CustomEvent(SOS_EVENT));
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable === true
  );
}

/**
 * Global keyboard shortcuts:
 * - Escape: return to home
 * - S: open the SOS flow
 * Both are ignored while typing in a field or while a dialog is open.
 */
export function useGlobalA11yShortcuts(homePath = '/sai-home') {
  const navigate = useNavigate();

  useEffect(() => {
    let lastDialogSeenAt = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const dialogOpen = !!document.querySelector(
        '[role="dialog"],[role="alertdialog"]'
      );
      if (dialogOpen) lastDialogSeenAt = Date.now();
      // A dialog closing on this same Escape must not also navigate home.
      const dialogJustClosed = Date.now() - lastDialogSeenAt < 400;

      if (e.key === 'Escape') {
        if (dialogOpen || dialogJustClosed || isTypingTarget(e.target)) return;
        if (window.location.pathname !== homePath) {
          navigate(homePath);
        }
        return;
      }


      if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (dialogOpen || isTypingTarget(e.target)) return;
        e.preventDefault();
        openSOS();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigate, homePath]);
}
