import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Input } from "./input";
import { Label } from "@radix-ui/react-label";

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
  const [locationText, setLocationText] = useState("");

  return (
    <Popover>
      <div className="flex items-center h-12">
        {name}:
        {locationSelected ? (
          <PopoverTrigger asChild>
            <Button
              onClick={() => {
                setLocationSelected(false);
                onLocationChange?.(0, 0);
                onLocationNameChange?.("");
              }}
            >
              Clear
            </Button>
          </PopoverTrigger>
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
                  setLocationSelected(true);
                  onLocationNameChange?.(locationText);
                }}>update</Button>
            </TabsContent>
            <TabsContent value="map">Map goes here</TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LocationPicker;
