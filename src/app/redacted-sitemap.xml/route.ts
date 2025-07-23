import { NextResponse } from "next/server";

// Example: Replace with your dynamic URL generation logic
const staticPages = ["", "about", "features", "contact"];

export async function GET() {
  const baseUrl = "https://zenalyze.vercel.app";
  const urls = staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.7"}</priority>
  </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
