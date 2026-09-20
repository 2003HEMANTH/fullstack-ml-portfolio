import type { ReactNode } from "react";
import DashboardGuard from "@/components/DashboardGuard";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
