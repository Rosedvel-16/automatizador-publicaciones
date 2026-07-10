import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lernymart Ads Engine",
  description:
    "Generador de campañas publicitarias para Meta Ads — copy e imágenes con IA",
};

const themeInitScript = `
  try {
    if (localStorage.getItem('lernymart-theme') === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
