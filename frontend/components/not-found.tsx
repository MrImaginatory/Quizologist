"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="animate-fade-in-up">
          <AppLogo size="lg" showName={false} />
        </div>

        <div className="mt-8 text-8xl font-bold text-primary/20 select-none animate-fade-in-up animation-delay-100">
          404
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-foreground animate-fade-in-up animation-delay-200">
          Page Not Found
        </h1>

        <p className="mt-3 text-muted-foreground text-center animate-fade-in-up animation-delay-300">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-400">
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
