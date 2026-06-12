import { supabase } from '../supabase/client';

export function useLogout(showToast: (msg: string) => void) {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Logout failed: ${error.message}`);
    }
  };

  return { handleLogout };
}
