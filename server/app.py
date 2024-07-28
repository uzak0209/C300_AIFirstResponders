import os
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify
from message import *
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="aiFirstResponders")

UPLOAD_FOLDER = "uploads"
model = YOLO("./fire_detection_ai/models/fire_best.pt")
aed_model = YOLO("./aed_ai/runs/detect/train2/weights/best.pt")

import os
import base64
import io
import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from PIL import Image
from ultralytics import YOLO  # Import YOLO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Setup Mediapipe instance
pose = mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.7)
# Load YOLO model
yolo_model = YOLO('C:/Users/22017111/OneDrive - Republic Polytechnic/c290/C300_AIFirstResponders/server/pose_detection_ai/runs/pose/train9/weights/best.pt')

@app.route('/video_feed', methods=['POST'])
def video_feed():
  
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

        results = model.predict(source=os.path.join(UPLOAD_FOLDER, filename), save=True, conf=0.7)
        result = results[0]

        if result:
            send_message(f"Fire has been detected at {retrieved_location.address}")
            send_location(latitude, longtitude)
            return jsonify(
                {
                    "message": "Fire has been detected, emergency services has been contacted."
                }
            ), 200
        else:
            return jsonify({"message": "No fire detected."}), 200
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/aed_detection", methods=["POST"])
def upload_aed_image():
    try:
        global image_counter
        data = request.json
        
        image_data_base64 = data.get("image")
        image_data_binary = base64.b64decode(image_data_base64)

        image_counter += 1
        filename = f"image_{image_counter}.jpg"

        with open(os.path.join(UPLOAD_FOLDER, filename), "wb") as f:
            f.write(image_data_binary)

        results = aed_model.predict(source=os.path.join(UPLOAD_FOLDER, filename), save=True, conf=0.65)
        result = results[0]

        if result:
            return jsonify({"message": "AED detected"}), 200
        else:
            return jsonify({"message": "No AED detected"}), 200
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
