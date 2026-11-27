import { Download, MessageSquareText } from "lucide-react";
import { OfferSubSection } from "./OfferSubSection";
import { OfferTermsSections } from "./OfferTermsSections";
import { type ConsolidatedOfferData } from "./utils.offer-received";
import { DocIcon } from "@/icons";
import Link from "next/link";

interface ConsolidatedOfferCardProps {
  buyerId: string;
  name: string;
  data: ConsolidatedOfferData;
  /** The round before `data`, to strike through what changed. */
  previous?: ConsolidatedOfferData;
}

export function ConsolidatedOfferCard({
  buyerId,
  name: buyerName,
  data,
  previous,
}: ConsolidatedOfferCardProps) {
  return (
    <div className="border border-primary-border-color bg-card p-5 shadow-[0_10px_30px_0_rgba(15,23,42,0.05)] sm:p-6 rounded-lg">
      <h4 className="md:text-2xl text-lg font-semibold">
        {" "}
        <Link
          href={`/seller-profile?seller=${buyerId}`}
          className="hover:text-blue-800 hover:underline duration-200 ease-in-out "
        >
          Offer from {buyerName}{" "}
        </Link>
      </h4>
      <section className=" space-y-4 rounded-xl lg:mt-5 mt-3">
        <OfferTermsSections
          data={data}
          previous={previous}
          personalPropertyClassName="justify-between items-center"
        />

        {data.documents && data.documents.length > 0 ? (
          <OfferSubSection title="Documents" icon={<DocIcon />}>
            <ul className="flex flex-col gap-2">
              {data.documents.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border border-primary-border-color/60 bg-muted/50 px-3 py-2.5 text-sm text-foreground hover:border-primary/50"
                  >
                    <span className="truncate">{doc.name}</span>
                    <Download className="shrink-0 text-muted-foreground hover:bg-gray-200 size-5 p-0.5 rounded-full" />
                  </a>
                </li>
              ))}
            </ul>
          </OfferSubSection>
        ) : null}

        {data.notesToSeller ? (
          <OfferSubSection
            title="Notes to Seller"
            icon={<MessageSquareText color="#00214C" size={18} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] text-[#594139] p-3  italic leading-relaxed">
              &ldquo;{data.notesToSeller}&rdquo;
            </p>
          </OfferSubSection>
        ) : null}

        {data.notesToBuyer ? (
          <OfferSubSection
            title="Notes to Buyer"
            icon={<MessageSquareText color="#00214C" size={18} />}
          >
            <p className="rounded-lg bg-[#F2F4F6] text-[#594139] p-3  italic leading-relaxed">
              &ldquo;{data.notesToBuyer}&rdquo;
            </p>
          </OfferSubSection>
        ) : null}
      </section>
    </div>
  );
}
