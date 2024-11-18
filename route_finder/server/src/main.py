from flask import Flask, send_from_directory, request, jsonify

app = Flask(__name__, static_folder="dist", static_url_path="")


@app.route("/")
def server():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/search")
def search():
    query = request.args.get("q")
    start_location = request.args.get("s")
    end_location = request.args.get("e")
    # TODO: Define response format clearly.
    # TODO: Return mock data.
    return jsonify({"message": "Hello, World!"})


if __name__ == "__main__":
    app.run()
