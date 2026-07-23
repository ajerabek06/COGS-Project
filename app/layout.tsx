import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import AmplifyProvider from "./amplify-provider";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "Benchboard — Woodworking Cost Studio";
  const description = "Know the profit in every project with private cost libraries, sales modeling, and material imports.";
  const socialImage = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Benchboard profit dashboard" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
