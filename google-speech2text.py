import os
import google.genai as genai
from google.generativeai.types import file_types

def transcribe_audio_with_gemini(api_key: str, audio_file_path: str) -> str:
    
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found at: {audio_file_path}")

    try:
        
        client = genai.Client(api_key=api_key)
        
        
        
        audio_file = client.files.upload(file=audio_file_path)
        

        
        prompt = "Generate a transcript of the speech."

        
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, audio_file]
        )

        
        client.files.delete(name=audio_file.name)
        
        
        if response.text:
            return response.text
        else:
            raise ValueError("API returned an empty or invalid response.")

    
    except Exception as e:
        raise Exception(f"An error occurred during API call: {e}") from e



if __name__ == "__main__":
    
    API_KEY = "AIzaSyAs7UgVA0lNQsE1okmgxiTEeNwbCnY3TS8" 
    
    
    dummy_file_path = r"C:\Users\soura\Documents\Sound Recordings\Recording.wav" 
    
    
    
    try:
        transcript = transcribe_audio_with_gemini(API_KEY, dummy_file_path)
        print(transcript)
    except (FileNotFoundError, ValueError, Exception) as e:
        print(f"An error occurred: {e}")
        
    
    