import Container from "@/components/shared/container/Container";

export default function LaunchAnnouncement() {
  return (
    <section className="w-full">
      <Container>
        <div className="mx-auto max-w-5xl text-center px-4 py-4 md:py-6">
          <h2 className="text-3xl font-bold text-primary-black sm:text-4xl md:text-5xl lg:text-[52px] leading-tight">
            We&apos;re Launching Black Friday!
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-lg text-primary-gray sm:text-xl md:text-[26px] font-normal leading-relaxed">
            BetterOffMarket officially launches November 27, 2026.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-primary-gray sm:text-base md:text-lg font-normal leading-relaxed">
            We&apos;re putting the finishing touches on the platform. Stay
            tuned!
          </p>
        </div>
      </Container>
    </section>
  );
}
