import { Place, Route, SearchRequest } from "@/lib/SearchResponse";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
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

const getPinText = (index: number, places: Place[]) => {
  if (index === 0) {
    return "S";
  } else if (index === places.length - 1) {
    return "E";
  } else {
    return index.toString();
  }
};

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
            pinText={getPinText(index, places)}
            name={place.name}
            description={place.description}
          />
        </div>
      ))}
    </div>
  );
}

type MarkerWithInfoWindowProps = {
  location: Location;
  title: string;
  description: string;
  pinText: string;
  markerIndex: number;
  openedInfoWindowIndex: number;
  onInfoWindowOpen: (index: number) => void;
};

// See https://visgl.github.io/react-google-maps/docs/api-reference/components/info-window
function MarkerWithInfoWindow({
  location,
  title,
  description,
  pinText,
  markerIndex,
  openedInfoWindowIndex,
  onInfoWindowOpen,
}: MarkerWithInfoWindowProps): JSX.Element {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const infoWindowShown = markerIndex === openedInfoWindowIndex;
  const handleMarkerClick = useCallback(() => {
    onInfoWindowOpen(markerIndex);
  }, []);
  const handleClose = useCallback(() => onInfoWindowOpen(-1), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{
          lat: location.latitude,
          lng: location.longitude,
        }}
        onClick={handleMarkerClick}
      >
        <Pin glyph={pinText} glyphColor={"white"} />
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          <div className="max-w-80">
            <div className="font-lg font-bold">{title}</div>
            <p>{description}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

type RouteMapProps = {
  request: SearchRequest;
  /** Route to display */
  route: Route;
  // If specified, the map will be bounded by these locations.
  southWestBound: Location;
  northEastBound: Location;
};

export function RouteMap({
  request,
  route,
  southWestBound,
  northEastBound,
}: RouteMapProps): JSX.Element {
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(-1);

  if (!route.pathGeoJson) {
    return <div>Path is not available</div>;
  }

  // Add start and end to the list of places.
  const modifiedRoute: Route = {
    ...route,
    places: [
      {
        name: "スタート地点",
        description: "冒険の始まりとなる静かな場所",
        location: request.startLocation,
      },
      ...route.places,
      {
        name: "ゴール地点",
        description: "道の終わりに広がる、ほっとできる場所",
        location: request.endLocation,
      },
    ],
  };

  // Calculate center of the map by taking the average of all places.
  // If there are no places, use the center of the bounding box.
  const aggregatedLatLng = modifiedRoute.places.reduce(
    (acc, place) => {
      acc.latitude += place.location.latitude;
      acc.longitude += place.location.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 }
  );
  const center =
    modifiedRoute.places.length === 0
      ? {
          lat: (southWestBound.latitude + northEastBound.latitude) / 2,
          lng: (southWestBound.longitude + northEastBound.longitude) / 2,
        }
      : {
          lat: aggregatedLatLng.latitude / modifiedRoute.places.length,
          lng: aggregatedLatLng.longitude / modifiedRoute.places.length,
        };

  // const mapRestriction =
  //   southWestBound != null && northEastBound != null
  //     ? {
  //         latLngBounds: {
  //           north: northEastBound.latitude,
  //           south: southWestBound.latitude,
  //           east: northEastBound.longitude,
  //           west: southWestBound.longitude,
  //         },
  //         strictBounds: true,
  //       }
  //     : null;
  const mapRestriction = null;
  return (
    <div className="flex flex-row gap-8">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}>
        <PlaceList places={modifiedRoute.places} />
        <Map
          defaultZoom={13}
          defaultCenter={center}
          zoomControl={false}
          scaleControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? ""}
          restriction={mapRestriction}
          className="h-[240px] w-[240px] shrink-0 mt-10"
        />
        <GeoJsonLoader geoJson={route.pathGeoJson} />
        {modifiedRoute.places.map((place, index) => (
          <MarkerWithInfoWindow
            key={index}
            location={place.location}
            title={place.name}
            description={place.description}
            pinText={getPinText(index, modifiedRoute.places)}
            markerIndex={index}
            openedInfoWindowIndex={selectedPlaceIndex}
            onInfoWindowOpen={setSelectedPlaceIndex}
          />
        ))}
      </APIProvider>
    </div>
  );
}
