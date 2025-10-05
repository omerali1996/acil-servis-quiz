
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  const [cases, setCases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showFizik, setShowFizik] = useState(false);
  const [guess, setGuess] = useState('');

  const BACKEND_URL = "https://acil-servis-quiz.onrender.com"; // Backend URL'in buraya gelecek

  useEffect(() => {
    fetch(`${BACKEND_URL}/cases`)
      .then(res => res.json())
      .then(data => setCases(data));
  }, []);

  const askQuestion = async () => {
    if (!userQuestion) return;

    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userQuestion, hastalik: cases[currentIndex].ad })
    });

    const data = await response.json();
    setChatHistory([...chatHistory, { question: userQuestion, cevap: data.cevap }]);
    setUserQuestion('');
  };

  const nextCase = () => {
    setCurrentIndex(currentIndex + 1);
    setChatHistory([]);
    setShowFizik(false);
    setGuess('');
  };

  if (cases.length === 0) return <Text>Loading...</Text>;
  if (currentIndex >= cases.length) return <Text>🎉 Tüm vakalar tamamlandı!</Text>;

  const currentCase = cases[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>📖 Vaka: {currentCase.hikaye}</Text>
        {chatHistory.map((c, i) => (
          <View key={i} style={styles.chatBox}>
            <Text>💬 Sorun: {c.question}</Text>
            <Text>🩺 Hasta: {c.cevap}</Text>
          </View>
        ))}
      </ScrollView>

      {!showFizik ? (
        <View style={{ marginTop: 10 }}>
          <TextInput
            placeholder="Sorunuzu yazın"
            value={userQuestion}
            onChangeText={setUserQuestion}
            style={styles.input}
          />
          <Button title="Soruyu Gönder" onPress={askQuestion} />
          <Button title="Fizik Muayene" onPress={() => setShowFizik(true)} />
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Text>👉 Fizik Muayene: {currentCase.klinik_bulgular.fizik_muayene}</Text>
          <Text>👉 Radyolojik Görüntüler: {currentCase.klinik_bulgular.radyolojik_goruntuler}</Text>
          <Text>👉 EKG: {currentCase.klinik_bulgular.ekg}</Text>
          <Text>👉 Tetkikler: {currentCase.klinik_bulgular.tetkikler}</Text>
          <TextInput
            placeholder="Tahmininizi yazın"
            value={guess}
            onChangeText={setGuess}
            style={styles.input}
          />
          <Button title="Tahmin Et" onPress={() => {
            if (guess.toLowerCase() === currentCase.ad.toLowerCase()) {
              alert("✅ Doğru! Sonraki vakaya geçiliyor.");
              nextCase();
            } else {
              alert(`❌ Yanlış! Oyun bitti. Doğru cevap: ${currentCase.ad}`);
            }
          }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  chatBox: { marginBottom: 10, padding: 5, backgroundColor: "#f0f0f0", borderRadius: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 5, borderRadius: 5 }
});
