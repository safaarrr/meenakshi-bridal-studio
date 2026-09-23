import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://meenakshi-bridal-studio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

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
    url: siteUrl,
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "Meenakshi Bridal Studio & Family Salon",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Meenakshi Bridal Studio & Family Salon",
    description:
      "Bridal makeup, hair styling, skincare and professional beauty services in Kottiyam, Kerala.",
    images: ["/logo.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: siteUrl,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Meenakshi Bridal Studio & Family Salon",
  url: siteUrl,
  logo: `${siteUrl}/logo.jpg`,
  description:
    "Meenakshi Bridal Studio & Family Salon offers bridal makeup, hair styling, skincare and professional beauty services in Kottiyam, Kerala.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
