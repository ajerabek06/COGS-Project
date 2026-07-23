import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Benchboard — Woodworking Cost Studio",
  description: "Cost products, compare selling fees, and price woodworking projects profitably.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
