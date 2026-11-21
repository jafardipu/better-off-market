import { CircleAlert } from "lucide-react";
import RsvpTabs from "./_components/RsvpTabs";


export const metadata = {
  title: "Open House RSVPs",
  description: "RSVPs you received and open houses you plan to attend.",
};

export default function RsvpsPage() {
  return (
    <div>
      <div className="flex-between flex-wrap gap-1">
        <h4 className="lg:text-[32px] md:text-3xl text-2xl font-semibold">
          Open House RSVPs
        </h4>
        <div className="flex gap-1 items-center text-sm text-primary-gray">
          <CircleAlert size={20} />
          <p>Requests for your listings, and requests you sent to other sellers.</p>
        </div>
      </div>
      <div className="py-4">
        <RsvpTabs />
      </div>
    </div>
  );
}
