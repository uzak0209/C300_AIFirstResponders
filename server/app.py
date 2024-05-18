import os
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify

app = Flask(__name__)

image_counter = 0

model = YOLO("../models/best.pt")

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/upload", methods=["POST"])
def upload_image():
    try:
        global image_counter  # Use the global image_counter variable
        data = request.json
        image_data_base64 = data.get("image")

        # Decode base64 string to binary
        image_data_binary = base64.b64decode(image_data_base64)

        # Increment image counter
        image_counter += 1

        # Generate a unique filename using the image counter
        filename = f"image_{image_counter}.jpg"

        # Save the image to disk
        with open(os.path.join(UPLOAD_FOLDER, filename), "wb") as f:
            f.write(image_data_binary)

        results = model.predict(source="../../uploads", conf=0.5, save=True)
        result = results[0]

        if result:
            return jsonify(
                {
                    "message": "Fire has been detected, emergency services has been contacted."
                }
            )
        else:
            return jsonify({"message: ": "No fire detected."})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/test_post", methods=["POST"])
def test_post():
    print("testing POST method")
    return {"message: ": "Test successful!"}


@app.route("/test_get", methods=["GET"])
def test_get():
    print("testing GET method")
    return {"message: ": "Got test message!"}


if __name__ == "__main__":
    app.run(debug=True)
