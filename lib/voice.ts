// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((ev: Event) => any) | null;
  onresult: ((ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((ev: Event) => any) | null;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Voice service for AI Assistant
export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null && this.synthesis !== null;
  }

  public startListening(
    onTranscript: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      onTranscript(fullTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError('Failed to start speech recognition');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.currentUtterance = null;
      onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.currentUtterance !== null;
  }
}

// Create a singleton instance
export const voiceService = new VoiceService(); 