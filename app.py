import os
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from hastaliklar import hastaliklar

app = Flask(__name__)
CORS(app)

# Environment variable'dan API key al
API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set!")

client = OpenAI(api_key=API_KEY)

@app.route("/api/cases", methods=["GET"])
def get_cases():
    simplified_cases = []
    for case in hastaliklar:
        simplified_cases.append({
            "ad": case["ad"],
            "hikaye": case["hikaye"],
            "klinik_bulgular": case["klinik_bulgular"]
        })
    return jsonify(simplified_cases)

@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    disease_index = data.get("diseaseIndex")
    
    if question is None or disease_index is None:
        return jsonify({"error": "Missing question or diseaseIndex"}), 400
    
    if disease_index >= len(hastaliklar):
        return jsonify({"error": "Invalid disease index"}), 400
    
    hastalik = hastaliklar[disease_index]["ad"]
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": (f"Doktorun sorduğu {question} sorusunu, "
                            f"bir {hastalik} hastası gibi cevapla, "
                            f"hastalık adını verme, cevabı en fazla 1-2 cümle yaz.")
            }],
            model="gpt-4o-mini",
        )
        
        cevap = chat_completion.choices[0].message.content
        return jsonify({"answer": cevap})
    
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return jsonify({"error": "Soru cevaplanırken hata oluştu"}), 500

if __name__ == "__main__":
    app.run(debug=True)
