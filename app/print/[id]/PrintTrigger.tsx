"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Small delay so the document is fully laid out and fonts loaded.
    const t = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(t);
  }, []);
  return null;
}
