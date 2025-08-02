import os
import tempfile
import google.generativeai as genai

def transcribe_audio_with_gemini(api_key: str, file_obj) -> str:
    
    client = genai.Client(api_key=api_key)

    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file_obj.read())
        tmp_path = tmp.name

    try:
        
        audio_file = genai.files.upload(
            file=tmp_path,
            display_name=os.path.basename(tmp_path)
        )

        
        prompt = "Generate a transcript of the speech."

        
        response = genai.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                {"file_data": {"file_uri": audio_file.uri}}
            ]
        )

        
        genai.files.delete(name=audio_file.name)

        
        os.remove(tmp_path)

        
        if response.text:
            return response.text.strip()
        else:
            raise ValueError("API returned an empty or invalid response.")

    except Exception as e:
        
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise Exception(f"An error occurred during API call: {e}") from e
