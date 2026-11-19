"use client";
import Container from "@/components/shared/container/Container";
import { PropertiesInMap } from "./PropertiesInMap";
import { useState } from "react";
import FilterOptions from "@/components/shared/utils/FilterOptions";
import PropertiesList from "./PropertiesList";
import { useGetPropertiesForWebQuery } from "@/redux/api/propertiesApi";
import MapListingsSkeleton from "@/components/skeleton/MapListingsSkeleton";

export type SearchParams = {
  [key: string]: string | string[] | number | undefined;
};

export default function PropertiesInMapContainer({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [selectedProperty, setSelectedProperty] = useState<any>();
  const { data, isLoading } = useGetPropertiesForWebQuery({
    ...searchParams,
    limit: 1000,
  });

  if (isLoading)
    return (
      <Container>
        <MapListingsSkeleton />
      </Container>
    );

  return (
    <Container className="flex relative">
      <div className="flex-1 ">
        <FilterOptions layout="horizontal" />
        <PropertiesInMap
          properties={data?.data}
          onMarkerClick={(p) => setSelectedProperty(p)}
        />
      </div>
      <div className="absolute -top-2 right-0 lg:relative">
        <PropertiesList
          properties={data?.data}
          id={selectedProperty?._id ?? ""}
        />
      </div>
    </Container>
  );
}
