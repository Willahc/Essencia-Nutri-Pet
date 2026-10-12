import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Essência Nutri Pet | Acompanhamento Nutricional com IA",
  description: "Plataforma de acompanhamento nutricional longitudinal de cães e gatos com inteligência artificial supervisionada.",
  applicationName: "NutriPet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriPet",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen min-h-dvh flex flex-col overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}

