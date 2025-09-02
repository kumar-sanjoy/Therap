
@app.route("/learn/doubts", methods=["POST"])
def solve_doubts():
    """Solve student doubts using text, image, or audio input"""
    print("Doubt solving endpoint accessed")
    
    try:
        text_content = ""
        image_content = None
        audio_transcription = ""

        # Validate input
        if not any([request.files.get("image"), request.form.get("question"), request.files.get("audio")]):
            return jsonify({"error": "No valid input provided"}), 400

        # Process text input
        if "question" in request.form:
            text_content = request.form.get("question", "").strip()

        # Process image input
        if "image" in request.files:
            image_file = request.files["image"]
            try:
                image_content = Image.open(image_file.stream)
                print("Image processed successfully")
            except Exception as e:
                return jsonify({"error": f"Image processing failed: {str(e)}"}), 500

        # Process audio input
        if "audio" in request.files:
            audio_file = request.files["audio"]
            filename = secure_filename(audio_file.filename)
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            print(filename)
            
            try:
                audio_file.save(filepath)
                audio_transcription = transcribe_with_gemini(filepath)
            except Exception as e:
                return jsonify({"error": f"Audio transcription failed: {str(e)}"}), 500
            finally:
                if os.path.exists(filepath):
                    os.remove(filepath)

        # Combine text inputs
        combined_doubt = f"{text_content} {audio_transcription}".strip()
        print(combined_doubt)

        if not combined_doubt and not image_content:
            return jsonify({"error": "No valid content to process"}), 400

        # Build multimodal prompt
        parser = JsonOutputParser(pydantic_object=DoubtResponse)
        content_parts = []
        print(content_parts)
        
        text_prompt = (
            f"You are an expert at solving doubts for Bangladeshi students. "
            f"Generate a useful explanation in Bengali for the following doubt in JSON format. "
            f"If the doubt is not related to study or learning, then simply say: 'I can't help you with that.' "
            f"The response must contain a single key 'response' with the explanation as its value.\n\n"
            f"Doubt: {combined_doubt}"
        )
        content_parts.append({"type": "text", "text": text_prompt})

        if image_content:
            base64_image = pil_to_base64(image_content)
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
            })

        # Generate response
        messages = [HumanMessage(content=content_parts)]
        result = model.invoke(messages)
        print(result)
        
        # Parse response
        try:
            parsed_result = parser.parse(result.content)
            response_text = parsed_result.response
        except Exception:
            # print("JSON parsing failed, extracting text manually")
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
        # print(f"Error in solve_doubts: ")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
