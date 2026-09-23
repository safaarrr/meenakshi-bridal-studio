import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meenakshi Bridal Studio & Family Salon | Kottiyam, Kerala",

  description:
    "Meenakshi Bridal Studio & Family Salon offers bridal makeup, hair styling, skincare and professional beauty services in Kottiyam, Kerala. Book your appointment today.",

  keywords: [
    "Meenakshi Bridal Studio",
    "Meenakshi Bridal Studio Kottiyam",
    "bridal studio Kottiyam",
    "bridal makeup Kottiyam",
    "beauty salon Kottiyam",
    "family salon Kottiyam",
    "bridal makeup Kerala",
    "hair styling Kottiyam",
    "skin care Kottiyam",
  ],

  authors: [
    {
      name: "Meenakshi Bridal Studio & Family Salon",
    },
  ],

  creator: "Meenakshi Bridal Studio & Family Salon",

  openGraph: {
    title: "Meenakshi Bridal Studio & Family Salon",
    description:
      "Bridal makeup, hair styling, skincare and professional beauty services in Kottiyam, Kerala.",
    type: "website",
    locale: "en_IN",
    siteName: "Meenakshi Bridal Studio & Family Salon",
  },

  twitter: {
    card: "summary_large_image",
    title: "Meenakshi Bridal Studio & Family Salon",
    description:
      "Bridal makeup, hair styling, skincare and professional beauty services in Kottiyam, Kerala.",
  },

  robots: {
    index: true,
    follow: true,
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
