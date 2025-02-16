import os
import librosa
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# Set dataset directory (Update this path to your dataset)
DATA_DIR = "../data/dataset/dataset"
audio_files = os.listdir(DATA_DIR)

# Define categories (Labels)
emission_context = {'F': 'Waiting For Food', 'I': 'Isolated in Unfamiliar Environment', 'B': 'Brushing'}

# Function to preprocess audio
def cleanse_audio(file_path, target_sample_rate=16000):
    data, sr = librosa.load(file_path, sr=None)
    data, _ = librosa.effects.trim(data)  # Trim silence
    if sr != target_sample_rate:
        data = librosa.resample(data, orig_sr=sr, target_sr=target_sample_rate)  # Resample
    data = librosa.util.normalize(data)  # Normalize
    return data, target_sample_rate

# Function to extract audio features
def extract_features(file_path, target_sample_rate=16000):
    data, sr = cleanse_audio(file_path, target_sample_rate)

    # Compute Features
    mfccs = librosa.feature.mfcc(y=data, sr=sr, n_mfcc=13).mean(axis=1)
    chroma = librosa.feature.chroma_stft(y=data, sr=sr).mean(axis=1)
    spectral_contrast = librosa.feature.spectral_contrast(y=data, sr=sr).mean(axis=1)

    # Combine into feature array
    return np.hstack([mfccs, chroma, spectral_contrast])

# Process dataset and extract features
data = []
labels = []

for file in audio_files:
    split = file.split('_')
    if split[0] in emission_context:
        file_path = os.path.join(DATA_DIR, file)
        features = extract_features(file_path)
        data.append(features)
        labels.append(split[0])  # 'F', 'I', or 'B'

# Convert to NumPy arrays
X = np.array(data)
y = np.array(labels)

# Split dataset into Train and Test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Normalize features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train Random Forest Classifier
context_clf = RandomForestClassifier(n_estimators=100, random_state=42)
context_clf.fit(X_train, y_train)

# Evaluate model
y_pred = context_clf.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))

# Save trained model and scaler
joblib.dump(context_clf, "cat_meow_classifier.pkl")
joblib.dump(scaler, "scaler.pkl")

print("Model and scaler saved successfully!")
