import type { Metadata } from "next";
import "./styles.css";
import { StoreProvider } from "@/store/provider";

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "IBE Web",
  description: "Prismic-powered IBE website",
  metadataBase: new URL(metadataBaseUrl),
  applicationName: "IBE Web",
  category: "travel",
  other: {
    "theme-color": "#197e5c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
