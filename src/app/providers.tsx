"use client";

import { tambo } from "@/tambo/registry";
import { TamboProvider } from "@tambo-ai/react";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TamboProvider instance={tambo}>
      {children}
    </TamboProvider>
  );
}
