import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface VoiceOption {
  name: string;
  value: string;
  lang: string;
}

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Function to load and set available voices
      const loadVoices = () => {
        const voices = speechSynthesisRef.current?.getVoices() || [];
        const voiceOptions: VoiceOption[] = voices.map((voice) => ({
          name: voice.name,
          value: voice.name,
          lang: voice.lang,
        }));
        
        setAvailableVoices(voiceOptions);
        
        // Set default voice if available
        if (voiceOptions.length > 0 && !selectedVoice) {
          setSelectedVoice(voiceOptions[0].value);
        }
      };
      
      // Chrome loads voices asynchronously
      if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
        speechSynthesisRef.current.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
    
    return () => {
      if (utteranceRef.current && speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Handle speech synthesis events
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utteranceRef.current.onpause = () => {
        setIsPaused(true);
      };
      
      utteranceRef.current.onresume = () => {
        setIsPaused(false);
      };
      
      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utteranceRef.current.onerror = (event) => {
        console.error("SpeechSynthesis error:", event);
        toast({
          title: "Speech Synthesis Error",
          description: "There was an error playing the speech.",
          variant: "destructive",
        });
        setIsPlaying(false);
        setIsPaused(false);
      };
    }
  }, [utteranceRef.current, toast]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handlePlayPause = () => {
    if (!speechSynthesisRef.current) return;
    
    if (isPlaying) {
      if (isPaused) {
        speechSynthesisRef.current.resume();
        setIsPaused(false);
      } else {
        speechSynthesisRef.current.pause();
        setIsPaused(true);
      }
    } else {
      if (!text.trim()) {
        toast({
          title: "Empty Text",
          description: "Please enter some text to speak.",
          variant: "destructive",
        });
        return;
      }
      
      // Cancel any existing speech
      speechSynthesisRef.current.cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Set speech properties
      utterance.volume = volume[0] / 100;
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];
      
      // Set selected voice
      const voices = speechSynthesisRef.current.getVoices();
      const selectedVoiceObj = voices.find((voice) => voice.name === selectedVoice);
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
      
      // Setup event handlers
      utterance.onstart = () => setIsPlaying(true);
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      // Play speech
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const handleStop = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (utteranceRef.current) {
      utteranceRef.current.volume = value[0] / 100;
    }
    setIsMuted(value[0] === 0);
  };

  const handleRateChange = (value: number[]) => {
    setRate(value);
    if (utteranceRef.current) {
      utteranceRef.current.rate = value[0];
    }
  };

  const handlePitchChange = (value: number[]) => {
    setPitch(value);
    if (utteranceRef.current) {
      utteranceRef.current.pitch = value[0];
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute - restore previous volume
      setVolume([50]);
      if (utteranceRef.current) {
        utteranceRef.current.volume = 0.5;
      }
    } else {
      // Mute
      setVolume([0]);
      if (utteranceRef.current) {
        utteranceRef.current.volume = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 animate-fade-in">
      <Card className="shadow-lg border-0 overflow-hidden bg-white/90 dark:bg-black/70 backdrop-blur-lg">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-2xl font-medium tracking-tight">Text to Speech</CardTitle>
          <CardDescription>Enter text and convert it to spoken audio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label htmlFor="text-input" className="text-sm font-medium leading-none">
              Text
            </label>
            <Textarea
              id="text-input"
              placeholder="Enter text to convert to speech..."
              className="w-full min-h-32 resize-y border border-input focus:ring-1 focus:ring-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
              value={text}
              onChange={handleTextChange}
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Voice</label>
              <Select 
                value={selectedVoice} 
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="volume-slider" className="text-sm font-medium leading-none">
                    Volume
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <Slider
                  id="volume-slider"
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rate-slider" className="text-sm font-medium leading-none">
                  Speed: {rate[0].toFixed(1)}x
                </label>
                <Slider
                  id="rate-slider"
                  value={rate}
                  onValueChange={handleRateChange}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="pitch-slider" className="text-sm font-medium leading-none">
                  Pitch: {pitch[0].toFixed(1)}
                </label>
                <Slider
                  id="pitch-slider"
                  value={pitch}
                  onValueChange={handlePitchChange}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4 pb-4 mt-2">
          <Button
            variant="outline"
            onClick={handleStop}
            disabled={!isPlaying}
            className="transition-all hover:bg-destructive hover:text-destructive-foreground"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Stop
          </Button>
          
          <Button 
            onClick={handlePlayPause} 
            className="px-6 transition-all"
            disabled={speechSynthesisRef.current === null}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : isPlaying && isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Speak
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TextToSpeech;