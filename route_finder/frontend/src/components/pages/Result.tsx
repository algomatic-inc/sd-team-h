import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/ui/SearchInput";
import { useLocation } from "react-router-dom";
import { parseResponse, SearchResponse } from "@/lib/SearchResponse";

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

  const topRoute =
    searchResponse.routes.length === 0 ? null : searchResponse.routes[0];

  // TODO(ogurash): Use the query from the state.
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="flex flex-col w-[640px]">
          <p>
            Result for:
            <span className="font-medium pl-2">
              {searchResponse.request.query}
            </span>
          </p>
          <div className="pt-4 text-lg max-w-xl font-light">
            {searchResponse.paragraphs.map((paragraph) => (
              <p>{paragraph}</p>
            ))}
          </div>
          {/* Main result area */}
          {topRoute === null ? (
            <div className="pt-4">
              <p>No route found.</p>
            </div>
          ) : (
            <div>
              <div>
                <RouteCandidate
                  name={topRoute.title}
                  description={topRoute.description}
                  points={topRoute.places.map((place) => ({
                    key: place.name,
                    location: {
                      lat: place.location.latitude,
                      lng: place.location.longitude,
                    },
                    description: place.description,
                    type:
                      place.name === "Your current location"
                        ? "start"
                        : place.name === "Ryuhoku Park"
                        ? "end"
                        : "waypoint",
                  }))}
                />
              </div>
            </div>
          )}

          {/* Other candidates */}
          <div>
            <div>Other route candidates:</div>
            <Carousel
              opts={{ align: "start" }}
              className="w-full max-w-lg pt-2"
            >
              <CarouselContent>
                <CarouselItem className="lg:basis-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/2">
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

          {/* Explore more */}
          <div className="pt-4 w-[240pt]">
            <div>Explore more:</div>
            <SearchInput placeholder="Search for more routes" />
          </div>
        </div>
      </div>
    </div>
  );
}

type RoutePoint = {
  key: string;
  location: google.maps.LatLngLiteral;
  description: string;
  type: "start" | "end" | "waypoint";
};

type RouteCandidateProps = {
  name: string;
  description: string;
  points: RoutePoint[];
};

function RouteCandidate({ name, description, points }: RouteCandidateProps) {
  const map = useMap();
  const selectPointHandler = (point: RoutePoint) => {
    console.log(point);
    console.log(map === null);
    map?.setCenter(point.location);
  };
  const pinClickHandler = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      if (!map) return;
      if (ev.latLng) {
        console.log(ev.latLng.toJSON());
        map.setCenter(ev.latLng);
        map.panTo(ev.latLng);
      }
    },
    [map]
  );
  const routePins = points.map((point) => (
    <AdvancedMarker
      key={point.key}
      position={point.location}
      clickable={true}
      onClick={pinClickHandler}
    >
      <Pin />
    </AdvancedMarker>
  ));
  const routeDescriptions = points.map((point) => (
    <div className="flex" onClick={() => selectPointHandler(point)}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Google_Maps_pin.svg"
        alt="pin"
        className="h-8 w-8"
      />
      <p>{point.description}</p>
    </div>
  ));
  return (
    <div className="w-[840px] pt-4">
      <div className="text-lg font-medium">{name}</div>
      <div className="font-light">{description}</div>
      <div className="h-[400px] pt-4">
        <div className="flex">
          <div className="flex flex-col gap-4 pr-4">{routeDescriptions}</div>
          <div className="justify-items-end">
            <APIProvider
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}
            >
              <Map
                defaultZoom={13}
                defaultCenter={{ lat: 35.6974952, lng: 139.7859834 }}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? ""}
                className="h-[240px] w-[240px]"
              >
                {routePins}
              </Map>
            </APIProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
