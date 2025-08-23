import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image
import base64
from dotenv import load_dotenv
import json

# === LangChain & Pydantic Imports ===
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Configuration & Initialization ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)

model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    google_api_key=GOOGLE_API_KEY
)

# --- Utils ---
def pil_to_base64(image: Image.Image) -> str:
    """Convert a PIL image to a Base64 string."""
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def transcribe_with_gemini(filepath: str) -> str:
    """Send an audio file to the Gemini API and return the transcribed text."""
    audio_file = genai.upload_file(filepath)
    gen_model = genai.GenerativeModel("gemini-1.5-flash")
    
    response = gen_model.generate_content([
        audio_file,
        "Transcribe this audio into text (Bangla or English as spoken)."
    ])
    
    return response.text.strip()

# --- Pydantic Schema for Output ---
class DoubtResponse(BaseModel):
    """Schema for the doubt-solving response."""
    response: str = Field(description="A useful explanation in Bengali clearing the doubt of the student.")

# --- Flask Route for Doubt Solver ---
@app.route("/learn/doubts", methods=["POST"])
def doubtSolver():
    print("doubt hit")
    
    text_content = ""
    image_content = None
    audio_transcription = ""

    if not any([request.files.get("image"), request.form.get("question"), request.files.get("audio")]):
        return jsonify({"error": "No valid input provided"}), 400

    if "question" in request.form:
        text_content = request.form.get("question", "").strip()

    if "image" in request.files:
        image_file = request.files["image"]
        try:
            image_content = Image.open(image_file.stream)
            print("Received and processed image")
        except Exception as e:
            return jsonify({"error": f"Image processing failed: {e}"}), 500

    if "audio" in request.files:
        audio_file = request.files["audio"]
        filename = secure_filename(audio_file.filename)
        filepath = os.path.join("uploads", filename)
        os.makedirs("uploads", exist_ok=True)
        audio_file.save(filepath)
        try:
            audio_transcription = transcribe_with_gemini(filepath)
            print("Transcribed audio:", audio_transcription)
        except Exception as e:
            return jsonify({"error": f"Audio transcription failed: {e}"}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
                print("Removed audio file.")
    
    combined_doubt = f"{text_content} {audio_transcription}".strip()

    if not combined_doubt and not image_content:
        return jsonify({"error": "Combined text and image data are empty"}), 400

    # --- Build and Invoke Chain ---
    parser = JsonOutputParser(pydantic_object=DoubtResponse)
    
    # Create the list of content parts for the multimodal prompt
    content_parts = []
    
    text_prompt = (
        f"You are an expert at solving doubts for Bangladeshi students. Generate a useful explanation in Bengali for the following doubt in JSON format. If the doubt is not related to study or learning, then simply say: 'I can't help you with that.'. The response must contain a single key, 'response', with the explanation as its value. Your response must be valid JSON that can be parsed as a '{DoubtResponse.__name__}' object.\n\n"
        f"Doubt: {combined_doubt}"
    )
    content_parts.append({"type": "text", "text": text_prompt})

    if image_content:
        # **CORRECTED**: Convert the PIL Image into a dictionary with a Base64 string
        base64_image = pil_to_base64(image_content)
        content_parts.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })
        print("Image content converted to Base64 and added to content_parts.")

    try:
        messages = [
            HumanMessage(content=content_parts)
        ]
        
        result = model.invoke(messages)
        
        try:
            parsed_result = parser.parse(result.content)
            response_text = parsed_result.response
        except Exception:
            print("Warning: JSON parsing failed. Falling back to direct text extraction.")
            
            response_text = result.content
            if '```json' in response_text:
                json_string = response_text.split('```json')[1].split('```')[0].strip()
                try:
                    json_data = json.loads(json_string)
                    response_text = json_data.get('response', response_text)
                except json.JSONDecodeError:
                    pass

        if not response_text.strip():
            response_text = "Sorry, I could not understand the doubt. Please try again."

        return jsonify({"answer": response_text}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating solve of doubt: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
    
    
    
    
    
# # // original doubt solver:
# @app.route("/learn/doubts", methods=["POST"])
# def doubtSolver():
#     print("doubt hit")

#     image_doubt = ""
#     text_doubt = ""

#     if "image" not in request.files and "question" not in request.form:
#         return jsonify({"error": "No valid input provided"}), 400

#     if "image" in request.files:
#         image_file = request.files["image"]
#         try:
#             image_doubt = image_to_text(image_file)  # assumes you already defined this
#             print("Extracted text from image:", image_doubt)
#         except Exception as e:
#             return jsonify({"error": f"Image processing failed: {e}"}), 500

#     if "question" in request.form:
#         text_doubt = request.form.get("question", "").strip()

#     doubt_schema = ResponseSchema(
#         name="response",
#         description="A useful explanation in Bengali clearing the doubt of the student",
#     )
#     parser = StructuredOutputParser.from_response_schemas([doubt_schema])

#     prompt = PromptTemplate(
#         input_variables=["text"],
#         partial_variables={"format_instruction": parser.get_format_instructions()},
#         template=(
#             "You are an expert at solving doubts for Bangladeshi students.\n"
#             "Generate a very useful explanation in Bengali for the following doubt in JSON format.\n"
#             "If the doubt is not related to study or learning, then simply say: I can't help you with that.\n\n"
#             "The response must have:\n"
#             "- A 'response' key containing the actual explanation content\n\n"
#             "Doubt:\n"
#             "{text}\n"
#             "{format_instruction}"
#         ),
#     )

#     try:
#         chain = prompt | model | parser
#         combined_doubt = f"{text_doubt} {image_doubt}".strip()
#         print("Final doubt text:", combined_doubt)
#         result = chain.invoke({"text": combined_doubt})
#         return jsonify({"answer": result.get("response")}), 200
#     except Exception as e:
#         import traceback
#         return jsonify({"error": f"Error generating solve of doubt: {str(e)}"}), 500
