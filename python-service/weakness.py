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
    "total_questions": total_q,
    "correct_answers": correct_q
})