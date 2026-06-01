export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/search",
          "/search/",
          "/live",
          "/live/",
        ],
      },
    ],
    sitemap: [
      "https://nabdriyadah.com/sitemap.xml",
    ],
  };
}
