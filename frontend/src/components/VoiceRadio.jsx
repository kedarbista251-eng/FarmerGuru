import React, { useState, useRef, useEffect } from 'react';

const SUGGESTED_PROMPTS = [
  "What is the best crop to plant this season?",
  "How can I maintain soil moisture during hot days?",
  "What are current mandi price trends for wheat?",
  "How do I prevent pest attacks on tomato crops?"
];

const LOCAL_KNOWLEDGE_BASE = [
  { keywords: ['weather', 'rain', 'climate', 'temperature'], reply: "Local weather looks stable today. Keep monitoring soil moisture before planning heavy irrigation." },
  { keywords: ['price', 'mandi', 'market', 'sell', 'cost'], reply: "Mandi prices for grain and vegetables are holding steady. Check local market yards around 8 AM for prime rate updates." },
  { keywords: ['crop', 'plant', 'sow', 'wheat', 'rice', 'seed'], reply: "Ensure your soil pH is balanced between 6.0 and 7.5 before sowing. Proper drainage will yield stronger root development." },
  { keywords: ['pest', 'insects', 'disease', 'leaf'], reply: "Inspect the underside of leaves for early pest activity. Organic neem-based sprays work well for mild infestations." },
  { keywords: ['maintain', 'land', 'water', 'fertilizer'], reply: "Combine organic compost with balanced NPK fertilizers. Drip irrigation saves water and keeps nutrients directly near roots." }
];

export default function VoiceRadio() {
  const [suggestedPrompts, setSuggestedPrompts] = useState(SUGGESTED_PROMPTS);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am Kisan Mitra, your personal farm advisor. Ask me anything about local weather, mandi market prices, or crop care.' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneError, setMicrophoneError] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const endRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    fetch(`${api}/api/voice/prompts`).then(response => response.ok ? response.json() : []).then(rows => {
      if (rows.length) setSuggestedPrompts(rows.map(prompt => prompt.text));
    }).catch(() => {});
  }, []);

  const languages = {
    English: { recognition: 'en-IN', speech: 'en-IN', label: 'English' },
    Hindi: { recognition: 'hi-IN', speech: 'hi-IN', label: 'हिन्दी (Hindi)' },
    Odia: { recognition: 'or-IN', speech: 'or-IN', label: 'ଓଡ଼ିଆ (Odia)' }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => () => window.clearTimeout(cooldownTimerRef.current), []);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
    stopSpeech();

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicrophoneError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = languages[language].recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    transcriptRef.current = '';
    setMicrophoneError('');

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (e) => {
      let finalTranscript = transcriptRef.current;
      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      transcriptRef.current = finalTranscript;
      setInput(`${finalTranscript}${interimTranscript}`.trim());
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      recognitionRef.current = null;
      const errMsgs = {
        'not-allowed': 'Microphone access blocked. Please enable browser permissions.',
        'audio-capture': 'No microphone hardware found.',
        'no-speech': 'No speech detected. Try speaking closer to the microphone.'
      };
      setMicrophoneError(errMsgs[e.error] || `Microphone error: ${e.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      setMicrophoneError('Failed to start microphone.');
    }
  };

  const getFallbackReply = (query) => {
    const lowerQuery = query.toLowerCase();
    const match = LOCAL_KNOWLEDGE_BASE.find(item => 
      item.keywords.some(keyword => lowerQuery.includes(keyword))
    );
    if (match) {
      return match.reply;
    }
    return `Regarding "${query}": Keep monitoring farm soil health and maintain regular field cycles. Connect your Python backend server for real-time live data queries.`;
  };

  const processQuery = async (text, selectedLanguage = language) => {
    if (!text.trim() || requestInFlightRef.current) return;

    stopSpeech();

    const remainingSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    if (remainingSeconds > 0) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Kisan Mitra is busy. Please try again in ${remainingSeconds} seconds.`
      }]);
      return;
    }

    requestInFlightRef.current = true;
    const queryText = text.trim();
    setMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_query_text', queryText);
      formData.append('preferred_language', selectedLanguage);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/voice-advisory`,
        { method: 'POST', body: formData }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.detail || 'Server offline');
      }

      const aiReply = result.text_response || getFallbackReply(queryText);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
      speakReply(aiReply, selectedLanguage);

    } catch {
      const fallbackReply = getFallbackReply(queryText);
      setMessages(prev => [...prev, { sender: 'ai', text: fallbackReply }]);
      speakReply(fallbackReply, selectedLanguage);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const speakReply = (text, lang) => {
    if ('speechSynthesis' in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = languages[lang].speech;
      
      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      border: '1px solid #d1fae5',
      display: 'flex',
      flexDirection: 'column',
      height: '75vh',
      minHeight: '520px'
    }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#047857',
            display: 'grid',
            placeItems: 'center',
            fontSize: '18px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
          }}>
            🎙️
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', lineHeight: 1.2 }}>Kisan Mitra AI Assistant</h2>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a7f3d0' }}>Voice & Text Advisory Center</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 0,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>⏹</span> Stop Speaking
            </button>
          )}

          <label htmlFor="assistant-language" style={{ fontSize: '12px', fontWeight: '600', color: '#d1fae5' }}>
            Language:
          </label>
          <select
            id="assistant-language"
            value={language}
            onChange={e => {
              stopSpeech();
              setLanguage(e.target.value);
            }}
            disabled={isListening || isLoading}
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              border: '1px solid #059669',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {Object.keys(languages).map(langKey => (
              <option key={langKey} value={langKey}>
                {languages[langKey].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {microphoneError && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          borderBottom: '1px solid #fee2e2',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <span>⚠️ {microphoneError}</span>
          <button 
            onClick={() => setMicrophoneError('')} 
            style={{ background: 'none', border: 0, color: '#991b1b', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8fafc'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '10px',
            justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {m.sender === 'ai' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#047857',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                🌾
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              fontSize: '14px',
              lineHeight: '1.5',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
              backgroundColor: m.sender === 'user' ? '#065f46' : '#ffffff',
              color: m.sender === 'user' ? '#ffffff' : '#1e293b',
              border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0'
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#047857',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🌾
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px 16px 16px 2px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Kisan Mitra is analyzing your request...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div style={{
        padding: '10px 16px',
        backgroundColor: '#f1f5f9',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', flexShrink: 0 }}>
          Suggestions:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => processQuery(prompt)}
            disabled={isLoading || isListening}
            style={{
              fontSize: '12px',
              backgroundColor: '#ffffff',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '6px 12px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); processQuery(input); }} style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isLoading || cooldownUntil > Date.now()}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 0,
            cursor: 'pointer',
            backgroundColor: isListening ? '#ef4444' : '#fbbf24',
            color: isListening ? '#ffffff' : '#1e293b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}
        >
          <span>🎤</span>
          <span>{isListening ? 'Stop' : 'Speak'}</span>
        </button>

        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder={isListening ? "Listening to your voice..." : "Ask about crops, weather, mandi prices..."} 
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#f8fafc'
          }}
        />

        <button 
          type="submit" 
          disabled={isLoading || cooldownUntil > Date.now() || !input.trim()} 
          style={{
            backgroundColor: '#064e3b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            border: 0,
            cursor: 'pointer',
            opacity: (!input.trim() || isLoading) ? 0.5 : 1
          }}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}