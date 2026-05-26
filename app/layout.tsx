import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protocol EcoCord",
  description: "Buletin ecocardiografie transtoracică",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
