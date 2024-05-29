import os
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify
from message import send_message
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="aiFirstResponders")

UPLOAD_FOLDER = "uploads"
model = YOLO("./fire_detection_ai/models/best.pt")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)


def get_highest_count() -> int:
    highest = 0
    for file in os.listdir(UPLOAD_FOLDER):
        number = int(file.split("_")[1].split(".")[0])
        if number > highest:
            highest = number
    return highest


image_counter = get_highest_count()


@app.route("/upload", methods=["POST"])
def upload_image():
    try:
        global image_counter
        data = request.json
        
        location = data.get("location")
        image_data_base64 = data.get("image")
        
        latitude = location.get("coords").get("latitude")
        longtitude = location.get("coords").get("longitude")
        
        retrieved_location = geolocator.reverse(f"{latitude}, {longtitude}")

        image_data_binary = base64.b64decode(image_data_base64)

        image_counter += 1

        filename = f"image_{image_counter}.jpg"

        with open(os.path.join(UPLOAD_FOLDER, filename), "wb") as f:
            f.write(image_data_binary)

        results = model.predict(source=os.path.join(UPLOAD_FOLDER, filename), save=True)
        result = results[0]

        if result:
            send_message(f"Fire has been detected at {retrieved_location.address}")
            return jsonify(
                {
                    "message": "Fire has been detected, emergency services has been contacted."
                }
            )
        else:
            return jsonify({"message: ": "No fire detected."})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
