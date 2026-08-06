"use client";

import Image from "next/image";
import { useAppConfig } from "@/hooks/use-app-config";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "sidebar";
  showName?: boolean;
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm", imgW: 40, imgH: 48 },
  md: { icon: 32, text: "text-lg", imgW: 40, imgH: 48 },
  lg: { icon: 48, text: "text-2xl", imgW: 80, imgH: 96 },
  xl: { icon: "clamp(8rem, 15vw, 16rem)", text: "text-4xl", imgW: 256, imgH: 256 },
  sidebar: { icon: 192, text: "text-xl", imgW: 192, imgH: 192 },
};

export function AppLogo({ className, size = "md", showName = true }: AppLogoProps) {
  const { appName, appLogo } = useAppConfig();
  const { icon, text, imgW, imgH } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
      {appLogo ? (
        <Image
          src={appLogo}
          alt={`${appName} logo`}
          width={imgW}
          height={imgH}
          className="shrink-0 object-contain"
          style={typeof icon === "string"
            ? { width: icon, height: "auto" }
            : { width: `${icon}px`, height: "auto", maxWidth: "100%" }
          }
        />
      ) : (
        <div
          className="shrink-0 rounded bg-primary/20 flex items-center justify-center text-primary font-bold"
          style={typeof icon === "string"
            ? { width: icon, height: icon }
            : { width: `${icon}px`, height: `${icon}px` }
          }
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
