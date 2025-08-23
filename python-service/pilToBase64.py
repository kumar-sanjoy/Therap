import base64
from io import BytesIO
from flask import Flask, request, jsonify
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.0)

def pil_to_base64(image):
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

@app.route("/exam/submit-written", methods=["POST"])
def evaluate():
    if 'image' not in request.files:
        return jsonify({"message": "error: no image file found"}), 400
    image_file = request.files['image']
    question = request.form.get('question')
    if not question:
        return jsonify({"message": "error: no question found"}), 400
    try:
        image = Image.open(image_file)
        base64_image_string = pil_to_base64(image)
        print(base64_image_string)
        multi_modal_prompt = [
            HumanMessage(content=[
                {
                    "type": "text",
                    "text": (
                        "তুমি একজন বাংলাদেশি শিক্ষক। "
                        "একজন শিক্ষার্থী একটি প্রশ্নের উত্তর দিয়েছে "
                        "এবং এখন তোমাকে তার উত্তর মূল্যায়ন করতে হবে। "
                        "তাকে ১০ এর মধ্যে নম্বর দাও, মন্তব্য লেখো "
                        "এবং ভবিষ্যতে ভালো করার জন্য একটি পরামর্শ দাও — "
                        "সবকিছু বাংলায় লেখো।\n\n"
                        f"প্রশ্ন:\n{question}\n\n"
                        "উত্তর:\n"
                    )
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image_string}"}
                }
            ])
        ]
        result = model.invoke(multi_modal_prompt)
        return jsonify({"result": result.content}), 200
    except Exception as e:
        print(f"[EXCEPTION] {e}")
        return jsonify({"message": "Internal server error"}), 500

@app.route("/learn/doubts", methods=["POST"])
def doubtSolver():
    print("doubt hit")
    text_doubt = request.form.get("question", "").strip()
    image_file = request.files.get("image")

    if not text_doubt and not image_file:
        return jsonify({"error": "No text or image doubt provided"}), 400

    try:
        prompt_content = []
        
        instructional_text = (
            "You are an expert at solving doubts for Bangladeshi students. "
            "Generate a very useful explanation in Bengali for the following doubt. "
            "If the doubt is not related to study or learning, then simply say: আমি এই বিষয়ে আপনাকে সাহায্য করতে পারছি না।\n\n"
            "Doubt from student:\n"
            f"{text_doubt}"
        )
        prompt_content.append({"type": "text", "text": instructional_text.strip()})
        
        if image_file:
            try:
                image = Image.open(image_file.stream)
                base64_image_string = pil_to_base64(image)
                prompt_content.append({
                    "type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{base64_image_string}"
                })
            except Exception as e:
                print(f"[IMAGE PROCESSING ERROR] {e}")
                return jsonify({"error": f"Image processing failed: {e}"}), 500

        message = HumanMessage(content=prompt_content)
        result = model.invoke([message]) # Pass the message in a list
        
        return jsonify({"answer": result.content}), 200

    except Exception as e:
        import traceback
        print(f"[MODEL INVOCATION ERROR] {traceback.format_exc()}")
        return jsonify({"error": f"Error generating solve of doubt: {str(e)}"}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



# ??
# previous version:

# @app.route("/exam/submit-written", methods=["POST"])
# def evaluate(): 
#     print('submit-written hit')
#     if 'image' not in request.files: 
#         return jsonify({"message": "Error: No image file provided"}), 400
    
#     image_file = request.files['image']
#     studentAnswer = image_to_text(image_file)

#     question = request.form.get("question")  

#     parser = StrOutputParser()
#     evaluation_template = """
#         তুমি একজন বাংলাদেশি শিক্ষক। একজন শিক্ষার্থী একটি প্রশ্নের উত্তর দিয়েছে এবং এখন তোমাকে তার উত্তর মূল্যায়ন করতে হবে।
#         তাকে ১০ এর মধ্যে নম্বর দাও, মন্তব্য লেখো এবং ভবিষ্যতে ভালো করার জন্য একটি পরামর্শ দাও — সবকিছু বাংলায় লেখো।

#         প্রশ্ন:
#         {question}

#         উত্তর:
#         {answer}
#     """
#     prompt = PromptTemplate(
#         input_variables=["question", "answer"],
#         template=evaluation_template
#     )

#     evaluation_chain = prompt | model | parser

#     if studentAnswer.strip():
#         final_result = evaluation_chain.invoke({
#             'question': question,
#             'answer': studentAnswer
#         })
#         # print(final_result)
        
#         # Create response with proper JSON encoding for Bengali
#         response = jsonify({"feedback": final_result})
#         response.headers['Content-Type'] = 'application/json; charset=utf-8'
#         return response, 200
#     else:
#         response = jsonify({"feedback": "উত্তর খুঁজে পাওয়া যায়নি"})
#         response.headers['Content-Type'] = 'application/json; charset=utf-8'
#         return response, 404
    