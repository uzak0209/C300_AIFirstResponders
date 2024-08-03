import os
import base64
import io
import cv2
import numpy as np
import math
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from PIL import Image
from geopy.geocoders import Nominatim
from ultralytics import YOLO
from message import *

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

UPLOAD_FOLDER = "uploads"
geolocator = Nominatim(user_agent="aiFirstResponders")

fire_model = YOLO("./fire_detection_ai/models/fire_best.pt")
dustbin_model = YOLO("./fire_detection_ai/models/dustbin_best.pt")
aed_model = YOLO("./aed_ai/runs/detect/train2/weights/best.pt")
yolo_model = YOLO("./pose_detection_ai/models/yolov8m-pose.pt")

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.7)

def calculate_angle(a, b, c):
    """ Calculate the angle between three points. """
    a = np.array(a)  # First point
    b = np.array(b)  # Mid point
    c = np.array(c)  # End point
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360.0 - angle
        
    return angle

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

            # Initialize flags for squatting and bending arms
            is_squatting = False
            is_bending_arms = False

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
                
                # Calculate angles for specific landmarks
                landmarks = results.pose_landmarks.landmark
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

                # Calculate angles
                knee_angle = calculate_angle(hip, knee, ankle)
                elbow_angle = calculate_angle(shoulder, elbow, wrist)

                # Check if squatting (knee angle < threshold)
                if knee_angle < 90:
                    is_squatting = True

                # Check if bending arms (elbow angle > threshold)
                if elbow_angle > 160:
                    is_bending_arms = True

                # Draw angles on the image
                cv2.putText(image_bgr, f'Knee Angle: {int(knee_angle)}', 
                            tuple(np.multiply(knee, [image_bgr.shape[1], image_bgr.shape[0]]).astype(int)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                           )
                cv2.putText(image_bgr, f'Elbow Angle: {int(elbow_angle)}', 
                            tuple(np.multiply(elbow, [image_bgr.shape[1], image_bgr.shape[0]]).astype(int)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                           )

                if is_squatting:
                    cv2.putText(image_bgr, 'Squatting: TRUE', (10, 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                else:
                    cv2.putText(image_bgr, 'Squatting: FALSE', (10, 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

                if is_bending_arms:
                    cv2.putText(image_bgr, 'Bending Arms: TRUE', (10, 70), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                else:
                    cv2.putText(image_bgr, 'Bending Arms: FALSE', (10, 70), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

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

            return jsonify({"status": "success", "image": frame, "squatting": is_squatting, "bending_arms": is_bending_arms}), 200

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
    longitude = location.get("coords").get("longitude")

    retrieved_location = geolocator.reverse(f"{latitude}, {longitude}")

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
        send_location(latitude, longitude)
        return jsonify({"message": "Dustbin fire has been detected, emergency services have been contacted. Please stay clear."}), 200
    elif result_fire:
        print("Fire detected")
        send_message(f"A fire has been detected at {retrieved_location.address}")
        send_location(latitude, longitude)
        return jsonify({"message": "Fire has been detected, emergency services have been contacted. Please move to a safe distance."}), 200
    else:
        return jsonify({"message": "No fire detected."}), 200
    
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
