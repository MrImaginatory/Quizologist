import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
