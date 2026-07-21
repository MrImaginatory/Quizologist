import { Skeleton } from "@/components/ui/skeleton";

export default function TestLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}
