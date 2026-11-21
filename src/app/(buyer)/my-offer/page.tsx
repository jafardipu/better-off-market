import Container from "@/components/shared/container/Container";
import HeroBanner from "@/components/shared/hero_banner/HeroBanner";
import { CircleAlert } from "lucide-react";
import OfferListContainer from "./_components/OfferListContainer";

export const metadata = {
  title: "My Offer",
  description: "Find your all offed properties",
};

export default function MyOfferPage() {
  const bannerData = {
    title: "My Offers",
    description:
      "Submit offers and negotiate with sellers directly - all on one secure platform.",
    className: "min-h-[50vh]",
  };
  return (
    <div className="space-y-16">
      <HeroBanner data={bannerData} />
      <Container>
        {/* ===========================  page title =============================*/}
        <div className="flex-between flex-wrap gap-1">
          <h4 className="lg:text-[32px] md:text-3xl text-2xl font-semibold">
            My Offers
          </h4>
          <div className="flex gap-1 items-center text-sm text-primary-gray">
            <CircleAlert size={20} />
            <p>Track your active proposals and history.</p>
          </div>
        </div>
        <OfferListContainer />
      </Container>
    </div>
  );
}
