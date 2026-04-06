import { Metadata } from "next";
import Script from "next/script";
import "../src/index.css";
import "../src/App.css";

export const metadata = {
  title:
    "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
  description:
    "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
  applicationName: "Moments",
  openGraph: {
    title:
      "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
    description:
      "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title:
      "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
    description:
      "Moments: Upload a photo, AI picks a word from the photo, you guess the word just like wordle.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-X375QP0VCF"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-X375QP0VCF');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
