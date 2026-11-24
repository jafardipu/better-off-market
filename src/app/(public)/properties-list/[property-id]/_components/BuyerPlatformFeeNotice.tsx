import Link from "next/link";

// Shown on every listing, signed in or not. Styled like AuthenticationRequired.
export default function BuyerPlatformFeeNotice() {
  return (
    <div className="border-l-4 border-primary-color bg-[#F2F4F6] rounded-md p-4 space-y-1 w-full">
      <p className="text-sm font-semibold text-primary-black">
        Buyer Platform Fee
      </p>
      <p className="text-sm font-medium text-primary-gray">
        A 2% Buyer Platform Fee, calculated on the total purchase price,
        applies to qualifying purchases resulting from an introduction through
        BetterOffMarket. See our{" "}
        <Link
          href="/terms-conditions"
          className="text-[#1F4E8B] hover:underline font-semibold"
        >
          Terms &amp; Conditions
        </Link>{" "}
        for details.
      </p>
    </div>
  );
}
