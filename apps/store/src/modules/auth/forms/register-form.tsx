"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { IconEye, IconEyeOff } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { toast } from "@ziron/ui/sonner";
import { registerUserSchema, z } from "@ziron/validators";

import { signUp } from "@/lib/auth/client";

export const RegisterForm = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerUserSchema>) {
    startTransition(async () => {
      await signUp.email({
        email: values.email,
        name: values.username,
        password: values.password,
        fetchOptions: {
          onSuccess: async (_response) => {
            // Invalidate user caches after successful registration

            toast.success("Registration Successful!");
            router.push("/");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      autoFocus
                      id="username"
                      placeholder="Username"
                      type="text"
                      {...field}
                    />
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
                    <Input
                      autoComplete="email webauthn"
                      id="email"
                      placeholder="johndoe@mail.com"
                      required
                      type="email"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        autoComplete="current-password webauthn"
                        className="pe-9"
                        id="password"
                        placeholder="Password"
                        type={isVisible ? "text" : "password"}
                        {...field}
                        required
                      />
                      <button
                        aria-controls="password"
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        aria-pressed={isVisible}
                        className="absolute inset-y-0 end-0 flex h-full w-9 cursor-pointer items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={toggleVisibility}
                        type="button"
                      >
                        {isVisible ? (
                          <IconEyeOff aria-hidden="true" className="size-4" />
                        ) : (
                          <IconEye aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={isPending} size="lg" type="submit">
              <LoadingSwap isLoading={isPending}>Register</LoadingSwap>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
