import { supabase } from '../supabase/client';
import { UserProfile } from '../types';
import { log } from '../logger';

interface UseSessionActionsParams {
  profile: UserProfile | null;
  showToast: (msg: string) => void;
}

export function useSessionActions({ profile, showToast }: UseSessionActionsParams) {
  const copyId = async () => {
    const textToCopy = profile?.uid || '';
    if (!textToCopy) return;

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Identity Code copied to clipboard');
        return;
      }
      await navigator.clipboard.writeText(textToCopy);
      showToast('Identity Code copied to clipboard');
    } catch (err) {
      log.error('Clipboard access denied:', err);
      showToast('Browser blocked copy. Please select text manually.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Logout failed: ${error.message}`);
    }
  };

  return { copyId, handleLogout };
}
