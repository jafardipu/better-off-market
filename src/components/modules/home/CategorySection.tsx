import CategoryCard from "@/components/shared/card/category-card";
import Container from "@/components/shared/container/Container";
import SectionTitle from "@/components/shared/titles/SectionTitle";
import { categories } from "@/data/categories";

export default function CategorySection() {
  const sectionTitleData = {
    title: "Browse by category",
    description: "Find the property that fits your needs",
    className: "text-center",
  };

  return (
    <div className="bg-[#F2F4F6] xl:py-16 py-10">
      <Container className="space-y-8">
        <SectionTitle data={sectionTitleData} />
        <div className="grid grid-cols-2  lg:grid-cols-4 gap-2 md:gap-4.5 ">
          {categories.map((category) => (
            <CategoryCard key={category?.id} category={category} />
          ))}
        </div>
      </Container>
    </div>
  );
}
