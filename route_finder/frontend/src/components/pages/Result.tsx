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

function Result() {
  const query = "Mostly shaded route to the nearest park";
  return (
    <div className="p-20">
      <p>
        Result for:
        <span className="font-medium pl-2">{query}</span>
      </p>
      <div className="pt-4 text-lg max-w-xl font-light">
        <p>
          We searched for the best route for you. The nearest park is Ryuhoku
          Park, which is 1.2 km away from your current location.
        </p>
        <p>X street is mostly shaded during daytime, with tall buildings.</p>
        <p>Here are routes that you can take:</p>
      </div>
      {/* Main result area */}
      <div>
        <RouteCandidate
          name="Shaded route with greenery"
          description="Much greenery on this route, and you can see shading by the greeneries. XXXXXXX"
          points={[
            {
              key: "start",
              location: { lat: 35.5974952, lng: 139.7859834 },
              description: "Start point: Your current location",
              type: "start",
            },
            {
              key: "waypoint1",
              location: { lat: 35.7974952, lng: 139.7859834 },
              description:
                "Waypoint 1: Greenery area. In fall, you can see red leaves.",
              type: "waypoint",
            },
            {
              key: "waypoint2",
              location: { lat: 35.7974952, lng: 139.7859834 },
              description: "Waypoint 2: Good view of the park",
              type: "waypoint",
            },
            {
              key: "end",
              location: { lat: 35.6974952, lng: 139.7859834 },
              description: "Goal: The nearest park, Ryuhoku Park",
              type: "end",
            },
          ]}
        />
      </div>

      {/* Other candidates */}
      <div>
        <div>Other route candidates:</div>
        <Carousel opts={{ align: "start" }} className="w-full max-w-lg pt-2">
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
