import type { Metadata } from "next";
import "./styles.css";
import { StoreProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "IBE Web",
  description: "Prismic-powered IBE website",
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
