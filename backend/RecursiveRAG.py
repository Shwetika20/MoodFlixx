from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
import faiss
import os

app = Flask(__name__)
CORS(app)

class DynamicMovieRecommender:
    def _init_(self, data_path):
        """Initialize the movie recommender with data and models"""
        self.df = self._load_data(data_path)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self._prepare_embeddings()
        self._build_faiss_index()
        self.recommendation_history = set()
        self.current_context = None

    def _load_data(self, path):
        """Load and validate movie data from CSV"""
        df = pd.read_csv(r'C:\Users\THARUN CHANDA\Desktop\MoodStart\backend\movies_with_curated_subgenres1.csv')
        required_columns = {'movie_name', 'genre', 'overview'}
        if not required_columns.issubset(df.columns):
            raise ValueError(f"Missing columns: {required_columns - set(df.columns)}")
        return df

    def _prepare_embeddings(self):
        """Create semantic embeddings for each movie"""
        self.df['genre_overview'] = self.df['genre'] + " " + self.df['overview']
        raw_embeddings = self.model.encode(self.df['genre_overview'].tolist(), show_progress_bar=True)
        self.embeddings = normalize(np.array(raw_embeddings).astype('float32'))

    def _build_faiss_index(self):
        """Build FAISS index for efficient similarity search"""
        dim = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(self.embeddings)

    def start_session(self, initial_query):
        """Start new recommendation session"""
        self.current_context = self.model.encode([initial_query])
        self.current_context = normalize(self.current_context.astype('float32'))[0]
        self.recommendation_history = set()
        return self._get_recommendations()

    def next_recommendations(self, selected_movie_name):
        """Get next recommendations based on selection"""
        self.recommendation_history.add(selected_movie_name)
        selected_idx = self.df[self.df['movie_name'] == selected_movie_name].index[0]
        self.current_context = self.embeddings[selected_idx]
        return self._get_recommendations()

    def _get_recommendations(self, top_k=5):
        """Get recommendations from FAISS index"""
        distances, indices = self.index.search(
            np.array([self.current_context]).astype('float32'), 
            top_k + len(self.recommendation_history)
        )
        
        results = []
        for idx in indices[0]:
            movie = self.df.iloc[idx]
            if movie['movie_name'] not in self.recommendation_history:
                results.append({
                    'movie_name': movie['movie_name'],
                    'genre': movie['genre'],
                    'overview': movie['overview'],
                    'similarity': float(distances[0][idx])
                })
                if len(results) == top_k:
                    break
        return results

    def get_genres(self):
        """Get list of unique genres"""
        return sorted({g.strip() for genres in self.df['genre'] for g in genres.split(',')})

# Global recommender instance (in production use proper session management)
recommender = None

@app.route('/recommend', methods=['POST'])
def handle_recommend():
    global recommender
    data = request.json
    data_path = data.get('data_path')
    query = data.get('query')
    
    if not data_path or not query:
        return jsonify({'error': 'data_path and query are required'}), 400
    
    try:
        if not recommender:
            recommender = DynamicMovieRecommender(data_path)
        recommendations = recommender.start_session(query)
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/next', methods=['POST'])
def handle_next():
    global recommender
    data = request.json
    movie_name = data.get('movie_name')
    
    if not recommender:
        return jsonify({'error': 'Session not initialized'}), 400
    if not movie_name:
        return jsonify({'error': 'movie_name is required'}), 400
    
    try:
        recommendations = recommender.next_recommendations(movie_name)
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/genres', methods=['GET'])
def get_genres():
    global recommender
    if not recommender:
        return jsonify({'error': 'Recommender not initialized'}), 400
    try:
        return jsonify({'genres': recommender.get_genres()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/movie/<movie_name>', methods=['GET'])
def get_movie(movie_name):
    global recommender
    if not recommender:
        return jsonify({'error': 'Recommender not initialized'}), 400
    try:
        movie = recommender.df[recommender.df['movie_name'] == movie_name].iloc[0].to_dict()
        return jsonify(movie)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)