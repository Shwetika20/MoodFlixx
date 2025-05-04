from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import ast
import faiss
import string
import os
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
import google.generativeai as genai

# Setup Flask app
app = Flask(__name__)
CORS(app)

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Configure Gemini using environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini = genai.GenerativeModel("gemini-1.5-flash")

# Helper function to normalize text
def normalize_text(text):
    return ''.join([c.lower() for c in text if c not in string.punctuation])

# Safe parsing for CSV strings containing Python lists
def safe_parse_movies(x):
    try:
        value = ast.literal_eval(x)
        return value if isinstance(value, list) else [value]
    except (ValueError, SyntaxError):
        return [x.strip()] if isinstance(x, str) else []

# Load movie dataset
df = pd.read_csv(r'C:\Users\THARUN CHANDA\Desktop\MoodStart\backend\movies_with_curated_subgenres1.csv')
df = df.drop_duplicates(subset='overview').reset_index(drop=True)
df['overview'] = df['overview'].fillna('').apply(normalize_text)
df['genre'] = df['genre'].fillna('').str.lower()
df['subgenre'] = df['subgenre'].fillna('').str.lower()
df['movie_name'] = df['movie_name'].fillna('').str.lower()

# Load user data
user_df = pd.read_csv(r'C:\Users\THARUN CHANDA\Desktop\MoodStart\backend\movies_with_curated_subgenres.csv')
user_df['movie_name'] = user_df['movie_name'].apply(safe_parse_movies)


# Prepare FAISS index
embeddings = model.encode(df['overview'].tolist(), show_progress_bar=True)
embeddings = normalize(np.array(embeddings))

dimension = embeddings.shape[1]
faiss_index = faiss.IndexFlatIP(dimension)
faiss_index.add(embeddings)

# Endpoint for RAG-based user profile and recommendations
@app.route('/rag-profile/<user_id>', methods=['GET'])
def rag_profile(user_id):
    user_row = user_df[user_df['user_id'] == user_id]
    if user_row.empty:
        return jsonify({'error': 'User not found'}), 404

    watched_titles = [title.strip().lower() for title in user_row.iloc[0]['watched_titles']]
    watched_movies = df[df['movie_name'].isin(watched_titles)]

    if watched_movies.empty:
        return jsonify({'error': 'No matching watched movies found in dataset'}), 400

    subgenres = watched_movies['subgenre'].dropna().tolist()
    subgenre_counts = pd.Series(subgenres).value_counts().to_dict()
    top_subgenres = list(subgenre_counts.keys())[:2]

    retrieved = df[df['subgenre'].isin(top_subgenres)].drop_duplicates('movie_name').head(5)

    prompt = f"""
    User ID: {user_id}
    Watched movies: {', '.join(watched_titles)}
    Frequent subgenres: {', '.join([f"{sg} ({subgenre_counts[sg]})" for sg in top_subgenres])}

    Based on the above viewing history, generate a profile summary of the user’s movie preferences and recommend 3 new subgenres they may enjoy. Use the following candidate movies as context: {retrieved['movie_name'].tolist()}
    """

    try:
        response = gemini.generate_content(prompt)
        summary = response.text.strip()
    except Exception as e:
        summary = f"Error generating RAG summary: {e}"

    return jsonify({
        'user_id': user_id,
        'watched_movies': watched_titles,
        'top_subgenres': subgenre_counts,
        'rag_summary': summary
    })

# Correct main entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
