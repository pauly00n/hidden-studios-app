'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinkButton() {
  const pathname = usePathname();
  const isOnProfile = pathname === '/profile';

  return (
    <Button asChild size="sm" variant={"outline"}>
      <Link href={isOnProfile ? "/dashboard" : "/profile"}>
        {isOnProfile ? "Dashboard" : "Profile"}
      </Link>
    </Button>
  );
} 