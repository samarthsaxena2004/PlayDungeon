"use client";
import { useEffect, useState } from "react";

export default function Typewriter({ text }: { text: string }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay("");
    let i = 0;

    const id = setInterval(() => {
      setDisplay(t => t + text[i]);
      i++;
      if (i >= text.length) clearInterval(id);
    }, 18);

    return () => clearInterval(id);
  }, [text]);

  return (
    <pre className="whitespace-pre-wrap leading-relaxed">
      {display}
      <span className="animate-pulse">▮</span>
    </pre>
  );
}
