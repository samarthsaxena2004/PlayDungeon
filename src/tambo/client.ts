"use client";

import { useTambo } from "@tambo-ai/react";

export function useGameTambo() {
  const tambo = useTambo();

  return tambo;
}
