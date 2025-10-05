import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Stethoscope, Activity, FileText, Heart, ChevronRight } from 'lucide-react';

const EmergencyQuiz = () => {
  const [screen, setScreen] = useState('welcome');
  const [level, setLevel] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [storyText, setStoryText] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const scrollRef = useRef(null);

  // ⚠️ Backend URL'nizi buraya ekleyin
  const BACKEND_URL = 'https://acil-servis-quiz.onrender.com';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyText]);

  useEffect(() => {
    if (screen === 'game' && cases.length === 0) {
      fetchCases();
    }
  }, [screen]);

  const fetchCases = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cases`);
      const data = await response.json();
      setCases(data);
      if (data.length > 0) {
        loadCase(0, data);
      }
    } catch (error) {
      console.error('Vakalar yüklenemedi:', error);
      setStoryText('❌ Vakalar yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
    }
  };

  const loadCase = (caseLevel, caseData = cases) => {
    setQuestionCount(0);
    if (caseLevel >= caseData.length) {
      setStoryText('🎉 TEBRİKLER! Tüm vakaları doğru bildiniz!');
      return;
    }
    const currentCase = caseData[caseLevel];
    const hikaye = currentCase.hikaye.replace(' Klinik Bulgular:', '').trim();
    setStoryText(`📖 Vaka: ${hikaye}`);
  };

  const askQuestion = async () => {
    if (!inputText.trim() || loading) return;
    
    setLoading(true);
    const question = inputText;
    setInputText('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          diseaseIndex: level
        })
      });
      
      const data = await response.json();
      setQuestionCount(prev => prev + 1);
      setStoryText(prev => `${prev}\n\n💬 Hasta Cevap ${questionCount + 1}: ${data.answer}`);
    } catch (error) {
      console.error('Soru sorulurken hata:', error);
      setStoryText(prev => `${prev}\n\n❌ Soru gönderilirken hata oluştu.`);
    } finally {
      setLoading(false);
    }
  };

  const showFizik = () => {
    const currentCase = cases[level];
    setStoryText(prev => `${prev}\n\n👉 Fizik Muayene: ${currentCase.klinik_bulgular.fizik_muayene}`);
  };

  const showRadyoloji = () => {
    const currentCase = cases[level];
    setStoryText(prev => `${prev}\n\n👉 Radyolojik Görüntüler: ${currentCase.klinik_bulgular.radyolojik_goruntuler}`);
  };

  const showEkg = () => {
    const currentCase = cases[level];
    setStoryText(prev => `${prev}\n\n👉 EKG: ${currentCase.klinik_bulgular.ekg}`);
  };

  const showTetkik = () => {
    const currentCase = cases[level];
    setStoryText(prev => `${prev}\n\n👉 Tetkikler: ${currentCase.klinik_bulgular.tetkikler}`);
  };

  const checkGuess = () => {
    const guess = inputText.trim().toLowerCase();
    const correct = cases[level].ad.toLowerCase();
    
    if (guess === correct) {
      setStoryText(prev => `${prev}\n\n✅ Doğru tahmin! Sonraki vakaya geçiliyor...`);
      setTimeout(() => {
        setLevel(prev => prev + 1);
        loadCase(level + 1);
        setInputText('');
      }, 2000);
    } else {
      setStoryText(prev => `${prev}\n\n❌ Yanlış! Doğru cevap: ${cases[level].ad}\nOyun Bitti.`);
    }
  };

  const renderButtons = () => {
    if (questionCount < 2) {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            placeholder="Sorunuzu yazın"
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
          />
          <button
            onClick={askQuestion}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition"
          >
            {loading ? '⏳ Gönderiliyor...' : '📤 Soruyu Gönder'}
          </button>
        </div>
      );
    }

    const currentCase = cases[level];
    const hasShownFizik = storyText.includes('Fizik Muayene:');
    const hasShownRadyo = storyText.includes('Radyolojik Görüntüler:');
    const hasShownEkg = storyText.includes('EKG:');
    const hasShownTetkik = storyText.includes('Tetkikler:');

    if (!hasShownTetkik) {
      if (!hasShownFizik) {
        return (
          <button onClick={showFizik} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition">
            <Stethoscope size={20} /> Fizik Muayene
          </button>
        );
      }
      if (!hasShownRadyo) {
        return (
          <button onClick={showRadyoloji} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition">
            <FileText size={20} /> Radyolojik Görüntüler
          </button>
        );
      }
      if (!hasShownEkg) {
        return (
          <button onClick={showEkg} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition">
            <Activity size={20} /> EKG
          </button>
        );
      }
      return (
        <button onClick={showTetkik} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition">
          <Heart size={20} /> Tetkikler
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
          placeholder="Tahmininizi yazın"
          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-base"
        />
        <button
          onClick={checkGuess}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition"
        >
          <ChevronRight size={20} /> Tahmin Et
        </button>
      </div>
    );
  };

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle size={64} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Acil Servis Quiz Oyunu
            </h1>
            <p className="text-gray-600">
              Tıbbi vakalar üzerinden bilginizi test edin
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setScreen('game')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition shadow-md"
            >
              🚀 Başlat
            </button>
            
            <button
              onClick={() => window.close()}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-semibold text-lg transition shadow-md"
            >
              ❌ Çıkış
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: '90vh' }}>
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={24} />
            <h2 className="text-lg font-bold">Vaka {level + 1}/{cases.length}</h2>
          </div>
          <div className="text-sm">Soru: {questionCount}/2</div>
        </div>
        
        <div 
          ref={scrollRef}
          className="p-6 overflow-y-auto bg-gray-50"
          style={{ height: 'calc(90vh - 240px)' }}
        >
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
            {storyText || 'Vaka yükleniyor...'}
          </div>
        </div>
        
        <div className="p-4 bg-white border-t-2 border-gray-200 space-y-3">
          {cases.length > 0 && level < cases.length && !storyText.includes('TEBRİKLER') && !storyText.includes('Oyun Bitti') && renderButtons()}
          
          <button
            onClick={() => window.close()}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium text-sm transition"
          >
            Çıkış
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyQuiz;