// app/sitemap.js

import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://triplerichproduction.co.id";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function sitemap() {
  // Halaman statis
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Halaman dinamis dari database
  const products = await prisma.products.findMany({
    where: { published: true },
    select: { id: true, name: true, UpdatedAt: true },
  });
  const productPages = products.map((product) => ({
    url: `${BASE_URL}/products/${product.id}/${slugify(product.name)}`,
    lastModified: product.UpdatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticPages, ...productPages];
}
