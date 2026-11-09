import Container from "@/components/shared/container/Container";
import SubscriptionForm from "./SubscriptionForm";

export function GetInTouch() {
  return (
    <Container className="w-full">
      <div className="bg-primary-color rounded-3xl p-4  md:p-12 lg:p-16 text-white">
        <div className="grid md:grid-cols-2 gap-5 items-center">
          {/* Left Content */}
          <div className="max-w-122.75">
            <h2 className="xl:text-[32px] text-2xl font-bold mb-4 leading-tight">
              Be First to Know
            </h2>
            <p className="text-lg leading-relaxed">
              Get instant email notifications when properties matching your
              search criteria are added.
            </p>
          </div>

          {/* Right Form */}
          <SubscriptionForm />
        </div>
      </div>
    </Container>
  );
}
