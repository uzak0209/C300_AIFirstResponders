from ultralytics import YOLO
import yaml
import os

# Load the YOLO model
model = YOLO("models/yolov8m-pose.pt")

# Debug: Print out some data information
print("Loading data from dataset.yaml")
dataset_yaml_path = r"C:\Users\22017111\OneDrive - Republic Polytechnic\c290\C300_AIFirstResponders\server\pose_detection_ai\datasets\dataset.yaml"
with open(dataset_yaml_path, 'r') as file:
    data = yaml.safe_load(file)
    print("Dataset Information:", data)

# Check if image and label directories contain files
base_path = r"C:\Users\22017111\OneDrive - Republic Polytechnic\c290\C300_AIFirstResponders\server\pose_detection_ai\datasets"
for split in ['train', 'valid', 'test']:
    image_dir = os.path.join(base_path, split, "image")
    label_dir = os.path.join(base_path, split, "labels")
    print(f"Checking paths: {image_dir}, {label_dir}")  # Debugging print statements
    images = os.listdir(image_dir)
    labels = os.listdir(label_dir)
    print(f"{split.capitalize()} set: {len(images)} images, {len(labels)} labels")

    if len(images) == 0 or len(labels) == 0:
        raise ValueError(f"{split.capitalize()} set contains no images or labels.")

# Train the model
try:
    model.train(
        task="detect",
        mode="train",
        data=dataset_yaml_path,  # Path to the updated dataset YAML file
        epochs=100,
        imgsz=640,
        device=0,
        patience=0,
        # resume=True
    )
except RuntimeError as e:
    print("RuntimeError during training:", e)
