"use client";

import { useTransition } from "react";
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

export function ProfileForm({ activeSessions, initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isRevokePending, startRevokeTransition] = useTransition();
  const [isRevokeOthersPending, startRevokeOthersTransition] = useTransition();

  const router = useRouter();
  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.user.name ?? "",
      email: initialData.user.email,
      twoFactorEnabled: initialData.user.twoFactorEnabled ?? false,
      avatarUrl: initialData.user.image ?? undefined,
    },
  });

  const avatar = form.watch("avatarUrl");

  const onSubmit: SubmitHandler<ProfileFormType> = (data) => {
    startTransition(async () => {
      await authClient.updateUser({
        image: data.avatarUrl,
        name: data.name,
      });
    });

    toast.success("Profile updated successfully");
  };

  // Handler for revoking a session (logout)
  const handleRevokeSession = (token: string) => {
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
  };

  // Handler for revoking all other sessions (logout from other devices)
  const handleRevokeOtherSessions = () => {
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
  };

  //   Ensure current device session is always first
  const sortedSessions = [
    ...activeSessions.filter((s) => s.token === initialData.session.token),
    ...activeSessions.filter((s) => s.token !== initialData.session.token),
  ];

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
                </div>
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <AvatarUpload avatar={avatar ?? null} form={form} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {/* <TestTwoFA session={initialData} /> */}
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
                    onClick={async () => {
                      await authClient.sendVerificationEmail({
                        email: initialData.user.email || "",
                      });
                    }}
                    size="sm"
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
                    <div className="flex items-center gap-2" key={session.token}>
                      {getSessionIcon(session.userAgent)}
                      <div>
                        <p className="flex items-center gap-1.5 text-sm">
                          {new UAParser(session.userAgent ?? "").getBrowser().name} on{" "}
                          {new UAParser(session.userAgent ?? "").getOS().name}{" "}
                          {new UAParser(session.userAgent ?? "").getOS().version}
                          {session.token === initialData.session.token && (
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
                      {session.token !== initialData.session.token && (
                        <Button
                          className="ml-auto"
                          disabled={isRevokePending}
                          onClick={() => handleRevokeSession(session.token)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          <LoadingSwap isLoading={isRevokePending}>Logout</LoadingSwap>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
