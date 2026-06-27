"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type BookingRouteGuardProps = {
  children: React.ReactNode;
  isAllowed: boolean;
  redirectTo: string;
};

export function BookingRouteGuard({
  children,
  isAllowed,
  redirectTo,
}: BookingRouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAllowed) {
      router.replace(redirectTo);
    }
  }, [isAllowed, redirectTo, router]);

  if (!isAllowed) {
    return null;
  }

  return children;
}
