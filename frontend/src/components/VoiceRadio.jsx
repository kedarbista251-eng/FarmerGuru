import React, { useState, useRef, useEffect } from 'react';

export default function VoiceRadio() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am Kisan Mitra. Ask me anything about local weather, mandi market prices, or crop selection.' }
  ]);
  const [input, setInput] = useState('');
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

  const languages = {
    English: { recognition: 'en-IN', speech: 'en-IN' },
    Hindi: { recognition: 'hi-IN', speech: 'hi-IN' },
    Nepali: { recognition: 'ne-NP', speech: 'ne-NP' }
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
      const messages = {
        'not-allowed': 'Microphone permission was blocked. Allow microphone access in your browser address-bar settings and try again.',
        'audio-capture': 'No microphone was found. Connect a microphone and try again.',
        'no-speech': 'No speech was detected. Speak closer to the microphone and try again.'
      };
      setMicrophoneError(messages[e.error] || `Microphone error: ${e.error}. Please try again.`);
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
      const formData = new FormData();
      formData.append('user_query_text', text);
      formData.append('preferred_language', selectedLanguage);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/voice-advisory`,
        { method: 'POST', body: formData }
      );

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
      <div className="bg-emerald-900 text-white p-4 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2 text-sm md:text-base">📻 Kisan Voice & Text Chatbot</h2>
        <div className="flex items-center gap-2">
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
