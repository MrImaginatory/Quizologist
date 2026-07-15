"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  {
    label: "No repeated sequences",
    test: (p) => !/(.)\1{2,}/.test(p) && !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(p),
  },
];

function getPasswordStrength(password: string): number {
  return requirements.filter((req) => req.test(password)).length;
}

function getStrengthColor(strength: number): string {
  if (strength <= 2) return "bg-destructive";
  if (strength <= 4) return "bg-warning";
  return "bg-success";
}

function getStrengthLabel(strength: number): string {
  if (strength <= 2) return "Weak";
  if (strength <= 4) return "Medium";
  return "Strong";
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);
  const color = getStrengthColor(strength);
  const label = getStrengthLabel(strength);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span
          className={cn(
            "font-medium",
            strength <= 2 && "text-destructive",
            strength > 2 && strength <= 4 && "text-warning",
            strength > 4 && "text-success"
          )}
        >
          {label}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", color)}
          style={{ width: `${(strength / requirements.length) * 100}%` }}
        />
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={cn(
              "flex items-center text-xs gap-1.5",
              req.test(password) ? "text-success" : "text-muted-foreground"
            )}
          >
            {req.test(password) ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <X className="h-3 w-3 shrink-0" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
