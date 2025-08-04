"use client";

import { useTransition } from "react";

import { parseAsBoolean, useQueryState } from "nuqs";
import { toast } from "sonner";

import { IconClock } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ziron/ui/select";
import { expiresInEnum, InviteFormType, invitationSchema } from "@ziron/validators";

import { sendInvitation } from "../actions/mutation";

export default function InviteForm({ defaultValues }: { defaultValues?: Partial<InviteFormType> }) {
  const [isPending, startTransition] = useTransition();
  const [, setOpen] = useQueryState("new", parseAsBoolean.withDefault(false));

  const form = useForm<InviteFormType>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      name: "",
      email: "",
      expiresIn: "1h",
      ...defaultValues,
    },
  });

  async function onSubmit(values: InviteFormType) {
    startTransition(async () => {
      const result = await sendInvitation(values);
      if (result.success) {
        form.reset();
        setOpen(false);
        toast.success("Invitation sent successfully");
      }
      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Name</FormLabel>
                <FormControl>
                  <Input placeholder="Vendor Name" {...field} />
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
                  <Input placeholder="Vendor email" type="email" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <FormField
            control={form.control}
            name="expiresIn"
            render={({ field }) => (
              <FormItem>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="uppercase" id={field.name}>
                      <IconClock />
                      <SelectValue placeholder="1H" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="z-9999 w-auto">
                    {expiresInEnum.options.map((option) => (
                      <SelectItem className="uppercase" key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isPending} type="submit">
            <LoadingSwap isLoading={isPending}>Send Invitation</LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
}
