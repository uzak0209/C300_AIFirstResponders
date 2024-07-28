import os

# Directory containing the text files
directory = "E:\\Default_Apps\\Downloads\\02 Combined Dataset [Reformatted]\\labels"

# Iterate through each file in the directory
for filename in os.listdir(directory):
    if filename.endswith(".txt"):
        file_path = os.path.join(directory, filename)
        
        # Read from the file
        with open(file_path, 'r') as file:
            lines = file.readlines()

        # Process each line
        modified_lines = []
        for line in lines:
            # Split the line into parts based on spaces
            parts = line.strip().split()

            # Replace the first number with 0
            if parts:
                parts[0] = '0'

            # Join the parts back into a single string
            modified_line = ' '.join(parts)
            modified_lines.append(modified_line)

        # Write back to the file
        with open(file_path, 'w') as file:
            file.write('\n'.join(modified_lines))

        print(f"Modified {filename}. {parts} -> {modified_lines}")
