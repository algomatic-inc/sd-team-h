# Description: Main entry point for the server.
import dataclasses
import json
import logging
import os
from typing import Any

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from geojson_length import calculate_distance, Unit

from constants import WEIGHT_LANDMARKS
from request_response_data import SearchRequest, Location, SearchResponse, Route, Place
from server.add_explanation import add_explanation
from server.calculate_weights import calc_weights
from server.extract_landmarks import extract_landmarks
from server.get_routes import get_routes


app = Flask(__name__, static_folder="dist", static_url_path="")

logger: logging.Logger = logging.getLogger(__name__)

if app.debug:
    # Allow CORS from the React app running in development mode.
    CORS(app)
    logger.error("debug mode")

# configure connection to the database
db_url = (
    f'postgresql://'
    f'{os.getenv("DB_USER")}:'
    f'{os.getenv("DB_PASSWORD")}@'
    f'{os.getenv("DB_HOST")}:'
    f'{os.getenv("DB_PORT")}/'
    f'{os.getenv("DB_NAME")}'
)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
db = SQLAlchemy(app)

_HTTP_400_BAD_REQUEST = 400


@app.route("/")
def server():
    """Serves the React files."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/search")
def search():
    """Search API endpoint."""
    logger.error("process started.")

    preference: str | None = request.args.get("q")
    start_location: str | None = request.args.get("s")
    end_location: str | None = request.args.get("e")
    # Delay seconds for emulating server delay.
    delay: str | None = request.args.get("delay")
    logger.error(f"request: {preference=}, {start_location=}, {end_location=}")

    # Validate the request.
    if not preference or not start_location or not end_location:
        return (
            jsonify({"error": "Missing preference, start, or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    start_loc_obj: Location | None = Location.from_str(start_location)
    end_loc_obj: Location | None = Location.from_str(end_location)
    if start_loc_obj is None or end_loc_obj is None:
        return (
            jsonify({"error": "Invalid start or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    req: SearchRequest | None = SearchRequest(
        preference, start_loc_obj, end_loc_obj
    )
    if req is None:
        return jsonify({"error": "Invalid request."}), _HTTP_400_BAD_REQUEST

    # calculate weights of variables
    weights: dict[str, float] = calc_weights(preference)
    logger.error(f"{weights=}")

    # inference landmarks
    landmarks: list[str] = extract_landmarks(preference)
    logger.error(f"{landmarks=}")

    # get info of routes and landmarks
    routes_info: str
    landmarks_info: str | None

    routes_info, landmarks_info = get_routes(
        db,
        start_lat=start_loc_obj.latitude,
        start_lon=start_loc_obj.longitude,
        end_lat=end_loc_obj.latitude,
        end_lon=end_loc_obj.longitude,
        weight_length=weights['weight_length'],
        weight_green_index=weights['weight_green_index'],
        weight_water_index=weights['weight_water_index'],
        weight_shade_index=weights['weight_shade_index'],
        weight_slope_index=weights['weight_slope_index'],
        weight_road_safety=weights['weight_road_safety'],
        weight_isolation=weights['weight_isolation'],
        weight_landmarks=WEIGHT_LANDMARKS,
        landmarks=landmarks,
    )
    routes_info_dict: dict[str, Any] = {
        "type": "Feature",
        "properties": {},
        "geometry": json.loads(routes_info)
    }

    # calculate
    # distance [meters]
    distance: float = calculate_distance(routes_info_dict, Unit.meters)
    logger.error(f"{distance=}")
    # duration [minutes]
    duration: int = int(distance / 1.4 / 60)
    logger.error(f"{duration=}")

    # add explanation
    explained_info: dict[str, Any] = add_explanation(preference, routes_info, landmarks_info)
    logger.error(f"explained_info: {explained_info}")

    # generate response
    route: Route = Route(
        title=explained_info["title"],
        description=explained_info["description"],
        paths=[],
        path_geo_json={
            "type": "FeatureCollection",
            "features": [routes_info_dict],
        },
        places=[
            Place(
                place.get("name", ""),
                place.get("description", ""),
                Location(place.get("latitude", 0), place.get("longitude", 0))
            ) for place in explained_info["details"]
        ],
        distance_in_meter=distance,
        walking_duration_in_minutes=duration,
    )
    response: SearchResponse = SearchResponse(
        request=req,
        # TODO: implement
        paragraphs=[],
        routes=[route],
    )
    logger.error(f"response: {response=}")

    logger.error("process completed.")
    return jsonify(dataclasses.asdict(response))


if __name__ == "__main__":
    app.run()
