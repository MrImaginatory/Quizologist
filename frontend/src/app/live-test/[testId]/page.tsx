import React from "react";
import LiveTestClient from "./LiveTestClient";

interface PageProps {
  params: Promise<{
    testId: string;
  }>;
}

export default async function LiveTestPage({ params }: PageProps) {
  const { testId } = await params;
  return <LiveTestClient testId={testId} />;
}
