import { Place, Route } from "@/lib/SearchResponse";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { Location } from "@/lib/SearchResponse";
import { PinWithTextIcon } from "./icons/PinWithTextIcon";

type GeoJsonLoaderProps = {
  /** GeoJson object to load */
  geoJson: object;
};

function GeoJsonLoader({ geoJson }: GeoJsonLoaderProps): JSX.Element {
  const map = useMap();
  useEffect(() => {
    if (!map) {
      console.log("map is not ready");
      return;
    }
    map.data.addGeoJson(geoJson);
    map.data.setStyle({
      strokeColor: "blue",
      strokeWeight: 3,
    });
  }, [geoJson, map]);
  return <></>;
}

type PlaceItemProps = {
  pinText: string;
  name: string;
  description: string;
};

function PlaceItem({
  pinText,
  name,
  description,
}: PlaceItemProps): JSX.Element {
  return (
    <div className="flex flex-row">
      <div className="shrink-0">
        <PinWithTextIcon pinText={pinText} size={42}></PinWithTextIcon>
      </div>
      <div>
        <div className="font-bold">{name}</div>
        <div>{description}</div>
      </div>
    </div>
  );
}

type PlaceListProps = {
  /** List of places to display */
  places: Place[];
};

function PlaceList({ places }: PlaceListProps): JSX.Element {
  const map = useMap();
  const onPlaceClick = (place: Place) => {
    if (!map) {
      console.log("map is not ready");
      return;
    }
    map.panTo({
      lat: place.location.latitude,
      lng: place.location.longitude,
    });
  };
  return (
    <div className="flex flex-col gap-2">
      {places.map((place, index) => (
        <div
          className="cursor-pointer hover:shadow p-2 rounded"
          onClick={() => onPlaceClick(place)}
        >
          <PlaceItem
            key={index}
            pinText={index.toString()}
            name={place.name}
            description={place.description}
          />
        </div>
      ))}
    </div>
  );
}

type RouteMapProps = {
  /** Route to display */
  route: Route;
  // If specified, the map will be bounded by these locations.
  southWestBound: Location;
  northEastBound: Location;
};

export function RouteMap({
  route,
  southWestBound,
  northEastBound,
}: RouteMapProps): JSX.Element {
  if (!route.pathGeoJson) {
    return <div>Path is not available</div>;
  }
  const getPinText = (index: number) => {
    if (index === 0) {
      return "S";
    } else if (index === route.places.length - 1) {
      return "E";
    } else {
      return index.toString();
    }
  };
  // Calculate center of the map by taking the average of all places.
  // If there are no places, use the center of the bounding box.
  const aggregatedLatLng = route.places.reduce(
    (acc, place) => {
      acc.latitude += place.location.latitude;
      acc.longitude += place.location.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 }
  );
  const center =
    route.places.length === 0
      ? {
          lat: (southWestBound.latitude + northEastBound.latitude) / 2,
          lng: (southWestBound.longitude + northEastBound.longitude) / 2,
        }
      : {
          lat: aggregatedLatLng.latitude / route.places.length,
          lng: aggregatedLatLng.longitude / route.places.length,
        };

  const mapRestriction =
    southWestBound != null && northEastBound != null
      ? {
          latLngBounds: {
            north: northEastBound.latitude,
            south: southWestBound.latitude,
            east: northEastBound.longitude,
            west: southWestBound.longitude,
          },
          strictBounds: true,
        }
      : null;
  return (
    <div className="flex flex-row gap-8">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}>
        <PlaceList places={route.places} />
        <Map
          defaultZoom={13}
          defaultCenter={center}
          zoomControl={false}
          scaleControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? ""}
          restriction={mapRestriction}
          className="h-[240px] w-[240px] shrink-0 mt-10"
        />
        <GeoJsonLoader geoJson={route.pathGeoJson} />
        {route.places.map((place, index) => (
          <AdvancedMarker
            position={{
              lat: place.location.latitude,
              lng: place.location.longitude,
            }}
          >
            <Pin glyph={getPinText(index)} glyphColor={"white"} />
          </AdvancedMarker>
        ))}
      </APIProvider>
    </div>
  );
}
