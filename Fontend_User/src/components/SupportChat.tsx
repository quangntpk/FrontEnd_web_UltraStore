import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import CryptoJS from 'crypto-js';
import { toByteArray } from 'base64-js';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const SupportChat: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<{ question: string; result: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(isListening);
  const { toast } = useToast();

  const API_KEY = "ba3f1541d8c7ca7d782cf9c324aeeaca";
  const API_SECRET = "a68bb7419e7121dbb393d73f0c154bf4";

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setQuestion(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          toast({
            title: "Lỗi nhận diện giọng nói",
            description: `Không thể nhận diện giọng nói: ${event.error}`,
            variant: "destructive",
          });
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            recognition.start();
          }
        };

        speechRecognitionRef.current = recognition;
      } else {
        toast({
          title: "Không hỗ trợ",
          description: "Trình duyệt của bạn không hỗ trợ nhận diện giọng nói",
          variant: "destructive",
        });
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [toast]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('supportChatHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('supportChatHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Không có nội dung",
        description: "Vui lòng nhập câu hỏi hoặc sử dụng tính năng ghi âm",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5261/api/Gemini/TraLoi?question=${encodeURIComponent(question)}`);
      const data = response.data;

      if (data.responseCode === 201 && data.result) {
        const newMessage = { question, result: data.result };
        setHistory([...history, newMessage]);
        setQuestion('');
      } else {
        toast({
          title: "Lỗi từ server",
          description: data.errorMessage || "Có lỗi xảy ra",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    }
  };

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: "Không hỗ trợ",
        description: "Trình duyệt của bạn không hỗ trợ nhận diện giọng nói",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Đang lắng nghe",
        description: "Hãy nói câu hỏi của bạn",
      });
    }
  };

  const assembleAuthUrl = (hostUrl: string, apiKey: string, apiSecret: string) => {
    const date = new Date().toUTCString();
    const host = new URL(hostUrl).host;
    const requestLine = "GET /v2/tts HTTP/1.1";
    const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
    const authorization = btoa(authorizationOrigin);
    const url = `${hostUrl}?host=${encodeURIComponent(host)}&date=${encodeURIComponent(date)}&authorization=${encodeURIComponent(authorization)}`;
    return url;
  };

  // Helper function to encode UTF-8 string to base64
  const encodeTextToBase64 = (text: string): string => {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(text);
    const binaryString = String.fromCharCode(...utf8Bytes);
    return btoa(binaryString);
  };

  const speakText = (text: string) => {
    if (!text || !text.trim()) {
      toast({
        title: "Lỗi dữ liệu",
        description: "Vui lòng cung cấp nội dung để tổng hợp giọng nói",
        variant: "destructive",
      });
      return;
    }
  
    const wsUrl = assembleAuthUrl('wss://tts-api-sg.xf-yun.com/v2/tts', API_KEY, API_SECRET);
    websocketRef.current = new WebSocket(wsUrl);
  
    websocketRef.current.onopen = () => {
      const requestData = {
        common: { app_id: "ga62eb2a" },
        business: {
          vcn: "xiaoyun",
          aue: "lame", // Changed from "mp3" to "lame"
          speed: 50,
          volume: 50,
          pitch: 50,
          tte: "UTF8",
        },
        data: {
          status: 2,
          text: encodeTextToBase64(text),
        },
      };
      console.log('Request:', requestData);
      websocketRef.current?.send(JSON.stringify(requestData));
      setIsSpeaking(true);
    };
  
    websocketRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log('Response:', response);
      if (response.code === 0 && response.data.audio) {
        const audioData = toByteArray(response.data.audio);
        const blob = new Blob([audioData], { type: 'audio/mp3' }); // Still MP3, as "lame" outputs MP3
        const url = URL.createObjectURL(blob);
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play();
      } else {
        toast({
          title: "Lỗi tổng hợp giọng nói",
          description: response.message || "Không thể tổng hợp giọng nói",
          variant: "destructive",
        });
        setIsSpeaking(false);
      }
    };
  
    websocketRef.current.onerror = (err) => {
      console.error('WebSocket Error:', err);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến iFLYTEK TTS",
        variant: "destructive",
      });
      setIsSpeaking(false);
    };
  };
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    setIsSpeaking(false);
    audioQueueRef.current = [];
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 border-2 border-[#E8A8FF] rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 bg-[#E8A8FF] text-black flex justify-between items-center">
        <h2 className="text-base font-medium">Support Chat</h2>
      </div>

      <div className="h-64 overflow-y-auto p-3 space-y-4 bg-white">
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Chưa có tin nhắn nào. Hãy đặt câu hỏi!
          </div>
        ) : (
          history.map((msg, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-secondary/50 p-2 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Bạn:</span> {msg.question}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg flex justify-between items-center">
                <p className="text-sm flex-1">
                  <span className="font-semibold">Support:</span> {msg.result}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-6 w-6 shrink-0 text-[#E8A8FF]"
                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(msg.result))}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi của bạn"
            className="pr-8"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full text-[#E8A8FF]"
            onClick={toggleListening}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button type="submit" className="bg-[#E8A8FF] text-black">
          Gửi
        </Button>
      </form>
    </div>
  );
};

export default SupportChat;