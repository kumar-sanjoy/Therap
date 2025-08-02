import requests

DEEPGRAM_API_KEY = "e20e93eddef9022ebe63e518ba5e15449a7c3075"

def speech_to_text(file_path: str, language: str = "en") -> str:
        
    url = f"https://api.deepgram.com/v1/listen?model=general&language={language}&tier=base"

    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/m4a"
    }

    try:
        with open(file_path, "rb") as audio_file:
            response = requests.post(url, headers=headers, data=audio_file)

        if response.status_code == 200:
            result = response.json()
            return (
                result.get("results", {})
                .get("channels", [])[0]
                .get("alternatives", [])[0]
                .get("transcript", "")
            )
        else:
            print(f"[ERROR] {response.status_code}: {response.text}")
            return ""
    except Exception as e:
        print(f"[ERROR] Failed to transcribe: {e}")
        return ""


if __name__ == "__main__":
    audio_file = r"C:\Users\soura\Documents\Sound Recordings\Recording.m4a" 
    transcript = speech_to_text(audio_file, language="bn")  
    print("Transcript:", transcript)
