import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/admin/",
      ],
    },
    sitemap: "https://meenakshi-bridal-studio.vercel.app/sitemap.xml",
  };
}
