import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { parseResponse, SearchResponse } from "@/lib/SearchResponse";
import { RouteMap } from "../ui/RouteMap";
import { BOUNDING_BOX } from "@/lib/Constants";

function buildDefaultResponse(): SearchResponse {
  return {
    request: {
      query: "Mostly shaded route to the nearest park",
      startLocation: { latitude: 35.6895, longitude: 139.6917 },
      endLocation: { latitude: 35.6895, longitude: 139.6917 },
    },
    paragraphs: [
      "We found some routes that match your preference.",
      "The following is the best route we found for you.",
    ],
    routes: [
      {
        title: "Shaded route with greenery",
        description:
          "Much greenery on this route, and you can see shading by the greeneries. XXXXXXX",
        paths: [
          { latitude: 35.5974952, longitude: 139.7859834 },
          { latitude: 35.7974952, longitude: 139.7859834 },
          { latitude: 35.7974952, longitude: 139.7859834 },
          { latitude: 35.6974952, longitude: 139.7859834 },
        ],
        places: [
          {
            name: "Your current location",
            description: "Start point: Your current location",
            location: { latitude: 35.5974952, longitude: 139.7859834 },
          },
          {
            name: "Greenery area",
            description:
              "Waypoint 1: Greenery area. In fall, you can see red leaves.",
            location: { latitude: 35.7974952, longitude: 139.7859834 },
          },
          {
            name: "Good view of the park",
            description: "Waypoint 2: Good view of the park",
            location: { latitude: 35.7974952, longitude: 139.7859834 },
          },
          {
            name: "Ryuhoku Park",
            description: "Goal: The nearest park, Ryuhoku Park",
            location: { latitude: 35.6974952, longitude: 139.7859834 },
          },
        ],
        distanceInMeter: 1200,
        walkingDurationInMinutes: 15,
      },
    ],
  };
}

function Result(): JSX.Element {
  const location = useLocation();
  const state = location.state as any;
  const searchResponse = parseResponse(state) ?? buildDefaultResponse();
  console.log(searchResponse);

  const [selectedRoute] = useState(
    searchResponse.routes.length > 0 ? searchResponse.routes[0] : null
  );

  return (
    <div className="w-full mt-24">
      <div className="flex justify-center">
        <div className="flex flex-col w-[800px]">
          <p>
            Result for:
            <span className="font-medium pl-2">
              {searchResponse.request.query}
            </span>
          </p>
          <div className="pt-4 text-md w-[800px] font-light">
            {searchResponse.paragraphs.map((paragraph) => (
              <p>{paragraph}</p>
            ))}
          </div>
          {/* Main result area */}
          {selectedRoute === null ? (
            <div className="pt-4">
              <p>No route found.</p>
            </div>
          ) : (
            <div className="pt-8">
              <div className="text-lg font-bold">{selectedRoute.title}</div>
              <div className="">{selectedRoute.description}</div>
              <div className="pt-4">
                <RouteMap
                request={searchResponse.request}
                  route={selectedRoute}
                  northEastBound={BOUNDING_BOX.northEast}
                  southWestBound={BOUNDING_BOX.southWest}
                />
              </div>
            </div>
          )}

          {/* Other candidates */}
          <div className="pt-8">
            <div>Other route candidates:</div>
            <Carousel
              opts={{ align: "start" }}
              className="w-full w-[800px] pt-2"
            >
              <CarouselContent>
                <CarouselItem className="lg:basis-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
