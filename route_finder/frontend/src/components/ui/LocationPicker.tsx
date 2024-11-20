import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Input } from "./input";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

type LocationPickerProps = {
  name: string;
  onLocationChange?: (latitude: number, longitude: number) => void;
  onLocationNameChange?: (name: string) => void;
};

function LocationPicker({
  name,
  onLocationChange,
  onLocationNameChange,
}: LocationPickerProps): JSX.Element {
  const [locationSelected, setLocationSelected] = useState(false);
  const [submittedLocationText, setSubmittedLocationText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const handleLocationTextSubmit = () => {
    // Goecoding to get latitude and longitude
    axios
      .get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address: locationText,
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
        },
      })
      .then((response) => {
        console.log(response.data);
        if (
          response.data.status !== "OK" ||
          response.data.results.length === 0
        ) {
          console.error("Failed to get location");
        } else {
          const location = response.data.results[0].geometry.location;
          setLatitude(location.lat);
          setLongitude(location.lng);
          setSubmittedLocationText(locationText);
          console.log(location);
          onLocationChange?.(location.lat, location.lng);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Popover>
      <div className="flex items-center h-12">
        {name}:
        {locationSelected ? (
          <div className="pl-2">
            <span>{submittedLocationText}</span>
            <PopoverTrigger asChild>
              <Button> Change </Button>
            </PopoverTrigger>
          </div>
        ) : (
          <PopoverTrigger asChild>
            <button onClick={() => setLocationSelected(true)}>Select</button>
          </PopoverTrigger>
        )}
      </div>
      <PopoverContent>
        <div className="flex items-center">
          <Tabs defaultValue="text" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Label htmlFor="location-text">Location</Label>
              <Input
                id="location-text"
                placeholder="Enter location name or address"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
              <Button
                onClick={() => {
                  handleLocationTextSubmit();
                }}
              >
                update
              </Button>
            </TabsContent>
            <TabsContent value="map">
              {latitude === 0 && longitude === 0 ? (
                <div>Location is not selected</div>
              ) : (
                <div>
                  <APIProvider
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ""}
                  >
                    <Map
                      defaultZoom={13}
                      defaultCenter={{ lat: latitude, lng: longitude }}
                      mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? ""}
                      className="h-[240px] w-[240px]"
                    >
                      <AdvancedMarker
                        position={{ lat: latitude, lng: longitude }}
                      >
                        <Pin />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LocationPicker;
