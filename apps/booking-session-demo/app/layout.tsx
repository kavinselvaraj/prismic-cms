import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Booking Session Lab",
  description: "Frontend-only multi-tab booking session demonstration",
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
