"use client";

import { authClient } from "@/lib/auth/client";

import { APIError } from "better-auth/api";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "sonner";

import { Session } from "@ziron/auth";
import { IconSaveFilled } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/card";
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

import { AvatarUpload } from "./_components/avatar-upload";
import { ProfileFormType, profileSchema } from "./profile-schema";

interface Props {
  initialData: Session;
  // sessions: {
  //   token: string;
  //   expiresAt: Date;
  //   id: string;
  //   createdAt: Date;
  //   updatedAt: Date;
  //   userId: string;
  //   ipAddress?: string | null | undefined | undefined;
  //   userAgent?: string | null | undefined | undefined;
  // }[];
}

export function ProfileForm({ initialData }: Props) {
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
  // const sortedSessions = [
  //   ...(sessions ?? []).filter((s) => s.id === initialData.session.id),
  //   ...(sessions ?? []).filter((s) => s.id !== initialData.session.id),
  // ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="px-2 text-lg font-medium">Profile Settings</h2>

          <Button type="submit">
            <LoadingSwap
              isLoading={isPending}
              className="flex items-center justify-center gap-1"
            >
              <IconSaveFilled className="-ms-0.5" />
              Update profile
            </LoadingSwap>
          </Button>
        </div>
        <div className="gap-3 space-y-3 md:columns-2">
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
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
                      <AvatarUpload form={form} avatar={avatar ?? null} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-muted-foreground text-sm">
                    Set a new password for your account.
                  </p>
                </div>
                <Button type="button" variant="outline">
                  Change Password
                </Button>
              </div>
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Two-Factor Authentication
                      </FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <FormControl>
                      {/* <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setIsTwoFactorModalOpen(true);
                          } else {
                            setIsDisableTwoFactorModalOpen(true);
                          }
                        }}
                      /> */}
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a picture to make your profile stand out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="avatarUrl"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <AvatarUpload form={form} avatar={avatar ?? null} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card> */}

          <Card className="break-inside-avoid">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Login Activity</CardTitle>
                <CardDescription>
                  A log of your recent login activity.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRevokePending}
                onClick={handleRevokeOtherSessions}
              >
                <LoadingSwap isLoading={isRevokePending} className="text-xs">
                  Logout from other devices
                </LoadingSwap>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* {sortedSessions.map((session) => (
                  <div className="flex items-center gap-2" key={session.id}>
                    {getSessionIcon(session.userAgent)}
                    <div>
                      <p className="flex items-center gap-1 text-sm">
                        {formatUserAgent(session.userAgent)}
                        {session.id === initialData.session.id && (
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
                    {session.id !== initialData.session.id && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="ml-auto"
                        disabled={isRevokeOthersPending}
                        onClick={() => handleRevokeSession(session.token)}
                      >
                        <LoadingSwap isLoading={isRevokeOthersPending}>
                          Logout
                        </LoadingSwap>
                      </Button>
                    )}
                  </div>
                ))} */}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
