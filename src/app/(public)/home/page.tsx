import CategorySection from "@/components/modules/home/CategorySection";
import FAQSection from "@/components/modules/home/faqs/FaqsSection";
import { GetInTouch } from "@/components/modules/home/get_in_touch/GetInTouch";
import LaunchAnnouncement from "@/components/modules/home/LaunchAnnouncement";
import LaunchMarquee from "@/components/modules/home/LaunchMarquee";
import NewlyAddedSection from "@/components/modules/home/NewlyAddedSection";
import PriceDropsSection from "@/components/modules/home/PriceDropsSection";
import ContactUs from "@/components/shared/contact/ContactUs";
import HeroBanner from "@/components/shared/hero_banner/HeroBanner";
import LocationSearch from "@/components/utils/location-search";

export const metadata = {
  title: "Home",
  description: "This the official website of Better Off Market",
};

export default function Home() {
  const bannerData = {
    title: "The Place for Off-Market Real Estate",
    description:
      "Where property owners, wholesalers, investors, and buyers connect to discover opportunities, negotiate, and sell directly.",
    children: <LocationSearch />,
    titleClassName: "2xl:text-6xl lg:text-5xl md:text-4xl text-3xl font-semibold max-w-2xl",
    regionBadge: "CINCINNATI + NORTHERN KY",
    // className: "min-h-[90vh]",
  };
  return (
    <div>
      <LaunchMarquee />
      <div className="space-y-16">
        <HeroBanner data={bannerData} />
        <LaunchAnnouncement />
        <NewlyAddedSection />
        <PriceDropsSection />
        <CategorySection />
        <GetInTouch />
        <FAQSection />
        <ContactUs />
      </div>
    </div>
  );
}
