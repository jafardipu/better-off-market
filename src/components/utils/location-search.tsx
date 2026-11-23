"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { envConfig } from "@/config";

type LocationSearchProps = {
  placeholder?: string;
};

// Kept as the SDK object (not just id + text) so `toPlace()` carries the
// autocomplete session into the final location lookup.
type Prediction = google.maps.places.PlacePrediction;

const SEARCH_DEBOUNCE_MS = 300;
const GOOGLE_MAPS_API_KEY = envConfig.mapKey!;

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

// Escapes regex special characters so a query like "3.5" or "(Dhaka)"
// doesn't break the RegExp constructor below.
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, term: string) {
  if (!term.trim()) return text;

  const pattern = new RegExp(`(${escapeRegExp(term.trim())})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <strong key={i} className="font-semibold text-base text-primary-black">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function LocationSearch({
  placeholder = "Search by city, ZIP, or address",
}: LocationSearchProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const placesLib = useRef<google.maps.PlacesLibrary | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  // Incremented per request so a slow, older response can't overwrite newer results.
  const latestRequest = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => google.maps.importLibrary("places") as Promise<google.maps.PlacesLibrary>)
      .then((lib) => {
        placesLib.current = lib;
        setScriptReady(true);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    const places = placesLib.current;
    const requestId = ++latestRequest.current;

    if (!places || !input.trim()) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    // One token spans every keystroke until a place is picked, so Google
    // bills the whole search as a single session.
    sessionToken.current ??= new places.AutocompleteSessionToken();

    setIsSearching(true);
    try {
      const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: sessionToken.current,
        // Covers city, state, county, ZIP, and full address searches
        includedPrimaryTypes: ["geocode"],
      });

      if (requestId === latestRequest.current) {
        setPredictions(
          suggestions.flatMap((s) => (s.placePrediction ? [s.placePrediction] : [])),
        );
      }
    } catch (err) {
      console.error("Place autocomplete failed:", err);
      if (requestId === latestRequest.current) setPredictions([]);
    } finally {
      if (requestId === latestRequest.current) setIsSearching(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setInputValue(value);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), SEARCH_DEBOUNCE_MS);
  }

  function handleSearchClick() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchPredictions(inputValue);
    setIsOpen(true);
  }

  // Resolves the picked prediction to lat/lng via Place Details, then
  // redirects to the map page with those coordinates as search params.
  async function handleSelectPrediction(prediction: Prediction) {
    setIsLocating(true);
    try {
      const place = prediction.toPlace();
      // The field mask controls billing: request only what the redirect needs.
      await place.fetchFields({ fields: ["location"] });

      if (!place.location) throw new Error("Selected place has no location");

      setIsOpen(false);
      router.push(`/properties-map?lat=${place.location.lat()}&lng=${place.location.lng()}`);
    } catch (err) {
      console.error("Place lookup failed:", err);
    } finally {
      // fetchFields ends the session; the next search needs a fresh token.
      sessionToken.current = null;
      setIsLocating(false);
    }
  }

  const showList = isOpen && inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-full bg-white p-3 shadow-lg">
        <div className="flex flex-1 items-center gap-2 rounded-md px-4 py-2">
          <Search className="h-5 w-5 shrink-0 text-[#8D7168]" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => inputValue.trim() && setIsOpen(true)}
            placeholder={placeholder}
            disabled={!scriptReady}
            className="w-full bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        {/* <button
          type="button"
          onClick={handleSearchClick}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary-color px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:block">Search Properties</span>
        </button> */}
      </div>

      {/* Dropdown */}
      {showList && (
        <div className="absolute left-2 top-[calc(100%+8px)] z-9999 md:max-w-150 max-w-88 min-w-72 overflow-hidden rounded-xl bg-white shadow-xl">
          {isSearching || isLocating ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              {isLocating ? "Locating..." : "Searching..."}
            </div>
          ) : predictions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No locations found.
            </div>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {predictions.map((prediction) => (
                <li key={prediction.placeId}>
                  <button
                    type="button"
                    onClick={() => handleSelectPrediction(prediction)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-primary-gray hover:bg-gray-50 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#A9ACB3]" />
                    <span className="truncate">
                      {highlightMatch(prediction.text.text, inputValue)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}





// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Search, MapPin } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useGetPropertiesForWebQuery } from "@/redux/api/propertiesApi";
// import { IPropertyResponse } from "@/types";
// import Link from "next/link";

// type LocationSearchProps = {
//   placeholder?: string;
// };

// const SEARCH_DEBOUNCE_MS = 300;

// // Escapes regex special characters in the search term so a query like
// // "3.5" or "(Dhaka)" doesn't break the RegExp constructor below.
// function escapeRegExp(value: string) {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Splits `text` around every case-insensitive occurrence of `term` and
// // bolds the matching parts. Returns plain text unchanged if term is empty.
// function highlightMatch(text: string, term: string) {
//   if (!term.trim()) return text;

//   const pattern = new RegExp(`(${escapeRegExp(term.trim())})`, "gi");
//   const parts = text.split(pattern);

//   return parts.map((part, i) =>
//     pattern.test(part) ? (
//       <strong key={i} className="font-semibold text-base text-primary-black">
//         {part}
//       </strong>
//     ) : (
//       <span key={i}>{part}</span>
//     ),
//   );
// }

// export default function LocationSearch({
//   placeholder = "Search by city, ZIP, or address",
// }: LocationSearchProps) {
//   const router = useRouter();
//   const [inputValue, setInputValue] = useState("");
//   const [debouncedTerm, setDebouncedTerm] = useState("");
//   const [isOpen, setIsOpen] = useState(false);

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const { data, isLoading } = useGetPropertiesForWebQuery(
//     { searchTerm: debouncedTerm },
//     { skip: !debouncedTerm.trim() },
//   );

//   const properties: IPropertyResponse[] = data?.data ?? [];

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(e.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   function handleInputChange(value: string) {
//     setInputValue(value);
//     setIsOpen(true);

//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       setDebouncedTerm(value);
//     }, SEARCH_DEBOUNCE_MS);
//   }

//   function handleSearchClick() {
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     setDebouncedTerm(inputValue);
//     setIsOpen(true);
//   }

//   // function handleSelectProperty(propertyId: string) {
//   //   setIsOpen(false);
//   //   router.push(`/properties-list/${propertyId}`);
//   // }

//   const showList = isOpen && debouncedTerm.trim().length > 0;

//   return (
//     <div ref={containerRef} className="relative w-full">
//       {/* Search bar */}
//       <div className="flex items-center gap-2 rounded-full bg-white p-3 shadow-lg">
//         <div className="flex flex-1 items-center gap-2 rounded-md px-4 py-2">
//           <Search className="h-5 w-5 shrink-0 text-[#8D7168]" />
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => handleInputChange(e.target.value)}
//             onFocus={() => inputValue.trim() && setIsOpen(true)}
//             placeholder={placeholder}
//             className="w-full bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={handleSearchClick}
//           className="flex shrink-0 items-center gap-2 rounded-full bg-primary-color  px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
//         >
//           <Search className="h-4 w-4" />
//           <span className="hidden md:block">Search Properties</span>
//         </button>
//       </div>

//       {/* Dropdown */}
//       {showList && (
//         <div className="absolute left-2 top-[calc(100%+8px)] z-9999 md:max-w-150 max-w-88 min-w-72 overflow-hidden rounded-xl bg-white shadow-xl">
//           {isLoading ? (
//             <div className="px-4 py-6 text-center text-sm text-gray-500 ">
//               Searching...
//             </div>
//           ) : properties.length === 0 ? (
//             <div className="px-4 py-6 text-center text-sm text-gray-500">
//               No properties found.
//             </div>
//           ) : (
//             <ul className="max-h-52 overflow-y-auto py-1">
//               {properties.map((property) => {
//                 const addressText = `${property?.streetAddress}, ${property?.city}, ${property?.state}, ${property?.zipCode}, ${property?.county}`;

//                 return (
//                   <li key={property._id}>
//                     <Link href={`/properties-list/${property._id}`}>
//                       <button
//                         type="button"
//                         // onClick={() => setIsOpen(false)}
//                         className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-primary-gray hover:bg-gray-50 cursor-pointer"
//                       >
//                         <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#A9ACB3]" />
//                         <span className="truncate">
//                           {highlightMatch(addressText, debouncedTerm)}
//                         </span>
//                       </button>
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }