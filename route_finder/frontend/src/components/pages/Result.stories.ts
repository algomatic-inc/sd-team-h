import {
  reactRouterParameters,
  withRouter,
} from "storybook-addon-remix-react-router";
import { Meta, StoryObj } from "@storybook/react";
import Result from "./Result";

const meta: Meta<typeof Result> = {
  component: Result,
};

export default meta;
type Story = StoryObj<typeof Result>;

export const Default: Story = {
  args: {},
  decorators: [withRouter()],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        state: {
          request: {
            query: "this is a query",
            start_location: {
              latitude: 35.671236,
              longitude: 139.757125,
            },
            end_location: {
              latitude: 35.691236,
              longitude: 139.777125,
            },
          },
          paragraphs: ["This is a paragraph."],
          routes: [
            {
              title: "Route to the nearest park, with much greenery",
              description:
                "This route will take you to the nearest park, with much greenery.",
              paths: [],
              path_geo_json: {
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
              distance_in_meter: 1200,
              walking_duration_in_minutes: 15,
            },
          ],
        },
      },
    }),
  },
};
