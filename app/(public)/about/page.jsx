import { prisma } from "@/lib/prisma";
import AboutDetail from "@/components/AboutDetail";
export default async function Page() {
  const data = await prisma.abouts.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto text-base/8">
      {/* <Markdown>{data?.[0].description}</Markdown> */}
      {data.length > 0 ? (
        <AboutDetail aboutData={data?.[0]} />
      ) : (
        <p>No about data available.</p>
      )}
    </div>
  );
}
