from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import os

# === CONFIGURATION ===
MODEL_NAME = 'all-MiniLM-L6-v2'
DATA_PATH = r'C:\Users\THARUN CHANDA\Desktop\MoodStart\backend\movies_with_curated_subgenres1.csv'
TOP_K = 5  # Number of recommendations to return

# === INITIALIZE FLASK APP ===
app = Flask(__name__)
CORS(app)

# === LOAD DATA AND MODEL ===
print("Loading data and model...")
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["overview"]).reset_index(drop=True)

model = SentenceTransformer(MODEL_NAME)

# === ENCODE MOVIE OVERVIEWS ===
print("Encoding movie overviews...")
corpus_embeddings = model.encode(df["overview"].tolist(), show_progress_bar=True)
corpus_embeddings = np.array(corpus_embeddings).astype("float32")

# === BUILD FAISS INDEX ===
index = faiss.IndexFlatL2(corpus_embeddings.shape[1])
index.add(corpus_embeddings)
print(f"FAISS index built with {index.ntotal} vectors.")

# === API ROUTE FOR SEARCH ===
@app.route('/recommend', methods=['POST'])
def recommend_movies():
    data = request.json
    input_movie = data.get("movie_name", "")
    input_genre = data.get("genre", "")
    input_overview = data.get("overview", "")

    if not input_overview:
        return jsonify({"error": "Overview is required"}), 400

    # Embed the input overview
    input_embedding = model.encode([input_overview])
    input_embedding = np.array(input_embedding).astype("float32")

    # Search FAISS index
    D, I = index.search(input_embedding, TOP_K)

    # Fetch matched movies
    results = []
    for idx in I[0]:
        results.append({
            "movie_name": df.iloc[idx]["movie_name"] if "movie_name" in df.columns else "",
            "genre": df.iloc[idx]["genre"] if "genre" in df.columns else "",
            "overview": df.iloc[idx]["overview"]
        })

    return jsonify({"input": data, "recommendations": results})

# === RUN APP ===
if __name__ == '__main__':
    app.run(debug=True, port=5004)
