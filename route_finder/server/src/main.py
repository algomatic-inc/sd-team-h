# Description: Main entry point for the server.
import dataclasses
import logging
import os
from typing import Any

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from mock_response import build_mock_response
from request_response_data import SearchRequest, Location, SearchResponse
from server.add_explanation import add_explanation
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

    query: str | None = request.args.get("q")
    start_location: str | None = request.args.get("s")
    end_location: str | None = request.args.get("e")
    # Delay seconds for emulating server delay.
    delay: str | None = request.args.get("delay")
    logger.error(f"request: {query=}, {start_location=}, {end_location=}")

    # Validate the request.
    if not query or not start_location or not end_location:
        return (
            jsonify({"error": "Missing query, start, or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    start_loc_obj: Location | None = Location.from_str(start_location)
    end_loc_obj: Location | None = Location.from_str(end_location)
    if start_loc_obj is None or end_loc_obj is None:
        return (
            jsonify({"error": "Invalid start or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    req: SearchRequest | None = SearchRequest(query, start_loc_obj, end_loc_obj)
    if req is None:
        return jsonify({"error": "Invalid request."}), _HTTP_400_BAD_REQUEST

    # calculate weights of variables
    # TODO: implement

    # get info of routes and landmarks
    routes_info: Any = None
    landmarks_info: Any = None

    # TODO: replace with actual weights
    routes_info, landmarks_info = get_routes(
        db,
        0.333,  # weight_length
        0.333,  # weight_green_index
        0.333,  # weight_water_index
        0.0,    # weight_shade_index
        0.0,    # weight_slope_index
        0.0,    # weight_road_safety
        0.0,    # weight_isolation
        0.0,    # weight_landmarks
        [],
        35.783596266118984,  # start_lat
        139.71752376708983,  # start_lon
        35.777607986362796,  # end_lat
        139.72078533325194,  # end_lon
    )

    # add explanation
    res = add_explanation(query, routes_info)

    # Return the mock response for now.
    # TODO: Implement the actual search logic.
    resp: SearchResponse = build_mock_response(req)
    logger.error(f"response: {resp=}")

    logger.error("process completed.")
    return jsonify(dataclasses.asdict(resp))


if __name__ == "__main__":
    app.run()
