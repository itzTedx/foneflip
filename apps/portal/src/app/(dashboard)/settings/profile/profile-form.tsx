"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconX } from "@tabler/icons-react";
import { APIError } from "better-auth/api";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Session } from "@ziron/auth";
import { Button } from "@ziron/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ziron/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ziron/ui/components/form";
import { Input } from "@ziron/ui/components/input";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";

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
            <LoadingSwap isLoading={isPending}>Update profile</LoadingSwap>
          </Button>
        </div>
        <div className="columns-2 gap-3 space-y-3">
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          <Card className="break-inside-avoid">
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
                      {avatar ? (
                        <div className="relative aspect-square size-40 shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            fill
                            src={avatar}
                            alt={""}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 size-5 rounded-full border backdrop-blur-xl"
                            onClick={() =>
                              form.setValue("avatarUrl", undefined)
                            }
                            aria-label="Remove picture"
                          >
                            <IconX className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        // <UploadDropzone
                        //   endpoint="avatarUploader"
                        //   onClientUploadComplete={(res) => {
                        //     if (res) {
                        //       form.setValue("avatarUrl", res[0].ufsUrl);
                        //       toast.success("Profile picture uploaded");
                        //     }
                        //   }}
                        //   onUploadError={(error: Error) => {
                        //     form.setError("avatarUrl", {
                        //       message: error.message,
                        //     });
                        //     toast.error("Error uploading file", {
                        //       description: error.message,
                        //     });
                        //   }}
                        //   config={{
                        //     mode: "auto",
                        //   }}
                        // />
                        "Upload"
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
