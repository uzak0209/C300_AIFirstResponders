import os
import numpy as np
import json

# Define the paths
annotations_dir = 'C:/Users/22017111/OneDrive - Republic Polytechnic/c290/C300_AIFirstResponders/server/pose_detection_ai/datasets/annotations'

# Define paths for each posture
squat_dir = os.path.join(annotations_dir, 'squat_labels')
correct_dir = os.path.join(annotations_dir, 'correct_labels')
bend_arms_dir = os.path.join(annotations_dir, 'bend_arms')

# Function to read YOLO annotation files and calculate bounding boxes for coordinates
def calculate_bounding_box_coordinates(label_path, image_width, image_height, indices):
    all_coordinates = []
    for file_name in os.listdir(label_path):
        if file_name.endswith('.txt'):
            with open(os.path.join(label_path, file_name), 'r') as f:
                for line in f.readlines():
                    parts = line.strip().split()
                    if len(parts) >= 17 * 2 + 1 and parts[0].isdigit():  # Ensure correct number of elements and the first part is a digit
                        try:
                            coordinates = []
                            for idx in indices:
                                x = float(parts[idx * 2 + 1]) * image_width
                                y = float(parts[idx * 2 + 2]) * image_height
                                coordinates.append([x, y])
                            all_coordinates.append(np.array(coordinates).flatten())
                        except ValueError as e:
                            print(f"Skipping invalid line in {file_name}: {line.strip()} - {e}")
                    else:
                        print(f"Skipping invalid line in {file_name}: {line.strip()}")
    if all_coordinates:
        all_coordinates = np.array(all_coordinates)
        min_coords = np.min(all_coordinates, axis=0)
        max_coords = np.max(all_coordinates, axis=0)
        return {'min': min_coords.tolist(), 'max': max_coords.tolist()}
    else:
        return {'min': [0] * (len(indices) * 2), 'max': [0] * (len(indices) * 2)}

# Image dimensions (adjust these values according to your dataset)
image_width = 640
image_height = 480

# Indices for different postures
bend_arms_indices = [6, 7, 8, 9, 10, 11]
squat_indices = [12, 13, 14, 15, 16, 17]
correct_indices = list(range(6, 18))  # Correct is a combination of indices 6-17

# Calculate bounding box coordinates for each category
bounding_box_bend_arms = calculate_bounding_box_coordinates(bend_arms_dir, image_width, image_height, bend_arms_indices)
bounding_box_squat = calculate_bounding_box_coordinates(squat_dir, image_width, image_height, squat_indices)
bounding_box_correct = calculate_bounding_box_coordinates(correct_dir, image_width, image_height, correct_indices)

# Print the bounding boxes for verification
print('Bounding Box Bend Arms:', bounding_box_bend_arms)
print('Bounding Box Squat:', bounding_box_squat)
print('Bounding Box Correct:', bounding_box_correct)

# Save the bounding boxes to a JSON file
bounding_boxes = {
    'bend_arms': bounding_box_bend_arms,
    'squat': bounding_box_squat,
    'correct': bounding_box_correct
}

# Ensure the path where you save the file is accessible by app.py
with open('C:/Users/22017111/OneDrive - Republic Polytechnic/c290/C300_AIFirstResponders/server/bounding_boxes.json', 'w') as f:
    json.dump(bounding_boxes, f)
