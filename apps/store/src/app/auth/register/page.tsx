import { IconBrandGoogle } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { Separator } from "@ziron/ui/separator";

export default function RegisterPage() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-20">
        <div className="mb-4">
          <h1 className="font-bold text-2xl">Get Started Now</h1>
          <p>Create an account to get started with our platform. It's free and easy to do.</p>
        </div>
        <Button className="w-full" size="lg" variant="outline">
          <IconBrandGoogle /> Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-2">
          <Separator className="flex-1" />
          or
          <Separator className="flex-1" />
        </div>
      </div>
      <div className="rounded-3xl bg-primary">
        <div className="h-full w-full" />
      </div>
    </div>
  );
}
