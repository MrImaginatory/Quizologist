"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/vitals";

export function VitalsProvider() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
