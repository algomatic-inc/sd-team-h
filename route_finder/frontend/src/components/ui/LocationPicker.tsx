import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Location } from "@/lib/SearchResponse";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  MapMouseEvent,
  Pin,
} from "@vis.gl/react-google-maps";
import { QuestionPin } from "./icons/QuestionPin";
import { CheckedPin } from "./icons/CheckedPin";

type LocationPickerProps = {
  startLocation?: Location;
  endLocation?: Location;
  onStartLocationChange?: (location: Location | undefined) => void;
  onEndLocationChange?: (location: Location | undefined) => void;
  // If specified, the map will be bounded by these locations.
  southWestBound?: Location;
  northEastBound?: Location;
  defaultCenter?: Location;
};

/** UI component to pick start and end points for route finding. */
export function LocationPicker({
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  southWestBound,
  northEastBound,
  defaultCenter = { latitude: 35.681236, longitude: 139.767125 },
}: LocationPickerProps): JSX.Element {
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
    <Popover>
      <div className="flex items-center h-12">
        <PopoverTrigger asChild>
          <div className="flex rounded border shadow p-2 cursor-pointer">
            <span>Start location</span>
            {startLocation == null ? (
              <QuestionPin size={24} />
            ) : (
              <span>
                <CheckedPin size={24} />
              </span>
            )}
            <span className="pl-4">End location</span>
            {endLocation == null ? (
              <QuestionPin size={24} />
            ) : (
              <CheckedPin size={24} />
            )}
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[400px]">
        <div className="flex items-center">
          <div>
            <APIProvider
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}
            >
              <Map
                defaultZoom={13}
                defaultCenter={{
                  lat: defaultCenter.latitude,
                  lng: defaultCenter.longitude,
                }}
                zoomControl={false}
                scaleControl={false}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? ""}
                restriction={mapRestriction}
                className="h-[360px] w-[360px]"
                onClick={(event: MapMouseEvent) => {
                  const latLng = event.detail.latLng;
                  if (latLng == null) {
                    console.log("latLng is null");
                    return;
                  }
                  if (startLocation == null) {
                    onStartLocationChange?.({
                      latitude: latLng.lat,
                      longitude: latLng.lng,
                    });
                  } else if (endLocation == null) {
                    onEndLocationChange?.({
                      latitude: latLng.lat,
                      longitude: latLng.lng,
                    });
                  }
                }}
              >
                {startLocation != null && (
                  <AdvancedMarker
                    position={{
                      lat: startLocation.latitude,
                      lng: startLocation.longitude,
                    }}
                    title={"Start location"}
                  >
                    <Pin glyph={"S"} glyphColor={"white"} />
                  </AdvancedMarker>
                )}
                {endLocation != null && (
                  <AdvancedMarker
                    position={{
                      lat: endLocation.latitude,
                      lng: endLocation.longitude,
                    }}
                    title={"End location"}
                  >
                    <Pin glyph={"E"} glyphColor={"white"} />
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>
            <div className="flex flex-col items-end">
              <div
                className="border rounded w-fit cursor-pointer py-1 px-2 mt-2"
                onClick={() => {
                  onStartLocationChange?.(undefined);
                  onEndLocationChange?.(undefined);
                }}
              >
                Clear
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
