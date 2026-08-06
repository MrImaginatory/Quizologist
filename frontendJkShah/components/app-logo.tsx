"use client";

import Image from "next/image";
import { useAppConfig } from "@/hooks/use-app-config";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 48, text: "text-2xl" },
};

export function AppLogo({ className, size = "md", showName = true }: AppLogoProps) {
  const { appName, appLogo } = useAppConfig();
  const { icon, text } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {appLogo ? (
        <Image
          src={appLogo}
          alt={`${appName} logo`}
          width={40}
          height={48}
          className="shrink-0"
          style={{ width: icon, height: "auto" }}
        />
      ) : (
        <div 
          className="shrink-0 rounded bg-primary/20 flex items-center justify-center text-primary font-bold" 
          style={{ width: icon, height: icon }}
        >
          {appName ? appName.charAt(0) : "L"}
        </div>
      )}
      {showName && (
        <span className={cn("font-bold text-foreground", text)}>
          {appName}
        </span>
      )}
    </div>
  );
}
