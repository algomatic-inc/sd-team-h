// NOTE: This should be synched with the backend's request_response_data.py.

export type Location = {
  latitude: number;
  longitude: number;
};

export type Place = {
  name: string;
  description: string;
  location: Location;
};

export type Route = {
  title: string;
  description: string;
  paths: Location[];
  pathGeoJson?: object;
  places: Place[];
  distanceInMeter: number;
  walkingDurationInMinutes: number;
};

export type SearchRequest = {
  query: string;
  startLocation: Location;
  endLocation: Location;
};

export type SearchResponse = {
  request: SearchRequest;
  paragraphs: string[];
  routes: Route[];
};

function parseRequest(data: any): SearchRequest | null {
  if (!data) {
    return null;
  }
  if (
    !data.hasOwnProperty("query") ||
    !data.hasOwnProperty("start_location") ||
    !data.hasOwnProperty("end_location")
  ) {
    return null;
  }
  return {
    query: data.query,
    startLocation: data.start_location,
    endLocation: data.end_location,
  };
}

export function parseResponse(data: any): SearchResponse | null {
  if (
    !data.hasOwnProperty("request") ||
    !data.hasOwnProperty("paragraphs") ||
    !data.hasOwnProperty("routes")
  ) {
    console.log("missing some fields in response");
    return null;
  }
  const request = parseRequest(data.request);
  if (!request) {
    return null;
  }
  const paragraphs = data.paragraphs;
  const routes = data.routes
    .map((route: any) => {
      if (
        !route.hasOwnProperty("title") ||
        !route.hasOwnProperty("description") ||
        !route.hasOwnProperty("paths") ||
        !route.hasOwnProperty("places") ||
        !route.hasOwnProperty("path_geo_json") ||
        !route.hasOwnProperty("distance_in_meter") ||
        !route.hasOwnProperty("walking_duration_in_minutes")
      ) {
        console.log("missing some fields in route");
        return null;
      }
      return {
        title: route.title,
        description: route.description,
        // TODO(ogurash): Check them.
        paths: route.paths,
        places: route.places,
        pathGeoJson: route.path_geo_json,
        distanceInMeter: route.distance_in_meter,
        walkingDurationInMinutes: route.walking_duration_in_minutes,
      };
    })
    .filter((route: Route | null) => route !== null) as Route[];
  return { request, paragraphs, routes };
}
