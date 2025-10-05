from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from hastaliklar import hastaliklar

app = Flask(__name__)
CORS(app) 
API_KEY = "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"
client = OpenAI(api_key=API_KEY)

@app.route("/cases", methods=["GET"])
def get_cases():
    simplified_cases = []
    for case in hastaliklar:
        simplified_cases.append({
            "id": case.get("id", 0),
            "ad": case["ad"],
            "hikaye": case["hikaye"],
            "klinik_bulgular": case["klinik_bulgular"]
        })
    return jsonify(simplified_cases)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    hastalik = data.get("hastalik")
    if not question or not hastalik:
        return jsonify({"error": "Missing question or hastalik"}), 400

    chat_completion = client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": (f"Doktorun sorduğu {question} sorusunu, "
                        f"bir {hastalik} hastası gibi cevapla, "
                        f"hastalık adını verme, cevabı en fazla 1-2 cümle yaz.")
        }],
        model="gpt-4o-mini",
    )
    cevap = chat_completion.to_dict()["choices"][0]["message"]["content"]
    return jsonify({"cevap": cevap})

if __name__ == "__main__":
    app.run(debug=True)

