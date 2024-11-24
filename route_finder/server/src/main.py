# Description: Main entry point for the server.
import dataclasses
import json

from typing import Any

from flask import Flask, send_from_directory, request, jsonify
from request_response_data import SearchRequest, Location, SearchResponse
from mock_response import build_mock_response
from flask_cors import CORS

from server.add_explanation import add_explanation


app = Flask(__name__, static_folder="dist", static_url_path="")

if app.debug:
    # Allow CORS from the React app running in development mode.
    CORS(app)


_HTTP_400_BAD_REQUEST = 400


@app.route("/")
def server():
    """Serves the React files."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/search")
def search():
    """Search API endpoint."""
    query: str | None = request.args.get("q")
    start_location: str | None = request.args.get("s")
    end_location: str | None = request.args.get("e")
    app.logger.info(f"Query: {query}, Start: {start_location}, End: {end_location}")

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

    # get routes
    # TODO: call the sefa's function.
    data_geojson: Any = None

    # parse data to string
    data_geojson_str: str = json.dumps(data_geojson)

    # add explanation
    res = add_explanation(query, data_geojson_str)
    print(res)

    # Return the mock response for now.
    # TODO: Implement the actual search logic.
    resp: SearchResponse = build_mock_response(req)
    return jsonify(dataclasses.asdict(resp))


if __name__ == "__main__":
    app.run()
