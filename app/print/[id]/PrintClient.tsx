"use client";

import { useEffect, useRef, useState } from "react";

export default function PrintClient({ id }: { id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/download/${id}`);
        if (!res.ok) {
          throw new Error("Nu am putut descărca documentul.");
        }
        const blob = await res.blob();
        // Dynamic import keeps docx-preview out of the server bundle.
        const docx = await import("docx-preview");
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        await docx.renderAsync(blob, containerRef.current, undefined, {
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: true,
          useBase64URL: true,
        });
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Eroare la încărcare");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <div className="print-toolbar">
        <button
          onClick={() => window.print()}
          className="print-btn"
          disabled={loading || !!error}
        >
          {loading ? "Se încarcă..." : "Salvează ca PDF"}
        </button>
        <a href="/history" className="print-link">
          ← Înapoi la istoric
        </a>
        {!loading && !error && (
          <span className="print-hint">
            Apasă butonul, apoi alege „Save as PDF" în destinație.
          </span>
        )}
        {error && <span className="print-error">{error}</span>}
      </div>

      <div className="docx-frame">
        <div ref={containerRef} className="docx-container" />
      </div>
    </>
  );
}
