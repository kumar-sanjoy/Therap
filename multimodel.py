import google.genai as genai

API_KEY = "AIzaSyAs7UgVA0lNQsE1okmgxiTEeNwbCnY3TS8"
client = genai.Client(api_key=API_KEY)

def extract_text_from_inputs(text: str = None, image_bytes: bytes = None, audio_bytes: bytes = None) -> str:
    
    extracted_texts = []

    
    if text:
        extracted_texts.append(text.strip())

    
    if image_bytes:
        try:
            image_file = client.files.upload_bytes(image_bytes, mime_type="image/jpeg")
            prompt = "Extract all readable text from this image."
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image_file],
            )
            client.files.delete(name=image_file.name)

            if response.text:
                extracted_texts.append(response.text.strip())
        except Exception as e:
            raise Exception(f"Image OCR failed: {e}") from e

    
    if audio_bytes:
        try:
            audio_file = client.files.upload_bytes(audio_bytes, mime_type="audio/m4a")
            prompt = "Transcribe this audio into text."
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, audio_file],
            )
            client.files.delete(name=audio_file.name)

            if response.text:
                extracted_texts.append(response.text.strip())
        except Exception as e:
            raise Exception(f"Audio transcription failed: {e}") from e

    
    if not extracted_texts:
        return ""
    return "\n".join(extracted_texts)



"""
final_doubt_text = extract_text_from_inputs(
    text=text_doubt,
    image_bytes=image_bytes,
    audio_bytes=audio_bytes
)
"""
