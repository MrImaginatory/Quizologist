import { RouteGuard } from "@/components/auth/route-guard";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireAuth={true}>
      <div className="h-screen overflow-hidden">
        {children}
      </div>
    </RouteGuard>
  );
}
