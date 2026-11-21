"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RsvpList from "./RsvpList";

export default function RsvpTabs() {
  return (
    <Tabs defaultValue="received" className="w-full">
      <TabsList className="h-auto bg-transparent p-0">
        <TabsTrigger
          value="received"
          className="data-active:bg-primary-color rounded-full data-active:text-white cursor-pointer px-4 py-3.5 mr-1"
        >
          Received
        </TabsTrigger>
        <TabsTrigger
          value="interested"
          className="data-active:bg-primary-color rounded-full data-active:text-white cursor-pointer px-4 py-3.5"
        >
          Interested
        </TabsTrigger>
      </TabsList>
      <TabsContent value="received" className="mt-4">
        <RsvpList mode="received" />
      </TabsContent>
      <TabsContent value="interested" className="mt-4">
        <RsvpList mode="interested" />
      </TabsContent>
    </Tabs>
  );
}
