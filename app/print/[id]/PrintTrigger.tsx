"use client";

export default function PrintTrigger() {
  return (
    <div className="print-toolbar">
      <button onClick={() => window.print()} className="print-btn">
        Salvează ca PDF
      </button>
      <a href="/history" className="print-link">
        ← Înapoi la istoric
      </a>
      <span className="print-hint">
        Apasă butonul, apoi alege „Save as PDF" în destinație.
      </span>
    </div>
  );
}
