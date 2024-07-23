import os
import yt_dlp as youtube_dl
import cv2

def download_youtube_video(url, output_path):
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    
    ydl_opts = {
        'format': 'best',
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
    }
    
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        video_path = ydl.prepare_filename(info_dict)
    
    print(f'Downloaded video to {video_path}')
    return video_path

def extract_frames(video_path, output_folder, segments):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    def get_frame_number(time):
        return int(time * fps)
    
    extracted_count = 0
    
    for (start_time, end_time) in segments:
        start_frame = get_frame_number(start_time)
        end_frame = get_frame_number(end_time)
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        frame_number = start_frame
        while cap.isOpened() and frame_number <= end_frame:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_filename = os.path.join(output_folder, f'frame_{extracted_count}.jpg')
            cv2.imwrite(frame_filename, frame)
            extracted_count += 1
            
            frame_number += 1
    
    cap.release()
    print(f'Extracted {extracted_count} frames from the specified segments.')

# Example usage
video_url = "https://www.youtube.com/watch?v=bYoLl348f-Y"
output_directory = 'E:\\Default_Apps\\Desktop\\Development\\_School\\FYP\\C300_AIFirstResponders\\server\\videos'
segments = [
    (5, 35),  # Start at 10 seconds, end at 20 seconds
    (56, 62),  # Start at 45 seconds, end at 60 seconds
    (70, 76),
    (175, 185)
]

video_path = download_youtube_video(video_url, output_directory)
extract_frames(video_path, os.path.join(output_directory, 'frames'), segments)
