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
  private isInitialized: boolean = false;

  constructor() {
    this.initializeVoiceService();
  }

  private initializeVoiceService() {
    if (typeof window === 'undefined') {
      console.log('VoiceService: Running on server side, skipping initialization');
      return;
    }

    console.log('VoiceService: Initializing voice service...');
    
    // Check if we're on HTTPS (required for speech recognition)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('VoiceService: Speech recognition requires HTTPS (except on localhost)');
    }

    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    
    this.isInitialized = true;
    console.log('VoiceService: Initialization complete');
  }

  private initializeSpeechRecognition() {
    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        console.log('VoiceService: Speech recognition initialized successfully');
      } else {
        console.error('VoiceService: Speech recognition not supported in this browser');
      }
    } catch (error) {
      console.error('VoiceService: Error initializing speech recognition:', error);
    }
  }

  private initializeSpeechSynthesis() {
    try {
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        
        // Check if speech synthesis is actually available
        if (this.synthesis.getVoices().length > 0) {
          console.log('VoiceService: Speech synthesis initialized successfully');
        } else {
          // Wait for voices to load
          this.synthesis.onvoiceschanged = () => {
            console.log('VoiceService: Voices loaded, count:', this.synthesis?.getVoices().length);
          };
        }
      } else {
        console.error('VoiceService: Speech synthesis not supported in this browser');
      }
    } catch (error) {
      console.error('VoiceService: Error initializing speech synthesis:', error);
    }
  }

  public isSupported(): boolean {
    const recognitionSupported = this.recognition !== null;
    const synthesisSupported = this.synthesis !== null;
    
    console.log('VoiceService: Support check - Recognition:', recognitionSupported, 'Synthesis:', synthesisSupported);
    
    return recognitionSupported && synthesisSupported;
  }

  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        console.error('VoiceService: MediaDevices not supported');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('VoiceService: Microphone permission granted');
      return true;
    } catch (error) {
      console.error('VoiceService: Microphone permission denied:', error);
      return false;
    }
  }

  public startListening(
    onTranscript: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      const error = 'Speech recognition not supported';
      console.error('VoiceService:', error);
      onError(error);
      return;
    }

    // Request microphone permission first
    this.requestMicrophonePermission().then(hasPermission => {
      if (!hasPermission) {
        const error = 'Microphone permission denied. Please allow microphone access and try again.';
        console.error('VoiceService:', error);
        onError(error);
        return;
      }

      this.recognition.onstart = () => {
        console.log('VoiceService: Speech recognition started');
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
        console.log('VoiceService: Transcript received:', fullTranscript);
        onTranscript(fullTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('VoiceService: Speech recognition error:', event.error);
        onError(event.error);
      };

      this.recognition.onend = () => {
        console.log('VoiceService: Speech recognition ended');
        onEnd();
      };

      try {
        this.recognition.start();
      } catch (error) {
        const errorMsg = 'Failed to start speech recognition';
        console.error('VoiceService:', errorMsg, error);
        onError(errorMsg);
      }
    });
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('VoiceService: Speech recognition stopped');
      } catch (error) {
        console.error('VoiceService: Error stopping speech recognition:', error);
      }
    }
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synthesis) {
      const error = 'Speech synthesis not supported';
      console.error('VoiceService:', error);
      onEnd?.();
      return;
    }

    // Stop any current speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    utterance.lang = 'en-US';

    // Try to get a good voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('VoiceService: Using voice:', preferredVoice.name);
    }

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      console.log('VoiceService: Speech synthesis started');
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      console.log('VoiceService: Speech synthesis ended');
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('VoiceService: Speech synthesis error:', event.error);
      this.currentUtterance = null;
      onEnd?.();
    };

    try {
      this.synthesis.speak(utterance);
      console.log('VoiceService: Speech synthesis initiated');
    } catch (error) {
      console.error('VoiceService: Error starting speech synthesis:', error);
      onEnd?.();
    }
  }

  public stopSpeaking(): void {
    if (this.synthesis && this.currentUtterance) {
      try {
        this.synthesis.cancel();
        this.currentUtterance = null;
        console.log('VoiceService: Speech synthesis stopped');
      } catch (error) {
        console.error('VoiceService: Error stopping speech synthesis:', error);
      }
    }
  }

  public isSpeaking(): boolean {
    return this.currentUtterance !== null;
  }

  public getDebugInfo(): any {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
    const isEdge = userAgent.includes('Edg');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    
    return {
      isInitialized: this.isInitialized,
      recognitionSupported: this.recognition !== null,
      synthesisSupported: this.synthesis !== null,
      isSpeaking: this.isSpeaking(),
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      userAgent: userAgent,
      browser: {
        isChrome,
        isEdge,
        isFirefox,
        isSafari,
        recommended: isChrome || isEdge
      },
      voicesCount: this.synthesis ? this.synthesis.getVoices().length : 0,
      recommendations: this.getRecommendations()
    };
  }

  private getRecommendations(): string[] {
    const recommendations = [];
    
    if (typeof window !== 'undefined') {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        recommendations.push('Use HTTPS for production (voice recognition requires it)');
      }
      
      const userAgent = navigator.userAgent;
      if (!userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        recommendations.push('Use Chrome or Edge for best voice support');
      }
      
      if (userAgent.includes('Firefox')) {
        recommendations.push('Firefox has limited voice support - try Chrome or Edge');
      }
    }
    
    if (!this.recognition) {
      recommendations.push('Speech recognition not supported in this browser');
    }
    
    if (!this.synthesis) {
      recommendations.push('Speech synthesis not supported in this browser');
    }
    
    return recommendations;
  }
}

// Create a singleton instance
export const voiceService = new VoiceService(); 