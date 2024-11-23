import type { Meta, StoryObj } from "@storybook/react";

import { LocationPicker } from "./LocationPicker";
import { useState } from "react";
import { Location } from "@/lib/SearchResponse";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof LocationPicker> = {
  component: LocationPicker,
};

export default meta;
type Story = StoryObj<typeof LocationPicker>;
type StateStory = StoryObj<typeof LocationState>;

export const Default: Story = {
  args: {},
};

export const WithStartLocation: Story = {
  args: {
    startLocation: { latitude: 35.681236, longitude: 139.767125 },
  },
};

export const WithBoundingBox: Story = {
  args: {
    southWestBound: { latitude: 35.681236, longitude: 139.767125 },
    northEastBound: { latitude: 35.681236, longitude: 139.767125 },
  },
};

/** Wrapper class to store state for LocationPicker. */
type LocationStateParams = {
  defaultStartLocation?: Location;
  defaultEndLocation?: Location;
  southWestBound?: Location;
  northEastBound?: Location;
  defaultCenter?: Location;
};
function LocationState({
  defaultStartLocation,
  defaultEndLocation,
  southWestBound,
  northEastBound,
  defaultCenter,
}: LocationStateParams): JSX.Element {
  const [startLocation, setStartLocation] = useState<Location | undefined>(
    defaultStartLocation
  );
  const [endLocation, setEndLocation] = useState<Location | undefined>(
    defaultEndLocation
  );
  return LocationPicker({
    startLocation,
    endLocation,
    onStartLocationChange: (loc) => {
      action("onStartLocationChange")(loc);
      setStartLocation(loc);
    },
    onEndLocationChange: (loc) => {
      action("onEndLocationChange")(loc);
      setEndLocation(loc);
    },
    southWestBound,
    northEastBound,
    defaultCenter,
  });
}

export const WithState: StateStory = {
  args: {},
  render: LocationState,
};

export const WithStateWithInitialLocations: StateStory = {
  args: {
    defaultStartLocation: { latitude: 35.681236, longitude: 139.767125 },
    defaultEndLocation: { latitude: 35.691236, longitude: 139.767125 },
  },
  render: LocationState,
};

export const WithStateWithBoundingBox: StateStory = {
  args: {
    southWestBound: { latitude: 35.681236, longitude: 139.757125 },
    northEastBound: { latitude: 35.691236, longitude: 139.767125 },
  },
  render: LocationState,
};
