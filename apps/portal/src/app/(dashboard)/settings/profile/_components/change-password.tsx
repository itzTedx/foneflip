import { useState, useTransition } from "react";

import { IconLock } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Checkbox } from "@ziron/ui/checkbox";
import { Label } from "@ziron/ui/label";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { ResponsiveModal } from "@ziron/ui/responsive-modal";

import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/client";

interface Props {
  children: React.ReactNode;
}

export function ChangePassword({ children }: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);

  const handleChangePassword = async () => {
    startTransition(async () => {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      const res = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: signOutDevices,
      });

      if (res.error) {
        toast.error(res.error.message || "Couldn't change your password! Make sure it's correct");
      } else {
        setOpen(false);
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <ResponsiveModal
      closeModal={setOpen}
      description="Set a new password for your account."
      icon={<IconLock />}
      isOpen={open}
      title="Change Password"
      trigger={children}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <PasswordInput
            autoComplete="current-password"
            id="current-password"
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Password"
            value={currentPassword}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput
            autoComplete="new-password"
            id="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            value={newPassword}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Confirm Password</Label>
          <PasswordInput
            autoComplete="new-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            value={confirmPassword}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox onCheckedChange={(checked) => (checked ? setSignOutDevices(true) : setSignOutDevices(false))} />
          <p className="text-sm">Sign out from other devices</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          onClick={handleChangePassword}
        >
          <LoadingSwap isLoading={isPending}>Change Password</LoadingSwap>
        </Button>
      </div>
    </ResponsiveModal>
  );
}
