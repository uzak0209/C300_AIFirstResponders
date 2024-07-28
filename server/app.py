# import os
# import base64
# import io
# import cv2
# import numpy as np
# import mediapipe as mp
# from flask import Flask, request, jsonify
# from flask_socketio import SocketIO, emit
# from PIL import Image
# from ultralytics import YOLO  # Import YOLO

# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# mp_drawing = mp.solutions.drawing_utils
# mp_pose = mp.solutions.pose

# # Setup Mediapipe instance
# pose = mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.7)
# # Load YOLO model
# yolo_model = YOLO('yolov8m-pose.pt')

# @app.route('/video_feed', methods=['POST'])
# def video_feed():
#     try:
#         data = request.json
#         image_data = data.get('image')

#         if image_data:
#             # Decode image
#             image_bytes = base64.b64decode(image_data)
#             image = Image.open(io.BytesIO(image_bytes))

#             # Convert PIL Image to NumPy array
#             image_np = np.array(image)

#             # Convert RGB image to BGR for OpenCV
#             image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            
#             # Make pose detection
#             results = pose.process(image_bgr)
#             print("Pose detection results:", results)

#             # Make YOLO detection
#             yolo_results = yolo_model(image_bgr)[0]
#             print("YOLO detection results:", yolo_results)

#             # Render pose detections
#             if results.pose_landmarks:
#                 mp_drawing.draw_landmarks(
#                     image_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
#                     mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=20, circle_radius=20),
#                     mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=20, circle_radius=20)
#                 )
#             else:
#                 print("No pose landmarks detected.")

#             # Render YOLO detections
#             for result in yolo_results.boxes:
#                 bbox = result.xyxy[0]
#                 cv2.rectangle(image_bgr, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), (0, 255, 0), 2)

#             # Convert BGR image back to RGB for PIL
#             image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

#             # Convert NumPy array back to PIL Image
#             processed_image = Image.fromarray(image_rgb)

#             # Encode image
#             buffered = io.BytesIO()
#             processed_image.save(buffered, format="JPEG")
#             frame = base64.b64encode(buffered.getvalue()).decode('utf-8')

#             return jsonify({'status': 'success', 'image': frame}), 200

#         return jsonify({'status': 'error', 'message': 'No image data received'}), 400
#     except Exception as e:
#         print("Error processing video feed:", str(e))
#         return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

# if __name__ == '__main__':
#     socketio.run(app, host='0.0.0.0', port=5000, debug=True)



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
    try:
        data = request.json
        image_data = data.get('image')

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
                    image_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=20, circle_radius=20),
                    mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=20, circle_radius=20)
                )
            else:
                print("No pose landmarks detected.")

            # Render YOLO detections
            for result in yolo_results.boxes:
                bbox = result.xyxy[0]
                cv2.rectangle(image_bgr, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), (0, 255, 0), 2)

            # Convert BGR image back to RGB for PIL
            image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

            # Convert NumPy array back to PIL Image
            processed_image = Image.fromarray(image_rgb)

            # Encode image
            buffered = io.BytesIO()
            processed_image.save(buffered, format="JPEG")
            frame = base64.b64encode(buffered.getvalue()).decode('utf-8')

            return jsonify({'status': 'success', 'image': frame}), 200

        return jsonify({'status': 'error', 'message': 'No image data received'}), 400
    except Exception as e:
        print("Error processing video feed:", str(e))
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

