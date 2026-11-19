"use client";

import { GoogleMap, OverlayView } from "@react-google-maps/api";
import { CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IPropertyResponse } from "@/types";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default fallback center — Cincinnati, OH
const DEFAULT_CENTER = { lat: 39.103119, lng: -84.512016 };

interface LocationMapProps {
  properties: IPropertyResponse[];
  title?: string;
  zoom?: number;
  heightClassName?: string;
  activeId?: IPropertyResponse["_id"] | null;
  onMarkerClick?: (property: IPropertyResponse) => void;
}

/** Formats a raw price number into a compact label, e.g. 310000 -> "$310K" */
function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${Math.round(price / 1000)}K`;
  }
  return `$${price}`;
}

function getCenter(properties: IPropertyResponse[]) {
  if (!properties.length) return DEFAULT_CENTER;
  const lats = properties.map((p) => p.location.coordinates[1]);
  const lngs = properties.map((p) => p.location.coordinates[0]);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

export function PropertiesInMap({
  properties,
  zoom = 14,
  heightClassName = "xl:h-[calc(100vh-250px)] h-[calc(100vh-150px)]",
  activeId: activeIdProp,
  onMarkerClick,
}: LocationMapProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [internalActiveId, setInternalActiveId] = useState<
    IPropertyResponse["_id"] | null
  >(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = activeIdProp ?? internalActiveId;

  const center = useMemo(() => {
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (latStr && lngStr) {
      const latParam = Number(latStr);
      const lngParam = Number(lngStr);

      if (Number.isFinite(latParam) && Number.isFinite(lngParam)) {
        return { lat: latParam, lng: lngParam };
      }
    }
    return DEFAULT_CENTER;
  }, [searchParams]);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      mapInstance.setCenter(center);
      mapInstance.setZoom(zoom);
    },
    [center, zoom],
  );

  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  const onUnmount = useCallback(() => setMap(null), []);

  const handleMarkerClick = useCallback(
    (property: IPropertyResponse) => {
      setInternalActiveId(property._id);
      onMarkerClick?.(property);
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", String(property.location.coordinates[1]));
      params.set("lng", String(property.location.coordinates[0]));
      router.push(
        `${pathname}?${params.toString()}#property-${property._id}`,
      );
    },
    [onMarkerClick, pathname, router, searchParams],
  );

  return (
    <div className="w-full border-none shadow-none">
      <CardContent className="px-0">
        <div
          className={`border-none overflow-hidden w-full ${heightClassName}`}
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={zoom}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                scrollwheel: true,
                gestureHandling: "greedy",
              }}
            >
              {properties.map((property) => (
                <OverlayView
                  key={property._id}
                  position={{
                    lat: property.location.coordinates[1],
                    lng: property.location.coordinates[0],
                  }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <PriceMarker
                    price={property.listingPrice}
                    active={activeId === property._id}
                    onClick={() => handleMarkerClick(property)}
                  />
                </OverlayView>
              ))}
            </GoogleMap>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm bg-gray-100">
              Loading Map...
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}

function PriceMarker({
  price,
  active,
  onClick,
}: {
  price: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer select-none focus:outline-none group"
      style={{ transform: "translate(-50%, -100%)" }}
    >
      <div
        className={`px-5 py-1.5 rounded-full text-xs font-semibold shadow-md whitespace-nowrap border border-white/10 transition-colors ${
          active
            ? "bg-[#1e5a8e] text-white"
            : "bg-primary-color text-white group-hover:bg-[#1e5a8e]"
        }`}
      >
        {formatPrice(price)}
      </div>
      <div
        className={`w-2 h-2 rotate-45 mx-auto -mt-1 transition-colors ${
          active ? "bg-[#1e5a8e]" : "bg-primary-color group-hover:bg-[#1e5a8e]"
        }`}
      />
    </button>
  );
}
