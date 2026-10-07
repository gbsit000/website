import CategorieCard from "@/components/categorieCard";
import Banner from "@/components/Banner";

export default async function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto p-4">
        <Banner />
      </div>

      {/* Category Grid Section */}
      <CategorieCard />
    </main>
  );
}
