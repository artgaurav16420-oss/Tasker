import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '../supabase/client';
import { UserProfile, ConfirmDialogState } from '../types';
import { log } from '../logger';
import { mapPgError } from '../errors';

interface UseTeamManagementProps {
  profile: UserProfile | null;
  showToast: (msg: string) => void;
  setConfirmDialog: Dispatch<SetStateAction<ConfirmDialogState>>;
  onEmployeeAdded?: (employee: UserProfile) => void;
  onEmployeeRemoved?: (employeeId: string) => void;
  onSuperiorAdded?: (superior: UserProfile) => void;
  onSuperiorRemoved?: (superiorId: string) => void;
  refetchData?: () => void;
}

export function useTeamManagement({
  profile,
  showToast,
  setConfirmDialog,
  onEmployeeAdded,
  onEmployeeRemoved,
  onSuperiorAdded,
  onSuperiorRemoved,
  refetchData,
}: UseTeamManagementProps) {

  const resolveUserId = async (input: string) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(input);
    if (isEmail) {
      const { data, error } = await supabase.from('users').select('uid').eq('email', input).maybeSingle();
      if (error || !data) {
        throw new Error("No user found with this email.");
      }
      return data.uid;
    }
    return input;
  };

  const handleUpdateManager = async (
    e: React.FormEvent,
    managerCode: string,
    setManagerCode: (v: string) => void,
    setIsJoining: (v: boolean) => void
  ) => {
    e.preventDefault();
    if (!profile || !managerCode.trim()) return;
    setIsJoining(true);
    try {
      const targetUid = await resolveUserId(managerCode.trim());

      if (targetUid === profile.uid) {
        showToast("You cannot add yourself as a manager.");
        return;
      }

      const currentManagerIds = profile.managerIds || [];
      if (currentManagerIds.includes(targetUid)) {
        showToast("This manager is already added.");
        return;
      }

      let superiorProfile: UserProfile | null = null;
      const { data: profileData } = await supabase.from("users").select("*").eq("uid", targetUid).maybeSingle();
      superiorProfile = profileData as UserProfile | null;

      const { error } = await supabase.rpc('member_join_team', {
        superior_uid: targetUid
      });

      if (error) throw error;

      showToast("Successfully connected with superior!");
      setManagerCode("");
      if (superiorProfile) onSuperiorAdded?.(superiorProfile);
      refetchData?.();
    } catch (err: unknown) {
      log.error(err);
      showToast(mapPgError(err).message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAddMember = async (
    e: React.FormEvent,
    memberCode: string,
    setMemberCode: (v: string) => void,
    setIsAddingMember: (v: boolean) => void
  ) => {
    e.preventDefault();
    if (!profile || !memberCode.trim()) return;
    setIsAddingMember(true);
    try {
      const targetUid = await resolveUserId(memberCode.trim());

      if (targetUid === profile.uid) {
        showToast("You cannot add yourself to your team.");
        return;
      }

      let memberProfile: UserProfile | null = null;
      const { data: profileData } = await supabase.from("users").select("*").eq("uid", targetUid).maybeSingle();
      memberProfile = profileData as UserProfile | null;

      const { error: rpcError } = await supabase.rpc('add_team_member', {
        admin_uid: profile.uid,
        member_uid: targetUid
      });

      if (rpcError) {
        if (rpcError.message.includes('function does not exist')) {
          showToast("Server-side connection logic required. Please contact administrator to enable Team RPCs.");
        } else {
          throw rpcError;
        }
        return;
      }

      showToast("Operative successfully added to team!");
      setMemberCode("");
      if (memberProfile) onEmployeeAdded?.(memberProfile);
      refetchData?.();
    } catch (err: unknown) {
      log.error(err);
      showToast(mapPgError(err).message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveSuperior = (superiorId: string) => {
    if (!profile) return;

    setConfirmDialog({
      isOpen: true,
      title: "Disconnect",
      message: "Are you sure you want to disconnect? They will no longer be able to assign you tasks or view your activity.",
      confirmText: "Disconnect",
      danger: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.rpc('member_leave_team', {
            superior_uid: superiorId
          });

          if (error) throw error;

          onSuperiorRemoved?.(superiorId);

          showToast("Successfully disconnected from superior");
          refetchData?.();
        } catch (error) {
          log.error("Error removing superior:", error);
          showToast(mapPgError(error).message);
        } finally {
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      }
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    if (!profile) return;

    setConfirmDialog({
      isOpen: true,
      title: "Remove Member",
      message: "Are you sure you want to remove this member? You will lose access to assign them tasks.",
      confirmText: "Remove Member",
      danger: true,
      onConfirm: async () => {
        try {
          const { error: rpcError } = await supabase.rpc('remove_team_member', {
            admin_uid: profile.uid,
            member_uid: employeeId
          });

          if (rpcError) throw rpcError;

          onEmployeeRemoved?.(employeeId);

          showToast("Member removed from team");
          refetchData?.();
        } catch (error: unknown) {
          log.error("Error removing employee:", error);
          const errMsg = error instanceof Error ? error.message : '';
          if (errMsg.includes('function does not exist')) {
            showToast("Server-side function missing. Contact administrator.");
          } else {
            showToast(mapPgError(error).message);
          }
        } finally {
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      }
    });
  };

  return {
    handleUpdateManager,
    handleAddMember,
    handleRemoveSuperior,
    handleRemoveEmployee,
  };
}
