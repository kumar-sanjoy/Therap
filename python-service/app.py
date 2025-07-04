from flask import Flask, request, jsonify
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser

# To run: type these two in sequence
# .\env\Scripts\Activate.ps1
# python app.py
# if fresh install:
# pip install flask flask-cors pillow easyocr python-dotenv psycopg2-binary langchain langchain-core langchain-community langchain-google-genai pydantic


# image recieving...
from PIL import Image
import io 

import easyocr
reader = easyocr.Reader(['en'])

from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from flask_cors import CORS 
from dotenv import load_dotenv
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from pydantic import BaseModel
from typing import Dict

# from langchain_openai import ChatOpenAI

import json
import psycopg2
import random

load_dotenv()

app = Flask(__name__)

# CORS(app)
# CORS(app, resources={r"/api/*": 
#     {"origins": "*", "supports_credentials": True, "allow_headers": ["*"]}})
# CORS(app, resources={r"/api/performance": {"origins": "http://localhost:5173"}})

CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "supports_credentials": True,
        "allow_headers": ["*"]
    },
    r"/api/performance": {
        "origins": "http://localhost:5173"
    }
}, origins="*")

conn = psycopg2.connect (
    user="postgres",
    password="postgres",
    host="localhost",
    port=5432,
    database="bot"   
)
cur = conn.cursor()

class_map = { 'a': '910', 'b': '8', 'c': '7', 'd': '6' }
subject_map = { 'a': 'P', 'b': 'C', 'c': 'B' }

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=1)

parser = JsonOutputParser()
difficulty = "hard"

class MCQSchema(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str
    hint: str
    explanation: str
    advice: str

@app.route("/api/submit-written", methods=["POST"])
def evaluate(): 
    if 'image' not in request.files: 
        return jsonify({"messege": "error"}), 404
    
    image_file = request.files['image']
    image_bytes = image_file.read()
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB") 

    import numpy as np
    image_np = np.array(image)

    results = reader.readtext(image_np, detail=0)  # detail=0 gives plain text only
    studentAnswer = '\n'.join(results)
    # print(studentAnswer)
    question = request.form.get("question")  

    parser = StrOutputParser()
    evaluation_template = """
        তুমি একজন বাংলাদেশি শিক্ষক। একজন শিক্ষার্থী একটি প্রশ্নের উত্তর দিয়েছে এবং এখন তোমাকে তার উত্তর মূল্যায়ন করতে হবে।
        তাকে ১০ এর মধ্যে নম্বর দাও, মন্তব্য লেখো এবং ভবিষ্যতে ভালো করার জন্য একটি পরামর্শ দাও — সবকিছু বাংলায় লেখো।

        প্রশ্ন:
        {question}

        উত্তর:
        {answer}
    """
    prompt = PromptTemplate(
        input_variables=["question", "answer"],
        template=evaluation_template
    )

    evaluation_chain = prompt | model | parser

    if studentAnswer.strip():
        final_result = evaluation_chain.invoke({
            'question': question,
            'answer': studentAnswer
        })
        # print(final_result)
        return jsonify({"result": final_result}), 200
    else:
        return jsonify({"result": "not found"}), 404

@app.route("/api/written", methods=["POST"])
def writtenTest():
    input_data = request.get_json()
    if not input_data:
        return jsonify({"error": "No JSON received"}), 400

    cls = input_data.get("CLASS")
    sub = input_data.get("SUBJECT")
    chapter = input_data.get("CHAPTER")

    print(cls, sub, chapter)
    print(cls, sub, chapter)
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

@app.route("/api/learn", methods=["POST"]) 
def process_lesson(): 
    input_data = request.get_json()
    if not input_data:
        return jsonify({"error": "No JSON received"}), 400
    
    cls = input_data.get("CLASS")
    sub = input_data.get("SUBJECT")
    chapter = input_data.get("CHAPTER")

    # print(cls, sub, chapter)

    template = """
        আপনি একজন ভালো বাংলাদেশী শিক্ষক এবং আপনার কাজ হলো নিচের বিষয়বস্তু একজন শিক্ষার্থীকে বোঝানো। টিপস, কৌতুক, উদাহরণ সহকারে একটি স্বতন্ত্র ছাত্রকে বোঝানোর জন্য একটি প্রতিক্রিয়া তৈরি করুন। সম্পূর্ণ প্রতিক্রিয়াটি শুধুমাত্র বাংলা ভাষায় হবে, কোনো ইংরেজি শব্দ ব্যবহার করা যাবে না।
        {text}
    """
    prompt = PromptTemplate(input_variables=["text"], template=template)
    chain = prompt | model

    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"


    with open(txt_name, "r", encoding="utf-8") as f:
        content = f.read()

    splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=100)
    docs = splitter.create_documents([content])
    # print(f"Number of semantic chunks: {len(docs)}\n")

    response = []
    for i, chunk in enumerate(docs):
        try:
            result = chain.invoke({"text": chunk.page_content})
            response.append(result.content)
            # print(f"--- blog for Chunk {i + 1} ---")
            # print(result.content)
            # print()
        except Exception as e:
            print(f"Failed to generate blog for chunk {i + 1}: {e}")

    return jsonify({"lesson": response}), 200

@app.route("/api/signup", methods=["POST"])
def signUP():
    input_data = request.get_json();
    if not input_data:
        return jsonify({"not enough data sent"}), 400 # Bad Request
    return jsonify({"message": "Data received successfully"}), 200 # ok

@app.route("/api/login", methods=["POST"])
def login():
    input_data = request.get_json();
    if not input_data or "USER" not in input_data or "USER_PASS" not in input_data:
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request
    user_id = input_data.get("USER")
    user_pass = input_data.get("USER_PASS")
    user_state = input_data.get("ROLE")

    print(user_id, user_pass, user_state)
    
    if(user_state == 'teacher'):
        cur.execute (
            """
            SELECT password, teacher_Name FROM teachers
            WHERE teacher_id = %s
            """,
            (user_id,)
        )
        row = cur.fetchone()
        if row and user_pass == row[0]:
            return jsonify({'message': 'Teacher Login Successful', 'teacherName': row[1]}), 200 # ok
        else:
            return jsonify({'message': 'Unauthorized: wrong password or ID for Teacher'}), 401
        
    else: 
        cur.execute(
            """
            SELECT password, student_name FROM student_detail
            WHERE id = %s
            """,
            (user_id,)
        )
        row = cur.fetchone()
        
        if row and user_pass == row[0]:
            return jsonify({'message': 'Student Login successful', 'StudentName': row[1]}), 200 # ok
        else:
            return jsonify({'message': 'Unauthorized: wrong password or ID'}), 401 # Unauthorized: Requires authentication.

@app.route("/api/test", methods=["POST"])
def fresh_test():
    input_data = request.get_json()
    if not input_data:
        return jsonify({"error": "No JSON received"}), 400
    
    user_id = input_data.get("USER")    
    cls = input_data.get("CLASS")
    sub = input_data.get("SUBJECT")
    chapter = input_data.get("CHAPTER")
    # ques_count = input_data.get("COUNT")
    ques_count = 3
    
    LAST_10_ARRAY = [0] * 10

    cur.execute(
        """
        SELECT last_10 FROM student_detail
        WHERE id = %s
        """,
        (user_id,)
    )
    row = cur.fetchone()

    difficulty = 'hard'
    if row[0]:
        LAST_10_ARRAY = row[0]

    sum_of_difficulty_array = sum(LAST_10_ARRAY) 
    if sum_of_difficulty_array >= 8 and difficulty == 'hard':
        difficulty = 'very hard'
    elif sum_of_difficulty_array >= 8:
        difficulty = 'hard'
    elif sum_of_difficulty_array >= 6:
        difficulty = 'medium'
    else:
        difficulty = 'easy'
    
    txt_name = f"doc/{class_map.get(cls, 'unknown')}-{subject_map.get(sub, 'X')}-{chapter}.txt"
    
    try:
        loader = TextLoader(txt_name, encoding='utf-8')
        docs = loader.load()
        # return jsonify("file loaded success")
        # return jsonify({"message": "File loaded successfully", "content": docs[0].page_content})
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

@app.route("/api/newMistakes", methods=["POST"])
def recieveMistakes():
    input_data = request.get_json()
    user_id = input_data.get("USER")
    mistaken_questions = input_data.get("QUESTIONS")
    attempted_questions = input_data.get("TOTAL")
    last_received_mistakes = input_data.get("ANSWERS")
    
    cur.execute(
        "SELECT last_10 FROM student_detail WHERE id = %s",
        (user_id,)
    )
    result = cur.fetchone()
    if result is None:
        return jsonify({"error": "User not found"}), 404

    current_last_10 = result[0]  # This will be a Python list because psycopg2 auto converts PostgreSQL arrays
    updated_last_10 = current_last_10 + last_received_mistakes
    updated_last_10 = updated_last_10[-10:]

    cur.execute(
        "UPDATE student_detail SET last_10 = %s WHERE id = %s",
        (updated_last_10, user_id)
    )
    conn.commit() 

    question_ids = []

    for wrong_question in mistaken_questions:
        cur.execute(
            """
            INSERT INTO questions (question_statement)
            VALUES (%s)
            RETURNING question_id
            """,
            (wrong_question,)
        )
        returned_id = cur.fetchone()[0]
        question_ids.append(returned_id)

    conn.commit()  # Commit once after all inserts

    # Append the list of new question_ids to the student's wrong_list    
    cur.execute(
        """
        UPDATE student_detail
        SET wrong_list = wrong_list || %s,
            attempt_count = attempt_count + %s,
            wrong_count = wrong_count + %s
        WHERE id = %s
        """,
        (question_ids, attempted_questions, len(question_ids), user_id)
    )
    conn.commit()

    return jsonify("mistaken questions saved to database"), 201 
 
@app.route("/api/prevMistakes", methods=["GET"])
def review_practice():
    user_id = request.args.get("userId")  # from the URL: ?userId=... works fine
    ques_count = 3
    # print("previous mistakes******")
    # print(user_id)  
    
    mistaken_questions_id = []
    mistaken_questions_statement = []
    
    # Fetch the wrong_list for the user
    cur.execute(
        """
        SELECT wrong_list FROM student_detail
        WHERE id = %s
        """,
        (user_id,)  # Assuming user_id is defined elsewhere
    )
    
    row_wrong_question = cur.fetchone()
    mistaken_questions_id = row_wrong_question[0]  # List of mistaken question IDs
    
    if mistaken_questions_id:
        placeholders = ','.join(['%s'] * len(mistaken_questions_id))  # Creates %s,%s,... for each ID
        cur.execute(
            f"""
            SELECT question_statement 
            FROM questions 
            WHERE question_id IN ({placeholders})
            """,
            mistaken_questions_id  # Pass the list of IDs directly
        )
        questions = cur.fetchall()
        
        mistaken_questions_statement = [row[0] for row in questions]
        
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
            
    else:
        return jsonify("looks like you haven't made enough mistakes yet")
  
@app.route("/api/notes", methods=["POST"])
def generateNotes():
    input_data = request.get_json()
    cls = input_data.get("CLASS")
    sub = input_data.get("SUBJECT")
    chapter = input_data.get("CHAPTER")
    
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

@app.route("/api/doubts", methods=["POST"])
def doubtSolver():
    image_doubt = ''
    text_doubt = ''
    if 'image' in request.files:
        image_file = request.files['image']
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")  # EasyOCR expects RGB images

        # Convert image to array for EasyOCR
        import numpy as np
        image_np = np.array(image)

        # Extract text using EasyOCR
        results = reader.readtext(image_np, detail=0)  # detail=0 gives plain text only
        extracted_text = '\n'.join(results)
        image_doubt = extracted_text

        # print(extracted_text)
    
    elif 'question' in request.form:
        text_doubt = request.form.get("question")  

    else:
        return jsonify({"error": "No valid input provided"}), 400
  
    
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
    # print(doubt_response)
    return jsonify(doubt_response)

@app.route("/api/performance", methods=["POST"])
def performanceReport():
    input_data = request.get_json()
    user_id = input_data.get("userId")
    
    cur.execute(
        """
        SELECT
            attempt_count,
            (attempt_count - wrong_count),
            wrong_count,
            ARRAY(
                SELECT CASE x
                    WHEN 1 THEN 'right'
                    ELSE 'wrong'
                END
                FROM unnest(last_10) AS x
            )
        FROM student_detail
        WHERE id = %s
        """,
        (user_id,)
    )
    result = cur.fetchone()
    
    # print(result)
    
    performanceData = {
        "totalQuestions": result[0],
        "totalRight": result[1],
        "totalWrong": result[2],
        "lastTenPerformance": result[3]
    }
    
    return jsonify(performanceData)

@app.route("/api/teacher/dashboard", methods=["GET"]) # make it teacher dashboard.
def teacherReport():
    cur.execute(
        """
        SELECT jsonb_build_object(
            'studentId', id,
            'studentName', student_name,
            'totalQuestions', attempt_count,
            'correctAnswers', (attempt_count - wrong_count)
        )
        FROM student_detail
        """
    )
    # rows = cur.fetchone();
    student_infos = [row[0] for row in cur.fetchall()]
    # print(student_infos)
    
    return jsonify(student_infos)

@app.route("/api/teacher", methods=["POST"])
def viewStudent():
    input_data = request.get_json()
    student_id = input_data.get("studentId")
    # print(student_id)
    parser3 = StructuredOutputParser.from_response_schemas([
        {"name": "report", "description": "The weakness report for the student in Bengali"}
    ])

    cur.execute(
        """
        SELECT wrong_list FROM student_detail
        WHERE id = %s
        """,
        (student_id,)  # Assuming user_id is defined elsewhere
    )
    
    row_wrong_question = cur.fetchone()
    mistaken_questions_ids = row_wrong_question[0]
    placeholders = ','.join(['%s'] * len(mistaken_questions_ids)) 
    
    cur.execute(
        """
        SELECT question_statement
        FROM questions
        WHERE question_id IN %s
        """, (tuple(mistaken_questions_ids),))  # Pass as a tuple
    unsolved_questions = cur.fetchall()

    prompt = PromptTemplate(
        input_variables=["questions"],
        partial_variables={"format_instruction": parser3.get_format_instructions()},
        template="""\
            আপনি একজন দক্ষ শিক্ষক, যিনি খুব সুন্দরভাবে ছাত্রদের দুর্বলতা বিশ্লেষণ করতে পারেন।
            একজন ছাত্র নিচের প্রশ্নগুলোর উত্তর দিতে পারেনি। 
            এই প্রশ্নগুলোর ভিত্তিতে ছাত্রের দুর্বলতাগুলি বিশ্লেষণ করে বাংলায় একটি প্রতিবেদন লিখুন।

            প্রশ্নসমূহ:
            {questions}

            {format_instruction}
        """ 
    )

    chain = prompt | model | parser3
    weakness_report = chain.invoke({"questions": unsolved_questions})
    return jsonify(weakness_report)

# if __name__ == '__main__':
#     app.run(debug=True)
app.run(host="0.0.0.0", port=5050, debug=True)
cur.close()
conn.close()