import os

def rename_files(images_folder, labels_folder, prefix='image'):
    # Get list of all files in both folders
    images_files = sorted(os.listdir(images_folder))
    
    index = 1
    for image_old_name in images_files:
        # Construct the corresponding label file name
        base_name = os.path.splitext(os.path.basename(image_old_name))[0]
        
        label_old_name = f"{base_name}.txt"
        
        image_old_path = os.path.join(images_folder, image_old_name)
        label_old_path = os.path.join(labels_folder, label_old_name)
        
        # Check if the label file exists
        if os.path.exists(label_old_path):
            # Construct new names
            new_base_name = f"{prefix}_{index:04d}"
            image_ext = os.path.splitext(image_old_name)[-1]
            label_ext = os.path.splitext(label_old_name)[-1]
            
            image_new_name = f"{new_base_name}{image_ext}"
            label_new_name = f"{new_base_name}{label_ext}"
            
            image_new_path = os.path.join(images_folder, image_new_name)
            label_new_path = os.path.join(labels_folder, label_new_name)
            
            # Rename the files
            os.rename(image_old_path, image_new_path)
            os.rename(label_old_path, label_new_path)
            print(f"Renamed: {image_old_name} -> {image_new_name}")
            print(f"Renamed: {label_old_name} -> {label_new_name}")
            
            index += 1
    

# Specify the paths to your images and labels folders
images_folder = "E:\\Default_Apps\\Downloads\\Combined Dataset\\images"
labels_folder = "E:\\Default_Apps\\Downloads\\Combined Dataset\\labels"

rename_files(images_folder, labels_folder)