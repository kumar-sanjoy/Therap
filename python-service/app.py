#!/usr/bin/env python3
"""
Flask Educational API
A comprehensive educational platform API for Bangladeshi students
providing doubt solving, exam generation, learning materials, and performance tracking.

Usage:
# === Usage Notes ===
# To run:
# .\env\Scripts\Activate.ps1
# python app.py
# or simply type ./run.ps1 (this is a self made script)

Requirements:
    pip install Flask flask-cors python-dotenv langchain langchain-google-genai 
    pip install langchain-community langchain-core langchain-text-splitters 
    pip install google-generativeai numpy pandas Pillow werkzeug
"""

# === Standard Library Imports ===
import base64
import json
import math
import os
import random
from io import BytesIO

# === Third-Party Library Imports ===
import google.generativeai as genai
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response
from PIL import Image
from werkzeug.utils import secure_filename

# === LangChain Imports ===
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter


# === Configuration ===
class Config:
    """Application configuration"""
    UPLOAD_FOLDER = 'uploads'
    DOC_FOLDER = 'doc'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    JSON_AS_ASCII = False
    JSONIFY_PRETTYPRINT_REGULAR = True


# === Data Models ===
class DoubtResponse(BaseModel):
    """Schema for the doubt-solving response."""
    response: str = Field(description="A useful explanation in Bengali clearing the doubt of the student.")


# === Constants and Mappings ===
CLASS_MAP = {'a': '910', 'b': '8', 'c': '7', 'd': '6'}
SUBJECT_MAP = {'a': 'P', 'b': 'C', 'c': 'B', 'd': 'E', 'e': 'G', 'f': 'BE', 'S': 'S'}


# === Application Setup ===
def create_app():
    """Create and configure Flask application"""
    load_dotenv()
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # For older Flask versions compatibility
    app.json.ensure_ascii = False
    
    
    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.DOC_FOLDER, exist_ok=True)
    
    return app


# === Utility Functions ===
def pil_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

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


def get_document_content(class_code: str, subject_code: str, chapter: int) -> str:
    """Load and return document content"""
    filename = f"{Config.DOC_FOLDER}/{CLASS_MAP.get(class_code, 'unknown')}-{SUBJECT_MAP.get(subject_code, 'X')}-{chapter}.txt"
    
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Document file '{filename}' not found")
    except Exception as e:
        raise Exception(f"Error reading document: {str(e)}")


def train_q_table_from_history(history_data: list, num_states: int = 11, num_actions: int = 10, 
                              alpha: float = 0.1, gamma: float = 0.9):
    """
    Train Q-table from history data using Q-learning for adaptive difficulty.
    
    Args:
        history_data: List of [performance_level, difficulty_level, correct_bool]
        num_states: Number of performance levels
        num_actions: Number of difficulty levels
        alpha: Learning rate
        gamma: Discount factor
    
    Returns:
        Function to select best difficulty based on performance level
    """
    q_table = np.zeros((num_states, num_actions))

    for state, action_difficulty, correct in history_data:
        action = action_difficulty - 1  # Convert difficulty 1-10 to action index 0-9

        # Calculate reward based on correctness and difficulty
        if correct:
            reward = 1 + action_difficulty / 10
        else:
            reward = -math.log(action_difficulty + 1) / 5

        # Q-learning update
        next_state = state
        best_next_q = np.max(q_table[next_state])
        q_table[state, action] += alpha * (reward + gamma * best_next_q - q_table[state, action])

    def select_difficulty(performance_level: int) -> int:
        """Select best difficulty (1-10) based on performance level (0-10)"""
        return int(np.argmax(q_table[performance_level])) + 1

    return select_difficulty

 
# === Initialize Flask App and Model ===
app = create_app()
model = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.2)


# === API Endpoints ===

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Educational API is running"}), 200

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
        
        # Build the prompt for markdown response
        text_prompt = (
            "You are an expert at solving doubts for Bangladeshi students. "
            "Generate a useful explanation in Bengali for the following doubt. "
            "If the doubt is not related to study or learning, then simply say: 'I can't help you with that.' "
            "Format your response as proper markdown with appropriate headings, bullet points, and formatting. "
            "Use Bengali language for the explanation but you can use English for technical terms when necessary. "
            "Structure your response with clear sections and make it easy to read."
            "**write everything strictly in bengali, you can use some english keywords if needed, but it shoud be mostly in bengali**"
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
        response_text = result.content.strip()
        
        if response_text.startswith('```') and response_text.endswith('```'):
            lines = response_text.split('\n')
            if lines[0].startswith('```') and lines[-1] == '```':
                response_text = '\n'.join(lines[1:-1])
        
        # Ensure we have a valid response
        if not response_text or not response_text.strip():
            response_text = "দুঃখিত, আমি এই প্রশ্ন টি বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        
        return jsonify({
            "response": response_text,
            "status": "success",
            "format": "markdown"
        }), 200
        
    except Exception as e:
        print(f"Error in solve_doubts endpoint: {str(e)}")
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "status": "error"
        }), 500


@app.route("/profile/teacher/generate-report", methods=["POST"])
def generate_weakness_report():
    """Generate weakness report based on mistaken questions"""
    # print('generate-report endpoint accessed')
    try:
        input_data = request.get_json()
        mistaken_questions = input_data.get("mistakenQuestions", [])
        
        # newly added:
        attempt_count = input_data.get("attemptCount")
        correct_count = input_data.get("correctCount")
        last_ten_performance = input_data.get("last10Performance")
        
        if not mistaken_questions:
            return jsonify({"error": "No mistaken questions provided"}), 400
        
        questions_text = "\n".join(mistaken_questions)

        parser = StructuredOutputParser.from_response_schemas([
            ResponseSchema(name="report", description="The weakness report for the student in Bengali")
        ])

        prompt = PromptTemplate(
            input_variables=["questions", "total_questions", "correct_answers"],
            partial_variables={"format_instruction": parser.get_format_instructions()},
            template=(
                "আপনি একজন দক্ষ শিক্ষক, যিনি খুব সুন্দরভাবে ছাত্রদের দুর্বলতা বিশ্লেষণ করতে পারেন।\n"
                "একজন ছাত্র মোট {total_questions} টি প্রশ্নের উত্তর দিয়েছে, যার মধ্যে সঠিক উত্তর দিয়েছে {correct_answers} টি।\n"
                "নিচের প্রশ্নগুলোর উত্তর দিতে পারেনি:\n\n{questions}\n\n"
                "আপনার কাজ হলো:\n"
                "1. ছাত্রের সামগ্রিক পারফরম্যান্স একটি আকর্ষণীয়ভাবে উপস্থাপন করা।\n"
                "   - সঠিক উত্তর সংখ্যা, ভুল উত্তর সংখ্যা ও শতকরা হারে স্কোর দেখান।\n"
                "   - প্রয়োজনে Markdown টেবিল ব্যবহার করুন যাতে রিপোর্ট পড়তে সুবিধা হয়।\n"
                "   - চাইলে শতকরা হারের ভিত্তিতে একটি progress bar এর মত টেক্সট বা ASCII diagram ব্যবহার করতে পারেন।\n"
                "2. ভুল উত্তরগুলোর ভিত্তিতে ছাত্রের দুর্বলতাগুলি চিহ্নিত করুন।\n"
                "3. ছাত্রকে ভবিষ্যতে কীভাবে উন্নতি করতে হবে তার জন্য কার্যকর পরামর্শ দিন।\n\n"
                "{format_instruction}\n"
                "***উত্তরটি অবশ্যই উপরের JSON ফর্ম্যাটে দিন। অন্য কিছু লিখবেন না।***"
            )
        )

        chain = prompt | model | parser
        weakness_report = chain.invoke({
            "questions": questions_text,
            "total_questions": attempt_count,
            "correct_answers": correct_count
        })

        response_data = json.dumps(weakness_report, ensure_ascii=False)
        # print(response_data)
        return Response(response=response_data, status=200, mimetype='application/json')
        
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500


@app.route("/exam/written", methods=["GET"])
def generate_written_test():
    """Generate written exam questions"""
    print('Written test endpoint accessed')
    
    try:
        cls = request.args.get("className")
        sub = request.args.get("subject")
        chapter = request.args.get("chapter", type=int)

        if not all([cls, sub, chapter]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Load document content
        try:
            content = get_document_content(cls, sub, chapter)
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        prompt = PromptTemplate(
            input_variables=["text"],
            template=(
                "You are an expert Bangladeshi high school teacher. "
                "Based on the following chapter content, generate a Bangladeshi board exam-style "
                "written question in Bengali. Write only the question, nothing else.\n\n"
                "Chapter content:\n{text}"
            )
        )
        
        chain = prompt | model
        result = chain.invoke({"text": content})
        
        return jsonify({"question": result.content}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating written test: {str(e)}"}), 500


@app.route("/exam/submit-written", methods=["POST"])
def evaluate_written_answer():
    """Evaluate written answer from uploaded image"""
    # print('submit-written endpoint accesses')
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file found"}), 400
            
        image_file = request.files['image']
        question = request.form.get('question')
        
        if not question:
            return jsonify({"error": "No question provided"}), 400

        # Process image
        image = Image.open(image_file)
        base64_image_string = pil_to_base64(image)

        # Create multimodal prompt
        multi_modal_prompt = [
            HumanMessage(content=[
                {
                    "type": "text",
                    "text": (
                        "তুমি একজন বাংলাদেশি শিক্ষক। একজন শিক্ষার্থী একটি প্রশ্নের উত্তর দিয়েছে "
                        "এবং এখন তোমাকে তার উত্তর মূল্যায়ন করতে হবে। তাকে ১০ এর মধ্যে নম্বর দাও, "
                        "মন্তব্য লেখো এবং ভবিষ্যতে ভালো করার জন্য একটি পরামর্শ দাও — "
                        "সবকিছু বাংলায় লেখো।\n\n"
                        "if no answer provided by the student, say **no answer provided or the the image is not clear enough** in bangla"
                        f"প্রশ্ন:\n{question}\n\nউত্তর:"
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
        # print(f"Error in evaluate_written_answer: ")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/exam/mcq", methods=["POST"])
def generate_mcq_test():
    """Generate MCQ test with adaptive difficulty"""
    # print('MCQ exam endpoint accessed')
    
    try:
        data = request.get_json()
        cls = data.get("className")
        sub = data.get("subject")
        chapter = data.get("chapter")
        ques_count = data.get("count", 5)
        ques_perf = data.get("performance", [])

        if not all([cls, sub, chapter]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Determine difficulty based on performance history
        if not ques_perf:
            difficulty = 1
        else:
            get_best_difficulty = train_q_table_from_history(ques_perf)
            difficulty = get_best_difficulty(5)


        # Load document content
        try:
            content = get_document_content(cls, sub, chapter)
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        parser = JsonOutputParser()
        prompt = PromptTemplate(
            input_variables=["text", "difficulty", "ques_count"],
            partial_variables={"format_instruction": parser.get_format_instructions()},
            template=(
                "You are an expert Bangladeshi high school teacher. "
                "Based on the following chapter content, generate exactly {ques_count} questions "
                "of difficulty level {difficulty} (1-10 scale, 10 is most difficult) "
                "Bangladeshi board exam-style MCQ questions in Bengali. "
                "The correct answer must be present among the options.\n\n"
                
                "Each question must follow this JSON structure:\n"
                "{{\n"
                '  "mcqs": [\n'
                '    {{\n'
                '      "question": "Your question in Bengali here",\n'
                '      "options": {{\n'
                '        "a": "Option A",\n'
                '        "b": "Option B",\n'
                '        "c": "Option C",\n'
                '        "d": "Option D"\n'
                '      }},\n'
                '      "answer": "correct option letter (a/b/c/d)",\n'
                '      "hint": "A helpful hint in Bengali",\n'
                '      "explanation": "A brief explanation in Bengali"\n'
                '    }}\n'
                '  ]\n'
                "}}\n\n"
                
                "Chapter content:\n{text}\n\n{format_instruction}"
            )
        )
        
        chain = prompt | model | parser
        questions_from_model = chain.invoke({
            "text": content,
            "difficulty": difficulty,
            "ques_count": ques_count
        })

        return jsonify({
            "mcqs": questions_from_model.get('mcqs', []),
            "difficultyLevel": difficulty
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating MCQ test: {str(e)}"}), 500


@app.route("/learn/learn", methods=["GET"])
def generate_lesson():
    """Generate interactive lesson content"""
    # print("Lesson generation endpoint accessed")
    
    try:
        cls = request.args.get("className")
        sub = request.args.get("subject")
        chapter = request.args.get("chapter")

        if not all([cls, sub, chapter]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Load and process document content
        try:
            content = get_document_content(cls, sub, chapter)
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        template = (
            "আপনি একজন ভালো বাংলাদেশী শিক্ষক এবং আপনার কাজ হলো নিচের বিষয়বস্তু একজন "
            "শিক্ষার্থীকে বোঝানো। টিপস, কৌতুক, উদাহরণ সহকারে একটি স্বতন্ত্র ছাত্রকে "
            "বোঝানোর জন্য একটি প্রতিক্রিয়া তৈরি করুন। সম্পূর্ণ প্রতিক্রিয়াটি শুধুমাত্র "
            "বাংলা ভাষায় হবে, কোনো ইংরেজি শব্দ ব্যবহার করা যাবে না।\n\n{text}"
        )
        
        prompt = PromptTemplate(input_variables=["text"], template=template)
        chain = prompt | model

        # Split content into manageable chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=100)
        docs = splitter.create_documents([content])

        response = []
        for i, chunk in enumerate(docs):
            try:
                result = chain.invoke({"text": chunk.page_content})
                response.append(result.content)
            except Exception as e:
                print(f"Failed to generate lesson for chunk {i + 1} ")

        return jsonify({"lesson": response}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating lesson: {str(e)}"}), 500


@app.route("/learn/notes", methods=["GET"])
def generate_notes():
    """Generate study notes from chapter content"""
    # print('Notes generation endpoint accessed')
    
    try:
        cls = request.args.get("className")
        sub = request.args.get("subject")
        chapter = request.args.get("chapter")

        if not all([cls, sub, chapter]):
            return jsonify({"error": "Missing required parameters"}), 400

        # Load document content
        try:
            content = get_document_content(cls, sub, chapter)
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        note_schema = ResponseSchema(
            name="note",
            description="A useful Bengali note generated from the chapter content"
        )
        parser = StructuredOutputParser.from_response_schemas([note_schema])

        prompt = PromptTemplate(
            input_variables=["text"],
            partial_variables={"format_instruction": parser.get_format_instructions()},
            template=(
                "You are an expert at creating notes for Bangladeshi students. "
                "Generate a very useful note in Bengali from the following chapter content "
                "in JSON format. The note should have a 'note' key containing the actual "
                "note content.\n\nChapter content:\n{text}\n\n{format_instruction}"
            )
        )
        
        chain = prompt | model | parser
        result = chain.invoke({"text": content})
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating notes: {str(e)}"}), 500


@app.route("/exam/previous-mcq", methods=["POST"])
def generate_practice_questions():
    """Generate practice questions based on previously mistaken questions"""
    # print('Previous MCQ practice endpoint accessed')
    
    try:
        input_data = request.get_json()
        mistaken_questions = input_data.get('previousQuestions', [])
        ques_count = input_data.get('count', 5)

        if not mistaken_questions:
            return jsonify({"error": "No previous questions provided"}), 400

        mistake_size = len(mistaken_questions)
        questions_from_model = []

        parser = StructuredOutputParser.from_response_schemas([
            ResponseSchema(name="question", description="The MCQ question text in Bengali"),
            ResponseSchema(name="options", description="A dictionary with keys 'a', 'b', 'c', 'd' and option texts as values"),
            ResponseSchema(name="answer", description="The correct option key (a, b, c, or d)"),
            ResponseSchema(name="hint", description="A small hint to help solve the MCQ"),
            ResponseSchema(name="explanation", description="A short explanation of the correct answer"),
            ResponseSchema(name="advice", description="Advice to the student on how to improve")
        ])

        prompt = PromptTemplate(
            input_variables=["text"],
            partial_variables={"format_instruction": parser.get_format_instructions()},
            template=(
                "আপনি একজন অভিজ্ঞ বাংলাদেশী উচ্চমাধ্যমিক বিদ্যালয়ের শিক্ষক। "
                "একজন শিক্ষার্থী নিম্নলিখিত প্রশ্নের উত্তর সঠিকভাবে দিতে পারেনি। "
                "এখন, অনুরূপ কিন্তু সম্পূর্ণ নতুন একটি প্রশ্ন তৈরি করুন বাংলায়, JSON ফরম্যাটে।\n\n"
                
                "MCQ তে থাকতে হবে:\n"
                "- একটি প্রশ্ন\n"
                "- চারটি অপশন (a, b, c, d)\n"
                "- সঠিক উত্তর (একটি অক্ষর হিসেবে)\n"
                "- একটি ছোট্ট হিন্ট\n"
                "- একটি সংক্ষিপ্ত ব্যাখ্যা\n"
                "- একটি সংক্ষিপ্ত পরামর্শ যদি শিক্ষার্থী আবার ভুল করে\n\n"
                
                "নিশ্চিত করুন যে সঠিক উত্তর অপশনগুলোর মধ্যে আছে।\n\n"
                "পাঠ্যবিষয়:\n{text}\n\n{format_instruction}"
            )
        )

        chain = prompt | model | parser

        # Generate questions based on random selection from mistaken questions
        for i in range(ques_count):
            question_no = random.randint(0, mistake_size - 1)
            question = mistaken_questions[question_no]
            
            try:
                question_result = chain.invoke({"text": question})
                questions_from_model.append(question_result)
            except Exception as e:
                print(f"Error generating question {i+1} ")

        # Format response
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

        return jsonify(model_output_data), 200
        
    except Exception as e:
        return jsonify({"error": f"Error generating practice questions: {str(e)}"}), 500


# === Error Handlers ===
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(413) 
def too_large(error):
    return jsonify({"error": "File too large"}), 413


# === Main Application Runner ===
if __name__ == "__main__":
    print("Starting Educational API Server...")
    print("Available endpoints:")
    print("- GET  /health - Health check")
    print("- POST /learn/doubts - Solve student doubts")
    print("- POST /profile/teacher/generate-report - Generate weakness report")
    print("- GET  /exam/written - Generate written questions")
    print("- POST /exam/submit-written - Evaluate written answers")
    print("- POST /exam/mcq - Generate MCQ tests")
    print("- GET  /learn/learn - Generate lesson content")
    print("- GET  /learn/notes - Generate study notes")
    print("- POST /exam/previous-mcq - Generate practice questions")
    
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=True)