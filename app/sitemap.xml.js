// pages/sitemap.xml.js
import { prisma } from "../lib/prisma";

const BASE_URL = "http://localhost:3000";
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
function generateSiteMap(products) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}</loc></url>
  ${products
    .map(
      (product) => `
  <url>
    <loc>${BASE_URL}/products/${product.id}/${slugify(product.name)}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
  </url>`,
    )
    .join("")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const products = await prisma.products.findMany({
    where: { published: true },
    select: { name: true, updatedAt: true },
  });

  res.setHeader("Content-Type", "text/xml");
  res.write(generateSiteMap(products));
  res.end();

  return { props: {} };
}

export default function SiteMap() {}
