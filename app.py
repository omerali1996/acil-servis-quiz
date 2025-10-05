from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from hastaliklar import hastaliklar

app = Flask(__name__)
CORS(app)

API_KEY = "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"
client = OpenAI(api_key=API_KEY)

# ✅ /api/cases route'u ekledik
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

# ✅ /api/ask route'u ve diseaseIndex ile çalışacak şekilde düzelttik
@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    disease_index = data.get("diseaseIndex")
    
    if question is None or disease_index is None:
        return jsonify({"error": "Missing question or diseaseIndex"}), 400
    
    if disease_index >= len(hastaliklar):
        return jsonify({"error": "Invalid disease index"}), 400
    
    # Index'ten hastalık adını al
    hastalik = hastaliklar[disease_index]["ad"]
    
    # OpenAI'ya sor
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
    
    # ✅ Frontend "answer" bekliyor, "cevap" değil
    return jsonify({"answer": cevap})

if __name__ == "__main__":
    app.run(debug=True)
