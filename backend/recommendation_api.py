from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Load dataset and model once
df = pd.read_csv('IMDB-Movie-Dataset(2023-1951).csv')
model = SentenceTransformer('all-MiniLM-L6-v2')

# Precompute embeddings
df['embedding'] = df['overview'].apply(lambda x: model.encode(str(x)))

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    query_plot = data['plot']
    
    # Generate query embedding
    query_emb = model.encode([query_plot])
    
    # Calculate similarities
    embeddings = np.stack(df['embedding'].values)
    sims = cosine_similarity(query_emb, embeddings)[0]
    
    # Get top 5 results
    top_indices = np.argsort(sims)[-5:][::-1]
    results = df.iloc[top_indices][['movie_name', 'overview', 'genre']]
    results['similarity'] = sims[top_indices]
    
    return jsonify(results.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
