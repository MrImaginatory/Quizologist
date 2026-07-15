import type { Metadata } from "next";
import { NotFound } from "@/components/not-found";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFoundPage() {
  return <NotFound />;
}
