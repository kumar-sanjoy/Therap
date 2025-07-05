# === Standard Library Imports ===
import io
import random

# === Third-Party Library Imports ===
from flask import Flask, request, jsonify
from flask_cors import CORS
# from PIL import Image
import numpy as np
# import easyocr
from dotenv import load_dotenv

# === Langchain Imports ===
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter

# === EasyOCR Initialization ===
# reader = easyocr.Reader(['en'])

# === Usage Notes ===
# To run:
# .\env\Scripts\Activate.ps1
# python app.py
# If fresh install:
# pip install Flask flask-cors pillow numpy easyocr python-dotenv langchain langchain-google-genai langchain-community langchain-core langchain-text-splitters

load_dotenv()

app = Flask(__name__)
CORS(app)

class_map = { 'a': '910', 'b': '8', 'c': '7', 'd': '6' }
subject_map = { 'a': 'P', 'b': 'C', 'c': 'B' }

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=1)


# def image_to_text(img):
#     image_bytes = img.read()
#     image = Image.open(io.BytesIO(image_bytes))
#     image = image.convert("RGB")  # EasyOCR expects RGB images

#     # Convert image to array for EasyOCR
#     image_np = np.array(image)

#     # Extract text using EasyOCR
#     results = reader.readtext(image_np, detail=0)  # detail=0 gives plain text only
#     extracted_text = '\n'.join(results)
#     return extracted_text

@app.route("/exam/written", methods=["GET"])
def written_test():   
    print('written hit')
    cls = request.args.get("className")
    sub = request.args.get("subject")
    chapter = request.args.get("chapter", type=int)

    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"

    try:
        loader = TextLoader(txt_name, encoding='utf-8')
        docs = loader.load()
        text = "\n".join([doc.page_content for doc in docs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    prompt = PromptTemplate(
        input_variables=["text"],
        template="""
            You are an expert Bangladeshi high school teacher.
            Based on the following chapter content, generate a Bangladeshi board exam-style written question in Bengali.
            Write only the question, nothing else.           
            Chapter content:
            {text}
        """
    )
    chain = prompt | model
    question_from_model = chain.invoke({"text": text})
    
    return jsonify({"question": question_from_model.content})

# @app.route("/exam/submit-written", methods=["POST"])
# def evaluate(): 
#     print('submit-written hit')
#     if 'image' not in request.files: 
#         return jsonify({"messege": "error"}), 404
    
#     image_file = request.files['image']
#     image = Image.open(image_file)
#     image = image.convert("RGB") 
#     # # # # # # # image.show()

#     image_np = np.array(image)

#     results = reader.readtext(image_np, detail=0)  # detail=0 gives plain text only
#     studentAnswer = '\n'.join(results)

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
#         return jsonify({"result": final_result}), 200
#     else:
#         return jsonify({"result": "not found"}), 404
    
@app.route("/exam/mcq", methods=["GET"])
def fresh_test():   
    print('mcq exam hit')
    cls = request.args.get("className")
    sub = request.args.get("subject")
    chapter = request.args.get("chapter", type=int)
    ques_count = request.args.get("count", type=int)


    difficulty = 'hard'
    parser = JsonOutputParser()

    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"
    
    try:
        loader = TextLoader(txt_name, encoding='utf-8')
        docs = loader.load()
    except FileNotFoundError:
        return jsonify({"error": f"File '{txt_name}' not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    try:
        text = "\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["text", "difficulty", "ques_count"],
            partial_variables={"format_instruction": parser.get_format_instructions()},
            template="""
                You are an expert Bangladeshi high school teacher.

                Based on the following chapter content, generate exactly {ques_count} {difficulty} level Bangladeshi board exam-style MCQ questions in Bengali.
                The correct answer must be present among the options.

                Each question must follow *strictly* this JSON structure (inside a dictionary with the key "mcqs"):

                {{
                    "mcqs": [
                        {{
                            "question": "Your question in Bengali here",
                            "options": {{
                                "a": "Option A",
                                "b": "Option B",
                                "c": "Option C",
                                "d": "Option D"
                            }},
                            "answer": "correct option letter (a/b/c/d)",
                            "hint": "A helpful hint in Bengali",
                            "explanation": "A brief explanation in Bengali"
                        }},
                        ...
                    ]
                }}

                ✦ Only use Bengali text for the questions, options, hints, and explanations.
                ✦ Ensure the entire response is a *valid JSON object* with only one top-level key: "mcqs".

                Chapter content:
                {text}

                {format_instruction}
                """
            )
        
        chain = prompt | model | parser
        questions_from_model = chain.invoke({"text": text, "difficulty": difficulty, "ques_count": ques_count}) # works fine

        try:
            return jsonify(questions_from_model)
        except Exception as e:
            return jsonify("dict sending failed")
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500 

@app.route("/learn/doubts", methods=["POST"])
def doubtSolver():
    print('doubt hit')
    image_doubt = ''
    text_doubt = ''
    if 'image' not in request.files and 'question' not in request.form:
        return jsonify({"error": "No valid input provided"}), 400
    if 'image' in request.files:
        image_file = request.files['image']
        image_doubt = image_to_text(image_file)

    if 'question' in request.form:
        text_doubt = request.form.get("question")

    
    doubt_schema = ResponseSchema(
        name="response",
        description="A useful explanation in Bengali clearing the doubt of the student"
    )
    parser = StructuredOutputParser.from_response_schemas([doubt_schema])

    prompt = PromptTemplate(
        input_variables=["text"],
        partial_variables={"format_instruction": parser.get_format_instructions()},
        template=(
            "You are an expert at solving doubts Bangladeshi students.\n"
            "Generate a very useful explanation in Bengali for the following doubt in JSON format."
            "If the doubt is not anything about study or learning, then simply say I can't help you with that.\n\n"
            "The response should have:\n"
            "- A 'response' key containing the actual explanation content\n\n"
            "Chapter content:\n"
            "{text}\n"
            "{format_instruction}"
        )
    )

    try:
        chain = prompt | model | parser
        result = chain.invoke({"text": str(text_doubt + image_doubt)})
        doubt_response = result
    except Exception as e:
        return jsonify(f"Error generating solve of doubt: {e}")
    return jsonify(doubt_response)

@app.route("/learn/learn", methods=["GET"]) 
def process_lesson(): 
    print("learn hit")
    cls = request.args.get("className")
    sub = request.args.get("subject")
    chapter = request.args.get("chapter")

    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"

    template = """
        আপনি একজন ভালো বাংলাদেশী শিক্ষক এবং আপনার কাজ হলো নিচের বিষয়বস্তু একজন শিক্ষার্থীকে বোঝানো। টিপস, কৌতুক, উদাহরণ সহকারে একটি স্বতন্ত্র ছাত্রকে বোঝানোর জন্য একটি প্রতিক্রিয়া তৈরি করুন। সম্পূর্ণ প্রতিক্রিয়াটি শুধুমাত্র বাংলা ভাষায় হবে, কোনো ইংরেজি শব্দ ব্যবহার করা যাবে না।
        {text}
    """
    prompt = PromptTemplate(input_variables=["text"], template=template)
    chain = prompt | model

    with open(txt_name, "r", encoding="utf-8") as f:
        content = f.read()

    splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=100)
    docs = splitter.create_documents([content])

    response = []
    for i, chunk in enumerate(docs):
        try:
            result = chain.invoke({"text": chunk.page_content})
            response.append(result.content)
        except Exception as e:
            print(f"Failed to generate blog for chunk {i + 1}: {e}")

    return jsonify({"lesson": response}), 200

@app.route("/learn/notes", methods=["GET"])
def generateNotes():
    print('note hit')
    cls = request.args.get("className")
    sub = request.args.get("subject")
    chapter = request.args.get("chapter")
    
    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"
    loader = TextLoader(txt_name, encoding='utf-8')
    docs = loader.load()
    text = "\n".join([doc.page_content for doc in docs])
    
    note_schema = ResponseSchema(
        name="note",
        description="A useful Bengali note generated from the chapter content"
    )
    parser = StructuredOutputParser.from_response_schemas([note_schema])

    prompt = PromptTemplate(
        input_variables=["text"],
        partial_variables={"format_instruction": parser.get_format_instructions()},
        template=(
            "You are an expert at creating notes for Bangladeshi students.\n"
            "Generate a very useful note in Bengali from the following chapter content in JSON format\n\n"
            "The note should have:\n"
            "- A 'note' key containing the actual note content\n\n"
            "Chapter content:\n"
            "{text}\n"
            "{format_instruction}"
        )
    )
    
    try:
        chain = prompt | model | parser
        result = chain.invoke({"text": text})
        notes_from_model = result
    except Exception as e:
        return jsonify(f"Error generating note: {e}")
    
    return jsonify(notes_from_model)  


@app.route("/exam/previous-mcq", methods=["POST"])
def review_practice():
    print('previous-mcq hit')
    input_date = request.get_json()
    mistaken_questions_statement = input_date.get('previousQuestions')
    ques_count = input_date.get('count')
    print(mistaken_questions_statement)  
    
    mistake_size = len(mistaken_questions_statement)
    questions_from_model = []
    
    # Step 2: Create the Standard Output Parser from the Schema
    parser2 = StructuredOutputParser.from_response_schemas([
        {"name": "question", "description": "The MCQ question text in Bengali"},
        {"name": "options", "description": "A dictionary with keys 'a', 'b', 'c', 'd' and option texts as values"},
        {"name": "answer", "description": "The correct option key (a, b, c, or d)"},
        {"name": "hint", "description": "A small hint to help solve the MCQ"},
        {"name": "explanation", "description": "A short explanation of the correct answer"},
        {"name": "advice", "description": "Advice to the student on how to improve"}
    ])
    
    for i in range (0, ques_count):
        question_no = random.randint(0, mistake_size - 1)
        question = mistaken_questions_statement[question_no]
        # Step 3: Define the Prompt Template
        prompt = PromptTemplate(
            input_variables=["text"],
            partial_variables={"format_instruction": parser2.get_format_instructions()},
            template="""
        আপনি একজন অভিজ্ঞ বাংলাদেশী উচ্চমাধ্যমিক বিদ্যালয়ের শিক্ষক।
        একজন শিক্ষার্থী নিম্নলিখিত প্রশ্নের উত্তর সঠিকভাবে দিতে পারেনি। এখন, অনুরূপ কিন্তু সম্পূর্ণ নতুন একটি প্রশ্ন তৈরি করুন বাংলায়, JSON ফরম্যাটে।

        MCQ তে থাকতে হবে:
        - একটি প্রশ্ন
        - চারটি অপশন (a, b, c, d)
        - সঠিক উত্তর (একটি অক্ষর হিসেবে)
        - একটি ছোট্ট হিন্ট
        - একটি সংক্ষিপ্ত ব্যাখ্যা
        - একটি সংক্ষিপ্ত পরামর্শ যদি শিক্ষার্থী আবার ভুল করে

        নিশ্চিত করুন যে সঠিক উত্তর অপশনগুলোর মধ্যে আছে।

        পাঠ্যবিষয়:
        {text}
        {format_instruction}
        """
        )
        chain = prompt | model | parser2

        question_from_model = chain.invoke({"text": question}) 
        questions_from_model.append(question_from_model)
        
    model_output_data = {
        "mcqs": [
            {
                "question": item.get("question"),
                "options": item.get("options"),
                "answer": item.get("answer"),
                "hint": item.get("hint"),
                "explanation": item.get("explanation"),
                "advice": item.get("advice")
            }
            for item in questions_from_model
        ]
    }        
    # return jsonify(question_from_model)
    # for item in questions_from_model:
        # print(item.get("correct_answer"))
        # print(item.get("answer"))
        
    return jsonify(model_output_data)


app.run(host="0.0.0.0", port=5000, debug=True)
