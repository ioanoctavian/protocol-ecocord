"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.print();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="print-toolbar">
      <button onClick={() => window.print()} className="print-btn">
        Salvează ca PDF
      </button>
      <a href="/history" className="print-link">
        ← Înapoi la istoric
      </a>
    </div>
  );
}
