import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Essência Nutri Pet | Acompanhamento Nutricional com IA",
  description: "Plataforma de acompanhamento nutricional longitudinal de cães e gatos com inteligência artificial supervisionada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
