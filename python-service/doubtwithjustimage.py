import base64
import json
from io import BytesIO
from PIL import Image
from flask import request, jsonify
from langchain.schema import HumanMessage
from langchain.output_parsers import JsonOutputParser

def image_to_base64(image_file):
    """Convert uploaded image file to base64 string"""
    try:
        image = Image.open(image_file.stream)
        # Convert to RGB if necessary (handles RGBA, P mode, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save to BytesIO buffer as JPEG
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # Encode to base64
        base64_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return base64_string
    except Exception as e:
        raise Exception(f"Failed to process image: {str(e)}")

@app.route("/learn/doubts", methods=["POST"])
def solve_doubts():
    """Solve student doubts using text and/or image input"""
    # print("Doubt solving endpoint accessed")
    
    try:
        # Get text input
        text_doubt = request.form.get("question", "").strip()
        
        # Get image input
        image_base64 = None
        if "image" in request.files:
            image_file = request.files["image"]
            if image_file and image_file.filename:
                image_base64 = image_to_base64(image_file)
                # print("Image processed and converted to base64")
        
        # Validate that we have at least one input
        if not text_doubt and not image_base64:
            return jsonify({"error": "No valid input provided. Please provide either text question or image."}), 400
        
        # Build the prompt
        text_prompt = (
            "You are an expert at solving doubts for Bangladeshi students. "
            "Generate a useful explanation in Bengali for the following doubt. "
            "If the doubt is not related to study or learning, then simply say: 'I can't help you with that.' "
            "Provide your response in JSON format with a single key 'response' containing the explanation."
        )
        
        if text_doubt:
            text_prompt += f"\n\nText Doubt: {text_doubt}"
        
        if image_base64:
            text_prompt += "\n\nPlease also analyze the provided image for any additional context or questions."
        
        # Build content for the model
        content_parts = [{"type": "text", "text": text_prompt}]
        
        if image_base64:
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            })
        
        # Send to model
        messages = [HumanMessage(content=content_parts)]
        result = model.invoke(messages)
        # print(f"Model response received: {result}")
        
        # Parse the response
        response_text = ""
        try:
            # Try to parse as JSON first
            parser = JsonOutputParser(pydantic_object=DoubtResponse)
            parsed_result = parser.parse(result.content)
            response_text = parsed_result.response
        except Exception:
            # Fallback: extract JSON manually if structured parsing fails
            content = result.content
            if '```json' in content:
                try:
                    json_string = content.split('```json')[1].split('```')[0].strip()
                    json_data = json.loads(json_string)
                    response_text = json_data.get('response', content)
                except json.JSONDecodeError:
                    response_text = content
            else:
                # Try to parse the entire content as JSON
                try:
                    json_data = json.loads(content)
                    response_text = json_data.get('response', content)
                except json.JSONDecodeError:
                    response_text = content
        
        # Ensure we have a valid response
        if not response_text or not response_text.strip():
            response_text = "Sorry, I could not understand the doubt. Please try again."
        
        return jsonify({
            "answer": response_text,
            "status": "success"
        }), 200
        
    except Exception as e:
        print(f"Error in solve_doubts endpoint: {str(e)}")
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "status": "error"
        }), 500