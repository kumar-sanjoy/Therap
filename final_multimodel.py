from google import genai
from google.genai import types

API_KEY = "AIzaSyAs7UgVA0lNQsE1okmgxiTEeNwbCnY3TS8"
client = genai.Client(api_key=API_KEY)

def extract_text_from_inputs(text: str = None, image_bytes: bytes = None, audio_bytes: bytes = None) -> str:
    """
    Extracts:
    - Direct text (if provided)
    - Text from an image (OCR)
    - Transcription from audio bytes
    """
    extracted_texts = []

    
    if text:
        extracted_texts.append(text.strip())

    
    if image_bytes:
        try:
            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    image_part,
                    "Extract all readable text from this image."
                ]
            )
            if response.text:
                extracted_texts.append(response.text.strip())
        except Exception as e:
            raise Exception(f"Image OCR failed: {e}") from e

    
    if audio_bytes:
        try:
            audio_part = types.Part.from_bytes(data=audio_bytes, mime_type="audio/m4a")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    audio_part,
                    "Transcribe this audio into text."
                ]
            )
            if response.text:
                extracted_texts.append(response.text.strip())
        except Exception as e:
            raise Exception(f"Audio transcription failed: {e}") from e

    return "\n".join(extracted_texts) if extracted_texts else ""


"""if __name__ == "__main__":
    
    text_doubt = "Explain Newton's second law."

    # Example image path
    image_path = "C:\\Users\\soura\\OneDrive\\Documents\\javafest\\78891c9e-a5e8-46b2-aab7-2b658f76ab76.jpg"
    image_bytes = None
    try:
        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()
            print(f"Loaded image ({len(image_bytes)} bytes)")
    except FileNotFoundError:
        print(f"Image file not found at {image_path}")

    # Example audio path (optional)
    audio_path = r"C:\Users\soura\OneDrive\Documents\javafest\Recording (2).m4a"
    audio_bytes = None
    try:
        with open(audio_path, "rb") as aud_file:
            audio_bytes = aud_file.read()
            print(f"Loaded audio ({len(audio_bytes)} bytes)")
    except FileNotFoundError:
        print(f"Audio file not found at {audio_path}")

    # Run extraction
    try:
        result = extract_text_from_inputs(
            text=text_doubt,
            image_bytes=image_bytes,
            audio_bytes=audio_bytes
        )
        print(result)
    except Exception as e:
        print("Error:", e)"""
