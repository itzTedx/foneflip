import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Button } from "@ziron/ui/components/button";
import { Card, CardContent } from "@ziron/ui/components/card";
import { Input } from "@ziron/ui/components/input";
import { Label } from "@ziron/ui/components/label";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-md">
          <div className="absolute inset-x-0 -top-1/2 h-full w-full -translate-y-[10%] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="bg-brand-secondary absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full opacity-20 blur-[100px]"></div>
          </div>
          <CardContent className="z-10 p-6 px-9">
            <div className="from-primary to-brand-secondary border-background dark:border-foreground/60 shadow-primary/30 mx-auto grid size-14 place-content-center rounded-full border-t bg-gradient-to-tr shadow-lg">
              <IconLogoMono className="size-9 text-white" aria-hidden={true} />
            </div>

            <h3 className="text-foreground mt-6 text-center text-lg font-semibold">
              Welcome back
            </h3>
            <p className="text-muted-foreground text-center text-sm">
              Enter your email to sign in to your account
            </p>

            <form className="mt-9">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    // value={username}
                    // onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@mail.com"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="*:not-first:mt-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      className="pe-9"
                      placeholder="Password"
                      //   type={isVisible ? "text" : "password"}
                      //   value={password}
                      //   onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      //   onClick={toggleVisibility}
                      //   aria-label={isVisible ? "Hide password" : "Show password"}
                      //   aria-pressed={isVisible}
                      aria-controls="password"
                    >
                      {/* {isVisible ? (
                    <EyeOffIcon size={16} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={16} aria-hidden="true" />
                  )} */}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  //   disabled={emailPending}
                >
                  <LoadingSwap isLoading={false}>Register</LoadingSwap>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
