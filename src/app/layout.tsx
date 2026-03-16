import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wild Rift Ranking | OP.GG Style",
  description: "Elite Wild Rift Ranking Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
