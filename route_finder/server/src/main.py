# Description: Main entry point for the server.

import dataclasses
from flask import Flask, send_from_directory, request, jsonify
from request_response_data import SearchRequest, Location
from mock_response import build_mock_response
from flask_cors import CORS


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
    query = request.args.get("q")
    start_location = request.args.get("s")
    end_location = request.args.get("e")
    app.logger.info(f"Query: {query}, Start: {start_location}, End: {end_location}")

    # Validate the request.
    if not query or not start_location or not end_location:
        return (
            jsonify({"error": "Missing query, start, or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    start_loc_obj = Location.from_str(start_location)
    end_loc_obj = Location.from_str(end_location)
    if not start_loc_obj or not end_loc_obj:
        return (
            jsonify({"error": "Invalid start or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    req = SearchRequest(query, start_loc_obj, end_loc_obj)
    if not req:
        return jsonify({"error": "Invalid request."}), _HTTP_400_BAD_REQUEST

    # Return the mock response for now.
    # TODO: Implement the actual search logic.
    resp = build_mock_response(req)
    return jsonify(dataclasses.asdict(resp))


if __name__ == "__main__":
    app.run()
