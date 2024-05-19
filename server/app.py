import os
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify


UPLOAD_FOLDER = "uploads"
model = YOLO("../models/best.pt")

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
        image_data_base64 = data.get("image")

        image_data_binary = base64.b64decode(image_data_base64)

        image_counter += 1
        
        filename = f"image_{image_counter}.jpg"
        
        with open(os.path.join(UPLOAD_FOLDER, filename), "wb") as f:
            print(f"saving image {filename=}")
            f.write(image_data_binary)

        results = model.predict(source=os.path.join(UPLOAD_FOLDER, filename), save=True)
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
