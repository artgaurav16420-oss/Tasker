import { supabase } from '../supabase/client';
import { UserProfile } from '../types';

interface UseSessionActionsParams {
  profile: UserProfile | null;
  showToast: (msg: string) => void;
}

export function useSessionActions({ profile, showToast }: UseSessionActionsParams) {
  const copyId = async () => {
    const textToCopy = profile?.uid || '';
    if (!textToCopy) return;

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(textToCopy);
      showToast('Identity Code copied to clipboard');
    } catch (err) {
      console.error('Clipboard access denied:', err);
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
