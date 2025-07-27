"use client";


import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@ziron/auth/client";
import { Button } from "@ziron/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  zodResolver,
} from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { toast } from "@ziron/ui/sonner";
import { registerUserSchema, z } from "@ziron/validators";

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
      await authClient.signUp.email({
        email: values.email,
        name: values.username,
        password: values.password,
        fetchOptions: {
          onSuccess: () => {
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-9">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" type="text" id="username" autoFocus autoComplete="name webauthn" {...field} />
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
                      id="email"
                      type="email"
                      placeholder="johndoe@mail.com"
                      required
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
                        id="password"
                        className="pe-9"
                        placeholder="Password"
                        type={isVisible ? "text" : "password"}
                        {...field}
                        required
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisible}
                        aria-controls="password"
                      >
                        {isVisible ? (
                          <EyeOffIcon size={16} aria-hidden="true" />
                        ) : (
                          <EyeIcon size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              <LoadingSwap isLoading={isPending}>Register</LoadingSwap>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
