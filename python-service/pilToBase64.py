import base64
from io import BytesIO
from flask import Flask, request, jsonify
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from PIL import Image

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

if __name__ == "__main__":
    app.run(debug=True)