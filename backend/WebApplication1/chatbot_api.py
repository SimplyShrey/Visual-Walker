from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os
import pandas as pd
from io import BytesIO
import datetime

app = Flask(__name__)
CORS(app) 

# Global variable for current dataset
current_df = None

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))  # Fix: Correct API setup
model = genai.GenerativeModel('gemini-2.5-flash')

def chatWithAI(user_message, system_prompt):
    try:
        prompt = f"{system_prompt}\n\nUser: {user_message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
    
@app.route("/api/load-data",methods=["POST"])
def load_data():
    global current_df
    try:
        if request.is_json:
            data = request.get_json()
            dataset_name = data.get('datasetName')

            if not dataset_name:
                return jsonify({'error': 'No dataset name provided'}), 400

            import glob
            file_pattern = f'uploads/*{dataset_name}.xlsx'
            matching_files = glob.glob(file_pattern)

            if not matching_files:
                return jsonify({'error': 'Dataset not found'}), 404
            
            file_path = matching_files[0]
            current_df = pd.read_excel(file_path)

            return jsonify({
                'message': f'Dataset {dataset_name} loaded successfully',
                'columns': current_df.columns.tolist(),
                'rows': len(current_df)
            })
        
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
            elif file.filename.endswith('.csv'):
                current_df = pd.read_csv(file)
            elif file.filename.endswith('.xlsx'):
                current_df = pd.read_excel(file)
            else:
                return jsonify({"error": "Unsupported file type"}), 400
            
            return jsonify({
                "columns": current_df.columns.tolist(),
                "numRows": len(current_df)
            })
        return jsonify({"error": "No file or dataset name provided"}), 400
    
    except Exception as e:
        print(f'Load error: {str(e)}')
        return jsonify({"error": str(e)}), 500

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    try:
        data = request.get_json() or {}
        user_message = data.get("message", "")
        columns = data.get("columns", [])

        if current_df is not None:
            columns = current_df.columns.tolist()

        system_prompt = f"""You are a data analysis assistant. 
            The user has loaded a dataset with these columns: {columns}.
            Help them analyze their data, create visualizations, and answer questions about their dataset, especially those related to utilization, shipments, costs and production.
            Keep responses concise and helpful. Use plain text without markdown formatting like ** or *."""

        messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
        ]

        reply =chatWithAI(user_message, system_prompt)

        return jsonify({
            "reply": reply,
            "fieldMappings": None,
            "data": []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(port=5000, debug=True)
