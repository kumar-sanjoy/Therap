import requests

def extract_text_from_image(image_path, api_key='helloworld', language='eng'):
    """
    Extract text from an image using the OCR.Space API.

    :param image_path: str, path to the image file
    :param api_key: str, your OCR.Space API key
    :param language: str, OCR language code (default: 'eng')
    :return: str or None, extracted text or None if error occurs
    """
    try:
        with open(image_path, 'rb') as f:
            response = requests.post(
                'https://api.ocr.space/parse/image',
                files={'filename': f},
                data={'language': language, 'isOverlayRequired': False},
                headers={'apikey': api_key}
            )

        result = response.json()
        if result.get("IsErroredOnProcessing") is False:
            return result['ParsedResults'][0]['ParsedText']
        else:
            print("[ERROR] OCR failed:", result.get("ErrorMessage"))
            return None
    except Exception as e:
        print("[EXCEPTION] Something went wrong:", e)
        return None

# Example usage:
# text = extract_text_from_image(r"C:\Users\soura\Desktop\New folder\your_image.jpg")
# print(text)
