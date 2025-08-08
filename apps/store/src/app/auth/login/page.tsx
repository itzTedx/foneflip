import Link from "next/link";

import { Button } from "@ziron/ui/button";

export default function LoginPage() {
  return (
    <div>
      <Button>
        <Link href="/auth/register">Register</Link>
      </Button>
    </div>
  );
}
