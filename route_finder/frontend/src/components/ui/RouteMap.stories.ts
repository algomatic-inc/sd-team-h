import { Meta, StoryObj } from "@storybook/react";
import { RouteMap } from "./RouteMap";

const meta: Meta<typeof RouteMap> = {
  component: RouteMap,
};

export default meta;
type Story = StoryObj<typeof RouteMap>;

export const Default: Story = {
  args: {
    route: {
      title: "Route to the nearest park, with much greenery",
      description:
        "This route will take you to the nearest park, with much greenery.",
      paths: [],
      pathGeoJson: {
        type: "Feature",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:OGC:1.3:CRS84",
          },
        },
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [139.757125, 35.671236],
            [139.767125, 35.681236],
            [139.777125, 35.691236],
          ],
        },
      },
      places: [
        {
          name: "Starting point",
          description: "The starting point of the route.",
          location: {
            latitude: 35.671236,
            longitude: 139.757125,
          },
        },
        {
          name: "Scenic spot",
          description: "A scenic spot along the route.",
          location: {
            latitude: 35.681236,
            longitude: 139.767125,
          },
        },
        {
          name: "Ending point",
          description: "The ending point of the route.",
          location: {
            latitude: 35.691236,
            longitude: 139.777125,
          },
        },
      ],
      distanceInMeter: 1000,
      walkingDurationInMinutes: 10,
    },
  },
};
