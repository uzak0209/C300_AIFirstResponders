import os
import random
import shutil

def split_and_move_files(images_folder, labels_folder, output_folder):
    # Create train, test, and valid directories
    folders = ['train', 'test', 'valid']
    for folder in folders:
        os.makedirs(os.path.join(output_folder, folder, 'images'), exist_ok=True)
        os.makedirs(os.path.join(output_folder, folder, 'labels'), exist_ok=True)
    
    # Get list of all files in both folders
    images_files = sorted(os.listdir(images_folder))
    labels_files = sorted(os.listdir(labels_folder))
    
    # Create a dictionary to map base names to their full filenames
    images_dict = {}
    labels_dict = {}

    for f in images_files:
        base_name = os.path.splitext(os.path.basename(f))[0]
        images_dict[base_name] = f
    
    for f in labels_files:
        base_name = os.path.splitext(os.path.basename(f))[0]
        labels_dict[base_name] = f
    
    # Find common base names
    common_base_names = set(images_dict.keys()).intersection(labels_dict.keys())
    
    # Shuffle the common base names to distribute randomly
    common_base_names = list(common_base_names)
    random.shuffle(common_base_names)
    
    # Calculate number of files for each split
    num_files = len(common_base_names)
    num_train = int(0.7 * num_files)
    num_test = int(0.2 * num_files)
    num_valid = num_files - num_train - num_test
    
    index = 0
    for base_name in common_base_names:
        image_file = images_dict[base_name]
        label_file = labels_dict[base_name]
        
        # Determine destination folder based on index
        if index < num_train:
            destination_set = 'train'
        elif index < num_train + num_test:
            destination_set = 'test'
        else:
            destination_set = 'valid'
        
        # Paths for destination folders
        dest_image_folder = os.path.join(output_folder, destination_set, 'images')
        dest_label_folder = os.path.join(output_folder, destination_set, 'labels')
        
        # Move image and label files to the destination folder
        shutil.move(os.path.join(images_folder, image_file), os.path.join(dest_image_folder, image_file))
        shutil.move(os.path.join(labels_folder, label_file), os.path.join(dest_label_folder, label_file))
        
        print(f"Moved: {image_file} and {label_file} -> {dest_image_folder, dest_label_folder}")
        
        index += 1

# Specify the paths to your renamed images and labels folders
images_folder = "E:\\Default_Apps\\Downloads\\02 Combined Dataset [Reformatted]\\images"
labels_folder = "E:\\Default_Apps\\Downloads\\02 Combined Dataset [Reformatted]\\labels"

# Specify the output folder where train, test, and valid folders will be created
output_folder = "E:\\Default_Apps\\Downloads\\03 Combined Dataset [Splitted]"

split_and_move_files(images_folder, labels_folder, output_folder)
