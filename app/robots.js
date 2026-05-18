export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/cdn-cgi/"]
      }
    ],
    sitemap: [
      "https://nabdriyadah.com/sitemap.xml",
      "https://nabdriyadah.com/sitemap-news.xml",
    ]
  };
}
