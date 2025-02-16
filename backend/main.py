import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
import tensorflow as tf
import numpy as np
import librosa
import joblib
import io
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uuid
import shutil
import base64
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import base64

# Initialize FastAPI app
app = FastAPI()
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change this in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


# Initialize OpenAI client
client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)

# Request model
class ImageRequest(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024
    num_inference_steps: int = 30
    negative_prompt: str = ""
    seed: int = -1

# API endpoint to generate an image
@app.post("/generate_image")
async def generate_image(request: ImageRequest):
    try:
        response = client.images.generate(
            model="stability-ai/sdxl",
            response_format="url",  # Request image as URL
            extra_body={
                "response_extension": "png",
                "width": request.width,
                "height": request.height,
                "num_inference_steps": request.num_inference_steps,
                "negative_prompt": request.negative_prompt,
                "seed": request.seed,
            },
            prompt=request.prompt
        )
        
        # Extract image URL (Fix: Directly access .data property)
        if not response or not response.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve image URL")

        return {"image_url": response.data[0].url}  # Fix: Access image URL correctly

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# Load pre-trained models
context_clf = joblib.load("cat_meow_classifier.pkl")  # Load emission context classifier
scaler = joblib.load("scaler.pkl")  # Load feature scaler

# Define possible categories
emission_labels = {
    'F': "Waiting For Food",
    'I': "Isolated in Unfamiliar Environment",
    'B': "What the heck is that?"
}


# Ensure temp directory exists
TEMP_DIR = os.path.abspath("temp_files")
os.makedirs(TEMP_DIR, exist_ok=True)

def extract_audio_from_video(video_path):
    """ Extracts audio from video and saves it as WAV file """
    audio_filename = f"temp_audio_{uuid.uuid4().hex}.wav"  # ✅ Uses uuid
    audio_path = os.path.join(TEMP_DIR, audio_filename)

    command = [
        "ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le",
        "-ar", "16000", "-ac", "1", audio_path, "-y"
    ]
    
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    # Debugging logs
    print("FFmpeg Output:", result.stdout)
    print("FFmpeg Error:", result.stderr)

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=500, detail=f"FFmpeg failed. Audio file not created: {result.stderr}")

    return audio_path

def cleanse_audio(file_path, target_sample_rate=16000):
    """ Cleans and normalizes audio """
    data, sr = librosa.load(file_path, sr=None)
    data, _ = librosa.effects.trim(data)  # Trim silence
    if sr != target_sample_rate:
        data = librosa.resample(data, orig_sr=sr, target_sr=target_sample_rate)
    data = librosa.util.normalize(data)  # Normalize
    return data, target_sample_rate

def extract_features(file_path, target_sample_rate=16000):
    """ Extracts MFCCs, Chroma, and Spectral Contrast from audio """
    data, sr = cleanse_audio(file_path, target_sample_rate)
    mfccs = librosa.feature.mfcc(y=data, sr=sr, n_mfcc=13).mean(axis=1)
    chroma = librosa.feature.chroma_stft(y=data, sr=sr).mean(axis=1)
    spectral_contrast = librosa.feature.spectral_contrast(y=data, sr=sr).mean(axis=1)
    return np.hstack([mfccs, chroma, spectral_contrast])

@app.post("/analyze-cat-sound")
async def analyze_cat_sound(file: UploadFile = File(...)):
    """ Handles video/audio file, extracts audio, and classifies cat meow """
    try:
        # Save uploaded file
        file_location = os.path.join(TEMP_DIR, file.filename)

        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # Check if it's a video or audio file
        if file.filename.endswith((".mp4", ".mov", ".avi")):
            audio_path = extract_audio_from_video(file_location)
        else:
            audio_path = file_location  # Directly use audio files

        # Extract features
        features = extract_features(audio_path)
        features = scaler.transform([features])

        # Predict cat intent
        prediction = context_clf.predict(features)[0]
        category = emission_labels.get(prediction, "Unknown")

        # Cleanup temporary files
        os.remove(file_location)
        if file.filename.endswith((".mp4", ".mov", ".avi")):
            os.remove(audio_path)

        return {"cat_intent": category}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


# Directory to store processed videos
VIDEO_DIR = "processed_videos"
os.makedirs(VIDEO_DIR, exist_ok=True)

@app.post("/process_video")
async def process_video(video: UploadFile = File(...)):
    """ Processes uploaded video and returns the processed video URL """
    try:
        video_filename = f"{uuid.uuid4().hex}_{video.filename}"
        video_path = os.path.join(VIDEO_DIR, video_filename)

        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        processed_video_url = f"http://localhost:8000/{VIDEO_DIR}/{video_filename}"

        return {"processed_video_url": processed_video_url}

    except Exception as e:
        return {"error": str(e)}

@app.get("/processed_videos/{filename}")
async def get_processed_video(filename: str):
    """ Serves processed videos """
    return FileResponse(os.path.join(VIDEO_DIR, filename))





# Directory to temporarily store images
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def encode_image_to_base64(image_path):
    """ Convert image to Base64 encoding """
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

@app.post("/process_image")
async def process_image(file: UploadFile = File(...)):
    """ Receives an image, processes it using Nebius AI, and returns only the AI-generated text description """
    try:
        # Save uploaded image
        image_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert image to Base64
        image_base64 = encode_image_to_base64(image_path)

        # Call Nebius AI
        response = client.chat.completions.create(
            model="llava-hf/llava-1.5-13b-hf",
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this image"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ]
        )

        # Cleanup uploaded file
        os.remove(image_path)

        # Extract and return only the AI-generated text description
        ai_text_response = response.choices[0].message.content

        return {"generated_text": ai_text_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
