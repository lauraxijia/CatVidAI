import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from openai import OpenAI
import tensorflow as tf
import numpy as np
import librosa
import joblib
import io

# Initialize FastAPI app
app = FastAPI()

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
    'B': "Brushing"
}

def cleanse_audio(file_bytes, target_sample_rate=16000):
    """
    Cleans and processes audio file: resampling, trimming silence, and normalizing.
    """
    # Load audio from file bytes
    data, sr = librosa.load(io.BytesIO(file_bytes), sr=None)

    # Trim silence
    data, _ = librosa.effects.trim(data)

    # Resample if needed
    if sr != target_sample_rate:
        data = librosa.resample(data, orig_sr=sr, target_sr=target_sample_rate)
        sr = target_sample_rate

    # Normalize
    data = librosa.util.normalize(data)
    return data, sr

def extract_features(file_bytes, target_sample_rate=16000):
    """
    Extracts MFCC, Chroma, and Spectral Contrast features from audio.
    """
    # Clean and process the audio
    data, sr = cleanse_audio(file_bytes, target_sample_rate=target_sample_rate)

    # Extract features
    mfccs = librosa.feature.mfcc(y=data, sr=sr, n_mfcc=13).mean(axis=1)
    chroma = librosa.feature.chroma_stft(y=data, sr=sr).mean(axis=1)
    spectral_contrast = librosa.feature.spectral_contrast(y=data, sr=sr).mean(axis=1)

    # Combine into a single feature vector
    return np.hstack([mfccs, chroma, spectral_contrast])

@app.post("/analyze-cat-sound")
async def analyze_cat_sound(file: UploadFile = File(...)):
    """
    Receives an audio file and predicts whether the cat is meowing for food, isolation, or brushing.
    """
    try:
        # Read file content
        file_bytes = await file.read()
        
        # Extract features
        features = extract_features(file_bytes)

        # Scale features
        features = scaler.transform([features])

        # Predict category
        prediction = context_clf.predict(features)[0]

        # Map to label
        category = emission_labels.get(prediction, "Unknown")

        return {"cat_intent": category}
    
    except Exception as e:
        return {"error": str(e)}
