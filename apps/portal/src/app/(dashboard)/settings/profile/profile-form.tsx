"use client";

import React, { useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";

import { APIError } from "better-auth/api";
import type { Session } from "better-auth/types";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

import { Session as SessionType } from "@ziron/auth";
import { Alert, AlertDescription, AlertTitle } from "@ziron/ui/alert";
import { IconSaveFilled } from "@ziron/ui/assets/icons";
import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { formatDate } from "@ziron/utils";

import { authClient } from "@/lib/auth/client";

import { AvatarUpload } from "./_components/avatar-upload";
import { ChangePassword } from "./_components/change-password";
import { TwoFactor } from "./_components/two-factor";
import { ProfileFormType, profileSchema } from "./profile-schema";
import { getSessionIcon } from "./utils";

interface Props {
  initialData: SessionType;
  activeSessions: Session[];
}

// Memoized form field components to prevent re-renders during typing
const NameField = React.memo(({ form }: { form: ReturnType<typeof useForm<ProfileFormType>> }) => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input placeholder="Your name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

const EmailField = React.memo(({ form }: { form: ReturnType<typeof useForm<ProfileFormType>> }) => (
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="Your Email" {...field} disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

const AvatarField = React.memo(
  ({ form, avatar }: { form: ReturnType<typeof useForm<ProfileFormType>>; avatar: string | null }) => (
    <FormField
      control={form.control}
      name="avatarUrl"
      render={() => (
        <FormItem>
          <FormControl>
            <AvatarUpload avatar={avatar} form={form} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
);

const TwoFactorField = React.memo(
  ({ form, initialData }: { form: ReturnType<typeof useForm<ProfileFormType>>; initialData: SessionType }) => (
    <FormField
      control={form.control}
      name="twoFactorEnabled"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
            <p className="text-muted-foreground text-sm">Add an extra layer of security to your account.</p>
          </div>
          <FormControl>
            <TwoFactor
              isTwoFactorEnabled={initialData.user.twoFactorEnabled}
              onCheckedChange={field.onChange}
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
);

// Memoized session item component
const SessionItem = React.memo(
  ({
    session,
    isCurrentSession,
    isRevokePending,
    onRevoke,
  }: {
    session: Session;
    isCurrentSession: boolean;
    isRevokePending: boolean;
    onRevoke: (token: string) => void;
  }) => {
    const uaParser = useMemo(() => new UAParser(session.userAgent ?? ""), [session.userAgent]);
    const browser = useMemo(() => uaParser.getBrowser(), [uaParser]);
    const os = useMemo(() => uaParser.getOS(), [uaParser]);

    return (
      <div className="flex items-center gap-2">
        {getSessionIcon(session.userAgent)}
        <div>
          <p className="flex items-center gap-1.5 text-sm">
            {browser.name} on {os.name} {os.version}
            {isCurrentSession && (
              <>
                {" • "}
                <Badge>This device</Badge>
              </>
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatDate(session.updatedAt ?? "", {
              includeTime: true,
            })}
          </p>
        </div>
        {!isCurrentSession && (
          <Button
            className="ml-auto"
            disabled={isRevokePending}
            onClick={() => onRevoke(session.token)}
            size="sm"
            type="button"
            variant="destructive"
          >
            <LoadingSwap isLoading={isRevokePending}>Logout</LoadingSwap>
          </Button>
        )}
      </div>
    );
  }
);

export const ProfileForm = React.memo(function ProfileForm({ activeSessions, initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isRevokePending, startRevokeTransition] = useTransition();
  const [isRevokeOthersPending, startRevokeOthersTransition] = useTransition();

  const router = useRouter();

  // Memoize form default values to prevent unnecessary re-initialization
  const formDefaultValues = useMemo(
    () => ({
      name: initialData.user.name ?? "",
      email: initialData.user.email,
      twoFactorEnabled: initialData.user.twoFactorEnabled ?? false,
      avatarUrl: initialData.user.image ?? undefined,
    }),
    [initialData.user.name, initialData.user.email, initialData.user.twoFactorEnabled, initialData.user.image]
  );

  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: formDefaultValues,
  });

  const avatar = form.watch("avatarUrl");

  // Memoize the submit handler to prevent unnecessary re-renders
  const onSubmit: SubmitHandler<ProfileFormType> = useCallback(
    (data) => {
      startTransition(async () => {
        await authClient.updateUser({
          image: data.avatarUrl,
          name: data.name,
        });
      });

      toast.success("Profile updated successfully");
    },
    [startTransition]
  );

  // Memoize session revocation handler
  const handleRevokeSession = useCallback(
    (token: string) => {
      startRevokeTransition(async () => {
        try {
          await authClient.revokeSession({ token });
          toast.success("Logged out");
          router.refresh();
        } catch (error) {
          if (error instanceof APIError) {
            toast.error("Failed to Log out", {
              description: error.message,
            });
          }
        }
      });
    },
    [startRevokeTransition, router]
  );

  // Memoize other sessions revocation handler
  const handleRevokeOtherSessions = useCallback(() => {
    startRevokeOthersTransition(async () => {
      try {
        await authClient.revokeOtherSessions();
        toast.success("Logged out from other devices");
        router.refresh();
      } catch (error: unknown) {
        toast.error("Failed to log out from other devices", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }, [startRevokeOthersTransition, router]);

  // Memoize email verification handler
  const handleSendVerificationEmail = useCallback(async () => {
    await authClient.sendVerificationEmail({
      email: initialData.user.email || "",
      fetchOptions: {
        onSuccess: () => {
          toast.success("Verification email sent");
        },
      },
    });
  }, [initialData.user.email]);

  // Memoize sorted sessions to prevent unnecessary re-computation
  const sortedSessions = useMemo(
    () => [
      ...activeSessions.filter((s) => s.token === initialData.session.token),
      ...activeSessions.filter((s) => s.token !== initialData.session.token),
    ],
    [activeSessions, initialData.session.token]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="px-2 font-medium text-lg">Profile Settings</h2>

          <Button type="submit">
            <LoadingSwap className="flex items-center justify-center gap-1" isLoading={isPending}>
              <IconSaveFilled className="-ms-0.5" />
              Update profile
            </LoadingSwap>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 items-center justify-center gap-3">
                <div className="col-span-2 space-y-4">
                  <NameField form={form} />
                  <EmailField form={form} />
                </div>
                <AvatarField avatar={avatar ?? null} form={form} />
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-muted-foreground text-sm">Set a new password for your account.</p>
                  </div>
                  <ChangePassword>
                    <Button type="button" variant="outline">
                      Change Password
                    </Button>
                  </ChangePassword>
                </div>

                <TwoFactorField form={form} initialData={initialData} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            {initialData.user.emailVerified ? null : (
              <Alert>
                <AlertTitle>Verify Your Email Address</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Please verify your email address. Check your inbox for the verification email. If you haven't received
                  the email, click the button below to resend.
                  <Button
                    className="mt-2"
                    onClick={handleSendVerificationEmail}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Send Verification Email
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <Card className="h-fit">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Login Activity</CardTitle>
                  <CardDescription>A log of your recent login activity.</CardDescription>
                </div>
                <Button
                  disabled={isRevokeOthersPending}
                  onClick={handleRevokeOtherSessions}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <LoadingSwap className="text-xs" isLoading={isRevokePending}>
                    Logout from other devices
                  </LoadingSwap>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedSessions.map((session) => (
                    <SessionItem
                      isCurrentSession={session.token === initialData.session.token}
                      isRevokePending={isRevokePending}
                      key={session.token}
                      onRevoke={handleRevokeSession}
                      session={session}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
});
