import dataclasses
import logging

_logger = logging.getLogger(__name__)


@dataclasses.dataclass
class Location:
    """Location dataclass."""

    latitude: float
    longitude: float

    @classmethod
    def from_str(cls, location_str: str) -> "Location":
        """Create Location object from string."""
        if not location_str or "," not in location_str:
            _logger.warning(f"Invalid location string: {location_str}")
            return None

        latitude, longitude = location_str.split(",")
        try:
            return cls(float(latitude), float(longitude))
        except ValueError:
            _logger.warning(f"Invalid location string: {location_str}")
            return None


@dataclasses.dataclass
class Place:
    """Place dataclass."""

    name: str
    description: str
    location: Location


@dataclasses.dataclass
class Route:
    """Route dataclass."""

    title: str
    description: str
    # This is a list of locations that make up the route, sorted from start to end.
    paths: list[Location]
    path_geo_json: dict
    places: list[Place]
    distance_in_meter: float
    # We consider only walking time.
    walking_duration_in_minutes: float


@dataclasses.dataclass
class SearchRequest:
    """Request dataclass."""

    query: str
    start_location: Location
    end_location: Location


@dataclasses.dataclass
class SearchResponse:
    """SearchResponse dataclass."""

    request: SearchRequest
    paragraphs: list[str]
    routes: list[Route]
