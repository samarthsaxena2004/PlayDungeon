"use client";

import { TamboProvider } from "@tambo-ai/react";
import { tamboComponents } from "@/tambo/registry";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TamboProvider components={tamboComponents as any} apiKey={process.env.NEXT_PUBLIC_TAMBO_KEY || "dummy"}>
      {children}
    </TamboProvider>
  );
}
