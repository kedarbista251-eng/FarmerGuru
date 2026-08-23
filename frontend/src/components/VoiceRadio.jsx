import React, { useState, useRef, useEffect } from 'react';

// Helper utilities for managing simple client-side browser cookies
const setCookie = (name, value, days = 30) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

export default function VoiceRadio() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am Kisan Mitra. Ask me anything about local weather, mandi market prices, or crop selection.' }
  ]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [microphoneError, setMicrophoneError] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const endRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const languages = {
    English: { recognition: 'en-IN', speech: 'en-IN' },
    Hindi: { recognition: 'hi-IN', speech: 'hi-IN' },
    Nepali: { recognition: 'ne-NP', speech: 'ne-NP' }
  };

  // Load API Key from browser cookie on component mount
  useEffect(() => {
    const savedKey = getCookie('user_gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save to cookie whenever the input text changes
  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    setCookie('user_gemini_api_key', newKey);
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => window.clearTimeout(cooldownTimerRef.current), []);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicrophoneError('Speech recognition is not supported here. Please use Google Chrome or Microsoft Edge.');
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

      for (let index = e.resultIndex; index < e.results.length; index += 1) {
        const transcript = e.results[index][0].transcript;
        if (e.results[index].isFinal) {
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
      const errorMessages = {
        'not-allowed': 'Microphone permission was blocked. Allow microphone access in your browser address-bar settings and try again.',
        'audio-capture': 'No microphone was found. Connect a microphone and try again.',
        'no-speech': 'No speech was detected. Speak closer to the microphone and try again.'
      };
      setMicrophoneError(errorMessages[e.error] || `Microphone error: ${e.error}. Please try again.`);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      recognitionRef.current = null;
      setMicrophoneError('The microphone could not start. Please try again.');
    }
  };

  const processQuery = async (text, selectedLanguage = language) => {
    if (!text.trim() || requestInFlightRef.current) return;

    const remainingSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    if (remainingSeconds > 0) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Kisan Mitra is temporarily busy. Please try again in about ${remainingSeconds} seconds.`
      }]);
      return;
    }

    requestInFlightRef.current = true;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      // Pull key from state or fallback directly to cookie
      const activeApiKey = apiKey.trim() || getCookie('user_gemini_api_key');

      const formData = new FormData();
      formData.append('user_query_text', text);
      formData.append('preferred_language', selectedLanguage);
      formData.append('geminiAPIKey', activeApiKey);

      const response = await fetch(`${API_BASE_URL}/api/voice-advisory`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = result.detail;
        if (response.status === 429) {
          const retryAfter = Number(detail?.retry_after_seconds || response.headers.get('Retry-After') || 60);
          setCooldownUntil(Date.now() + retryAfter * 1000);
          window.clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = window.setTimeout(() => setCooldownUntil(0), retryAfter * 1000);
          throw new Error(`${detail?.message || 'Kisan Mitra has reached its request limit.'} Try again in about ${retryAfter} seconds.`);
        }
        throw new Error(typeof detail === 'string' ? detail : 'The farming advisor could not respond.');
      }

      const aiReply = result.text_response;
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);

      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(aiReply);
        speech.lang = languages[selectedLanguage].speech;
        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: `I could not connect to Kisan Mitra: ${error.message}` }
      ]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 flex flex-col h-[80vh]">
      
      {/* Header */}
      <div className="bg-emerald-900 text-white p-4 flex justify-between items-center flex-wrap gap-2">
        <h2 className="font-bold flex items-center gap-2 text-sm md:text-base">📻 Kisan Voice & Text Chatbot</h2>
        
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <label htmlFor="geminiAPIKey" className="font-semibold">GEMINI KEY:</label>
              <input
                type="password"
                id="geminiAPIKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Paste API Key"
                className="bg-white text-gray-900 px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 w-36"
              />
            </div>
            <a 
              href="https://ai.google.dev/gemini-api/docs/api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-amber-300 underline hover:text-amber-200"
            >
              Get Gemini Key
            </a>
          </div>

          <label htmlFor="assistant-language" className="sr-only">Assistant language</label>
          <select
            id="assistant-language"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={isListening || isLoading}
            className="bg-white text-gray-900 px-2 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी</option>
            <option value="Nepali">नेपाली</option>
          </select>
        </div>
      </div>

      {microphoneError && (
        <div role="alert" className="px-4 py-3 bg-red-50 text-red-700 border-b border-red-100 text-xs leading-relaxed">
          {microphoneError}
        </div>
      )}

      {/* Chat History Flow */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">🌾</div>
            )}
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.sender === 'user' 
                ? 'bg-emerald-800 text-white rounded-br-none' 
                : 'bg-white text-gray-900 border border-emerald-100 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">🌾</div>
            <div className="bg-white text-gray-500 border border-emerald-100 rounded-2xl rounded-bl-none p-4 text-sm">Kisan Mitra is thinking...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); processQuery(input); }} className="p-4 bg-white border-t border-emerald-100 flex gap-3">
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isLoading || cooldownUntil > Date.now()}
          className={`shrink-0 px-5 py-4 rounded-xl font-bold text-base shadow transition-all ${
            isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-amber-400 text-gray-900 hover:bg-amber-300 disabled:opacity-50'
          }`}
        >
          🎤 {isListening ? 'Stop' : 'Tap & Speak'}
        </button>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Ask about weather, mandi price, or what to plant..." 
          className="flex-1 min-w-0 px-4 py-4 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-emerald-600" 
        />
        <button type="submit" disabled={isLoading || cooldownUntil > Date.now() || !input.trim()} className="bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white px-7 py-4 rounded-xl font-bold text-base shadow transition-colors">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}