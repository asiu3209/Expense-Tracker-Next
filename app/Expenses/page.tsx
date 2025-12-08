"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ExpensesPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  return <span>Redirecting...</span>;
}
