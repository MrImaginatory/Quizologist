import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-[300px] border-r p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center justify-between px-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
