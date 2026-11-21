import Container from "@/components/shared/container/Container";
import HeroBanner from "@/components/shared/hero_banner/HeroBanner";
import FilterOptions from "@/components/shared/utils/FilterOptions";
import ListedProperties from "./_components/ListedProperties";
export type SearchParams = Promise<{
  [key: string]: string | string[] | number | undefined;
}>;

export const metadata = {
  title: "Properties",
  description: "Find your all offed properties on Better Off Market.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const bannerData = {
    title: "Browse properties",
    description:
      "Browse current listings and explore off-market opportunities.",
    className: "min-h-[50vh]",
  };

  const resolvedParams = await searchParams;

  return (
    <div className="space-y-16" id="properties-list">
      <HeroBanner data={bannerData} />
      <Container className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4  gap-4 ">
        <div>
          <FilterOptions />
        </div>
        <div className="lg:col-span-2 xl:col-span-3">
          <ListedProperties searchParams={resolvedParams} />
        </div>
      </Container>
    </div>
  );
}
