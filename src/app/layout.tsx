import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";
import Providers from "@/lib/provider/Provider";
import "react-pagination-bar/dist/index.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { envConfig } from "@/config";

const plusJakartaSans = Plus_Jakarta_Sans({
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const SHARE_TITLE = "The Place for Off-Market Real Estate";
const SHARE_DESCRIPTION =
  "Find off-market properties and make offers directly on Better Off Market.";

export const metadata: Metadata = {
  // Makes the share image URL absolute; previews need a full URL.
  metadataBase: new URL(envConfig.siteUrl),
  title: {
    default: "Better Off Market",
    template: "%s | Better Off Market",
  },
  description: "This the official website of Better Off Market",
  // Link previews (iMessage, WhatsApp, Facebook, Slack…). The image comes
  // from app/opengraph-image.jpg and app/twitter-image.jpg (1200×630).
  // Pages that set their own openGraph (property details) replace this.
  openGraph: {
    type: "website",
    siteName: "Better Off Market",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* <nav>
          <Navbar />
        </nav> */}
        <main className="min-h-[calc(100vh-150px)]">
          <Providers>
            {/* <CustomCursor /> */}
            {children}

            <NextTopLoader
              color="#00214C"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #232323,0 0 5px #EA5326"
              zIndex={1600}
              showAtBottom={false}
            />
            <Toaster richColors position="top-center" />
          </Providers>
        </main>
      </body>
    </html>
  );
}
