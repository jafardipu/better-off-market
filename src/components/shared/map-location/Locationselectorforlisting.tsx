"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, Locate, MapPin, Search } from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { cn } from "@/lib/utils";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const SEARCH_DEBOUNCE_MS = 300;

type PlacePrediction = google.maps.places.PlacePrediction;

// ---- data type (matches your ILocation) ----
export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // GeoJSON order: [lng, lat]
}

interface LocationSelectorForListingProps {
  /** undefined until the user has picked a location (required at submit time) */
  value?: ILocation;
  onChange: (location: ILocation) => void;
  /** Address already entered above the map, shown in the search box. */
  addressQuery?: string;
  /** Street, city, and state are filled, so the address can be placed on the map. */
  addressReady?: boolean;
  error?: string;
  label?: string;
  zoom?: number;
  /**
   * { lat, lng } fallback center used only if the browser's current
   * location can't be read (denied, unsupported, etc). Falls back to
   * this before falling back further to a hardcoded default.
   */
  defaultCenter?: { lat: number; lng: number };
}

// Custom pin icon matching the blue circular marker style
function getPinIcon(): google.maps.Symbol {
  return {
    path: "M12 0C7.6 0 4 3.6 4 8c0 5.4 6.7 13.2 7.1 13.6.2.3.6.4.9.4s.7-.1.9-.4C13.3 21.2 20 13.4 20 8c0-4.4-3.6-8-8-8zm0 11.5c-1.9 0-3.5-1.6-3.5-3.5S10.1 4.5 12 4.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z",
    fillColor: "#1e5a8e",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1.5,
    scale: 1.6,
    anchor: new google.maps.Point(12, 22),
  };
}

// Last-resort fallback if geolocation is denied/unsupported and no
// defaultCenter prop was passed — adjust to your market.
const FALLBACK_CENTER = { lat: 23.8103, lng: 90.4125 };

function hasPlacedPin(value?: ILocation) {
  const [lng, lat] = value?.coordinates ?? [];
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
}

export function LocationSelectorForListing({
  value,
  onChange,
  addressQuery = "",
  addressReady = false,
  error,
  zoom = 15,
  defaultCenter,
}: LocationSelectorForListingProps) {
  // Requires "places" in your useGoogleMaps hook's LIBRARIES array.
  const { isLoaded } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [locating, setLocating] = useState(false);
  // Suggestions are kept with the text they were fetched for, so they hide
  // as soon as the box holds different text.
  const [results, setResults] = useState<{
    text: string;
    items: PlacePrediction[];
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<number | null>(null);
  // Bumped on every keystroke so an older, slower response is ignored.
  const latestSearch = useRef(0);
  // One token spans the keystrokes up to a pick, so Google bills one session.
  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const onChangeRef = useRef(onChange);
  const geocodeRequest = useRef(0);
  const lastGeocoded = useRef("");
  const savedAddress = useRef("");
  const keepSavedPin = useRef(false);
  const capturedSavedPin = useRef(false);
  const previousQuery = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Keep the search box in sync with the address entered above the map.
  // A listing that already has a pin keeps that pin until the address changes.
  useEffect(() => {
    const query = addressQuery.trim();
    if (previousQuery.current !== query) {
      previousQuery.current = query;
      setSearchValue(query);
    }

    if (
      query &&
      !capturedSavedPin.current &&
      !lastGeocoded.current &&
      hasPlacedPin(value)
    ) {
      capturedSavedPin.current = true;
      keepSavedPin.current = true;
      savedAddress.current = query;
    }

    const isOriginalSavedAddress =
      keepSavedPin.current && query === savedAddress.current;
    if (!query || isOriginalSavedAddress || !isLoaded || !addressReady) return;
    if (query === lastGeocoded.current) return;

    const requestId = ++geocodeRequest.current;
    const timer = window.setTimeout(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query, region: "us" }, (results, status) => {
        if (requestId !== geocodeRequest.current) return;
        const loc = results?.[0]?.geometry?.location;
        if (status !== "OK" || !loc) return;

        const lat = loc.lat();
        const lng = loc.lng();
        lastGeocoded.current = query;
        onChangeRef.current({ type: "Point", coordinates: [lng, lat] });
        map?.panTo({ lat, lng });
        map?.setZoom(16);
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [addressQuery, addressReady, isLoaded, map, value]);

  // Browser's current position, used as the map center before the user
  // has picked anything. null while we're still asking / haven't asked yet.
  const [browserLocation, setBrowserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Ask for the browser's current location once, on mount, only if the
  // field doesn't already have a value (e.g. editing an existing listing).
  useEffect(() => {
    if (value) return; // already has a location, no need to geolocate
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // Permission denied / unavailable — silently fall back below.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
    // Intentionally only runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = value
    ? { lat: value.coordinates[1], lng: value.coordinates[0] }
    : null;

  const center =
    position ?? browserLocation ?? defaultCenter ?? FALLBACK_CENTER;

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const applyLocation = useCallback(
    (lat: number, lng: number, address?: string) => {
      onChange({ type: "Point", coordinates: [lng, lat] });
      if (address !== undefined) setSearchValue(address);
    },
    [onChange],
  );

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setSearchValue(results[0].formatted_address);
      }
    });
  }, []);

  // Close the suggestion list on a click outside the search box.
  useEffect(() => {
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!searchBoxRef.current?.contains(e.target as Node)) {
        setListOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  // Places API (New). The legacy Autocomplete widget can't be used: Google no
  // longer enables the legacy Places API, and the widget fails with "This page
  // can't load Google Maps correctly".
  const fetchPredictions = useCallback(
    async (text: string, requestId: number) => {
      const places = google.maps.places;
      sessionToken.current ??= new places.AutocompleteSessionToken();
      try {
        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: text,
            sessionToken: sessionToken.current,
            locationBias: map?.getBounds() ?? undefined,
          });
        if (requestId !== latestSearch.current) return;
        setResults({
          text,
          items: suggestions.flatMap((s) =>
            s.placePrediction ? [s.placePrediction] : [],
          ),
        });
        setActiveIndex(-1);
      } catch (err) {
        console.error("Place autocomplete failed:", err);
        if (requestId === latestSearch.current) setResults({ text, items: [] });
      } finally {
        if (requestId === latestSearch.current) setSearching(false);
      }
    },
    [map],
  );

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    setListOpen(true);
    const requestId = ++latestSearch.current;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = window.setTimeout(
      () => fetchPredictions(text, requestId),
      SEARCH_DEBOUNCE_MS,
    );
  };

  const selectPrediction = useCallback(
    async (prediction: PlacePrediction) => {
      latestSearch.current++;
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
      setSearching(false);
      setListOpen(false);
      setSearchValue(prediction.text.text);
      try {
        const place = prediction.toPlace();
        // The field mask sets the price: ask only for what the pin needs.
        await place.fetchFields({ fields: ["location", "formattedAddress"] });
        const loc = place.location;
        if (!loc) return;

        const lat = loc.lat();
        const lng = loc.lng();
        applyLocation(lat, lng, place.formattedAddress ?? prediction.text.text);
        map?.panTo({ lat, lng });
        map?.setZoom(16);
      } catch (err) {
        console.error("Place lookup failed:", err);
      } finally {
        // fetchFields ends the session; the next search needs a new token.
        sessionToken.current = null;
      }
    },
    [map, applyLocation],
  );

  const visibleItems =
    results && results.text === searchValue ? results.items : null;
  const showList =
    listOpen &&
    searchValue.trim() !== "" &&
    (searching || visibleItems !== null);

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // This box sits inside the listing form: Enter must not submit it.
      e.preventDefault();
      const pick = visibleItems?.[activeIndex] ?? visibleItems?.[0];
      if (showList && !searching && pick) selectPrediction(pick);
      return;
    }
    if (e.key === "Escape") {
      setListOpen(false);
      return;
    }
    if (!showList || !visibleItems?.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % visibleItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? visibleItems.length - 1 : i - 1));
    }
  };

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      applyLocation(lat, lng);
      reverseGeocode(lat, lng);
    },
    [applyLocation, reverseGeocode],
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      applyLocation(lat, lng);
      reverseGeocode(lat, lng);
    },
    [applyLocation, reverseGeocode],
  );

  // Recenter the map (and set the marker) to the browser's current
  // position — a manual re-trigger for whenever the auto-run on mount
  // was denied, or the user just wants to jump back to "near me".
  const goToMyLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        applyLocation(lat, lng);
        reverseGeocode(lat, lng);
        map?.panTo({ lat, lng });
        map?.setZoom(16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, [map, applyLocation, reverseGeocode]);

  return (
    <div className="w-full">
      {/* <label className="text-sm font-medium mb-2 block">{label}</label> */}

      {isLoaded ? (
        <>
          <div ref={searchBoxRef} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                showList && activeIndex >= 0
                  ? `${listId}-${activeIndex}`
                  : undefined
              }
              autoComplete="off"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setListOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for an address, city, or landmark"
              className={`w-full rounded-lg border bg-[#F2F4F6] pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-200 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />

            {showList && (
              <ul
                id={listId}
                role="listbox"
                className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {searching || !visibleItems ? (
                  <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Searching…
                  </li>
                ) : visibleItems.length === 0 ? (
                  <li className="px-3 py-2.5 text-sm text-muted-foreground">
                    No places found.
                  </li>
                ) : (
                  visibleItems.map((prediction, i) => (
                    <li
                      key={prediction.placeId}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      // Keep focus in the input so the list doesn't close first.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPrediction(prediction)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex cursor-pointer items-start gap-2 px-3 py-2 text-sm",
                        i === activeIndex && "bg-gray-100",
                      )}
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-[#A9ACB3]" />
                      <span className="min-w-0">
                        <span className="block truncate text-primary-black">
                          {prediction.mainText?.text ?? prediction.text.text}
                        </span>
                        {prediction.secondaryText?.text && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {prediction.secondaryText.text}
                          </span>
                        )}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-gray-200">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={position ? zoom : browserLocation ? 13 : 10}
              onLoad={onMapLoad}
              onUnmount={onMapUnmount}
              onClick={onMapClick}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                scrollwheel: true,
                gestureHandling: "greedy",
                // styles: mapStyles,
              }}
            >
              {position && (
                <Marker
                  position={position}
                  icon={getPinIcon()}
                  draggable
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </GoogleMap>

            <button
              type="button"
              onClick={goToMyLocation}
              disabled={locating}
              aria-label="Use my current location"
              className="absolute bottom-3 right-3 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <Locate
                className={`h-4 w-4 text-[#1e5a8e] ${locating ? "animate-pulse" : ""}`}
              />
            </button>
          </div>

          {position && (
            <p className="mt-1 text-xs text-muted-foreground">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          )}
        </>
      ) : (
        <div className="h-75 flex items-center justify-center text-muted-foreground text-sm bg-gray-100 rounded-2xl">
          Loading Map...
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
