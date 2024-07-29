import os
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify
from message import *
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="aiFirstResponders")

UPLOAD_FOLDER = "uploads"
fire_model = YOLO("./fire_detection_ai/models/fire_best.pt")
dustbin_model = YOLO("./fire_detection_ai/models/dustbin_best.pt")
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
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.7)
yolo_model = YOLO("./pose_detection_ai/runs/pose/pose_train/weights/best.pt")


@app.route("/video_feed", methods=["POST"])
def video_feed():
    try:
        data = request.json
        image_data = data.get("image")

        if image_data:
            # Decode image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))

            # Convert PIL Image to NumPy array
            image_np = np.array(image)

            # Convert RGB image to BGR for OpenCV
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

            # Make pose detection
            results = pose.process(image_bgr)
            print("Pose detection results:", results)

            # Make YOLO detection
            yolo_results = yolo_model(image_bgr)[0]
            print("YOLO detection results:", yolo_results)

            # Render pose detections
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    image_bgr,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(
                        color=(245, 117, 66), thickness=20, circle_radius=20
                    ),
                    mp_drawing.DrawingSpec(
                        color=(245, 66, 230), thickness=20, circle_radius=20
                    ),
                )
            else:
                print("No pose landmarks detected.")

            # Render YOLO detections
            for result in yolo_results.boxes:
                bbox = result.xyxy[0]
                cv2.rectangle(
                    image_bgr,
                    (int(bbox[0]), int(bbox[1])),
                    (int(bbox[2]), int(bbox[3])),
                    (0, 255, 0),
                    2,
                )

            # Convert BGR image back to RGB for PIL
            image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

            # Convert NumPy array back to PIL Image
            processed_image = Image.fromarray(image_rgb)

            # Encode image
            buffered = io.BytesIO()
            processed_image.save(buffered, format="JPEG")
            frame = base64.b64encode(buffered.getvalue()).decode("utf-8")

            return jsonify({"status": "success", "image": frame}), 200

        return jsonify({"status": "error", "message": "No image data received"}), 400
    except Exception as e:
        print("Error processing video feed:", str(e))
        return jsonify({"status": "error", "message": "Internal server error"}), 500


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

    results_fire = fire_model.predict(
        source=os.path.join(UPLOAD_FOLDER, filename), save=True, conf=.5
    )
    results_dustbin = dustbin_model.predict(
        source=os.path.join(UPLOAD_FOLDER, filename), save=True
    )
    result_fire = results_fire[0]
    result_dustbin = results_dustbin[0]
    
    if result_dustbin:
        print("Dustbin fire")
        send_message(f"A dustbin fire has been detected at {retrieved_location.address}")
        send_location(latitude, longtitude)
        return jsonify({"message": "Dustbin fire has been detected, , emergency services has been contacted. Please stay clear."}), 200
    elif result_fire:
        print("Fire detected")
        send_message(f"A fire has been detected at {retrieved_location.address}")
        send_location(latitude, longtitude)
        return jsonify({"message": "Fire has been detected, emergency services has been contacted. Please move to a safe distance"}), 200
    else:
        return jsonify({"message": "No fire detected."}), 200

    if result_fire:
        send_message(f"Fire has been detected at {retrieved_location.address}")
        send_location(latitude, longtitude)
        return (
            jsonify(
                {
                    "message": "Fire has been detected, emergency services has been contacted."
                }
            ),
            200,
        )
        


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

        results = aed_model.predict(
            source=os.path.join(UPLOAD_FOLDER, filename), save=True, conf=0.65
        )
        result = results[0]

        if result:
            return jsonify({"message": "AED detected"}), 200
        else:
            return jsonify({"message": "No AED detected"}), 200
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
