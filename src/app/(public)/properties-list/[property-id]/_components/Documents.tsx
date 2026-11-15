"use client";
import { PDFIcon } from "@/icons";
import { IDocument } from "@/types";
import { Download, FileText } from "lucide-react";

export function Documents({
  documents,
}: {
  documents: IDocument[] | undefined;
}) {
  const displayDocuments = documents;

  const handleDownload = (doc: IDocument) => {
    const link = document.createElement("a");
    link.href = doc?.url || "";
    link.download = doc?.name;
    document.body.appendChild(link);
    link.target = "_blank";
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-[#F2F4F6] rounded-lg border border-[#EFEAE8]">
      <h1 className="text-2xl font-semibold mb-4 text-primary-black flex items-center gap-1.5">
        <FileText color="#00214C" /> Documents
      </h1>
      <div className="space-y-3">
        {displayDocuments?.map((doc) => (
          <div
            key={doc?._id}
            className="flex items-center gap-4 bg-white border-2 border-primary-border-color px-3 py-2 rounded-lg hover:bg-gray-150 transition-colors"
          >
            <PDFIcon className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-primary-black truncate w-50 md:w-full">
                {doc.name}
              </h3>
              {/* <p className="text-xs text-gray-500 mt-1">
                {doc.size} • Updated{" "}
                {moment(doc.updated).format("MM-DD-YYYY")}
              </p> */}
            </div>
            <button
              onClick={() => handleDownload(doc)}
              className="shrink-0 p-2 text-gray-600 hover:text-primary-black transition-colors cursor-pointer hover:bg-gray-200 duration-100  rounded-full"
              aria-label={`Download ${doc.name}`}
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
