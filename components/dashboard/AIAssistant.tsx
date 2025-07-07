'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  MessageSquare,
  Lightbulb,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Trash2,
  Video,
  Play,
  Pause,
  X,
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import { callGeminiAPI, prepareImageForGemini } from '@/lib/gemini';
import { voiceService, VoiceState } from '@/lib/voice';
import { VoiceAnimation } from '@/components/ui/voice-animation';
import { weatherService } from '@/lib/weather';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  image?: string;
  isStreaming?: boolean;
  fullContent?: string;
}

interface LiveAssistantState {
  isActive: boolean;
  isPaused: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  lastProcessedTranscript: string;
  micEnabled: boolean;
  silenceTimer: number;
}

interface CameraState {
  isOpen: boolean;
  isCaptured: boolean;
  capturedImage: string | null;
  stream: MediaStream | null;
}

export function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    let stored = sessionStorage.getItem('agrisense_chat_history');
    if (!stored) {
      stored = localStorage.getItem('agrisense_chat_history');
    }
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: voiceService.isSupported(),
    transcript: '',
    error: null
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Live Assistant State
  const [liveAssistant, setLiveAssistant] = useState<LiveAssistantState>({
    isActive: false,
    isPaused: false,
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    error: null,
    lastProcessedTranscript: '',
    micEnabled: true,
    silenceTimer: 0
  });

  // Camera State
  const [cameraState, setCameraState] = useState<CameraState>({
    isOpen: false,
    isCaptured: false,
    capturedImage: null,
    stream: null
  });

  // Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
  }>({
    isOpen: false,
    imageUrl: null
  });

  // Pasted Image State
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const micToggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const allQuickQuestions = [
    'How to prevent leaf blight in tomatoes?',
    'Best fertilizer for wheat crops?',
    'When to plant rice in monsoon?',
    'Organic pest control methods?',
    'Soil pH for potato farming?',
    'Water management techniques?',
    'Crop rotation benefits?',
    'Natural fertilizers for vegetables?',
    'How to identify crop diseases?',
    'Best time to harvest corn?',
    'Composting techniques for farming?',
    'Drip irrigation setup guide?',
    'Pest-resistant crop varieties?',
    'Soil testing methods?',
    'Greenhouse farming tips?',
    'Sustainable farming practices?',
    'Weather impact on crops?',
    'Seed storage best practices?',
    'Crop yield optimization?',
    'Farm equipment maintenance?'
  ];

  // Get random questions
  const getRandomQuestions = () => {
    const shuffled = [...allQuickQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const [quickQuestions, setQuickQuestions] = useState(getRandomQuestions());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (micToggleTimeoutRef.current) {
        clearTimeout(micToggleTimeoutRef.current);
      }
    };
  }, []);

  // Handle video element setup when camera state changes
  useEffect(() => {
    if (cameraState.isOpen && cameraState.stream && cameraVideoRef.current) {
      const videoElement = cameraVideoRef.current;
      
      // Set up video element
      videoElement.srcObject = cameraState.stream;
      
      // Handle video events
      const handleLoadedMetadata = async () => {
        try {
          console.log('Video metadata loaded, starting play...');
          await videoElement.play();
          console.log('Camera started successfully');
        } catch (playError) {
          console.error('Error playing video:', playError);
          setLiveAssistant(prev => ({ ...prev, error: 'Could not start camera feed.' }));
        }
      };
      
      const handleError = (error: Event) => {
        console.error('Video error:', error);
        setLiveAssistant(prev => ({ ...prev, error: 'Camera video error occurred.' }));
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('error', handleError);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [cameraState.isOpen, cameraState.stream, cameraState.isCaptured]);

  // Live Assistant Functions
  const startLiveAssistant = async () => {
    setLiveAssistant(prev => ({ 
      ...prev, 
      isActive: true, 
      isPaused: false,
      transcript: '',
      lastProcessedTranscript: '',
      micEnabled: true
    }));
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hello! I'm your live AgriSense assistant. I can see and hear you. What would you like help with today?",
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, welcomeMessage]);
    
    // Speak welcome message and then start listening
    await speakResponse(welcomeMessage.content);
    
    // Start listening after speaking is done
    setTimeout(() => {
      if (liveAssistant.isActive && !liveAssistant.isPaused && liveAssistant.micEnabled) {
        startLiveListening();
      }
    }, 1000);
  };

  const stopLiveAssistant = () => {
    setLiveAssistant(prev => ({ 
      ...prev, 
      isActive: false, 
      isPaused: false, 
      isListening: false,
      isProcessing: false,
      isSpeaking: false 
    }));
    voiceService.stopListening();
    voiceService.stopSpeaking();
    
    // Clear all timeouts
    clearAllTimeouts();
  };

  const clearAllTimeouts = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (micToggleTimeoutRef.current) {
      clearTimeout(micToggleTimeoutRef.current);
      micToggleTimeoutRef.current = null;
    }
  };

  const toggleLivePause = () => {
    if (liveAssistant.isPaused) {
      // Resume
      setLiveAssistant(prev => ({ ...prev, isPaused: false }));
      if (liveAssistant.micEnabled) {
        startLiveListening();
      }
    } else {
      // Pause - stop both listening and speaking
      setLiveAssistant(prev => ({ 
        ...prev, 
        isPaused: true, 
        isListening: false,
        isSpeaking: false 
      }));
      voiceService.stopListening();
      voiceService.stopSpeaking();
      clearAllTimeouts();
    }
  };

  const toggleMic = () => {
    const newMicState = !liveAssistant.micEnabled;
    console.log('=== MIC TOGGLE DEBUG ===');
    console.log('Current mic state:', liveAssistant.micEnabled);
    console.log('New mic state:', newMicState);
    console.log('Live assistant state:', {
      isActive: liveAssistant.isActive,
      isPaused: liveAssistant.isPaused,
      isListening: liveAssistant.isListening,
      isProcessing: liveAssistant.isProcessing,
      isSpeaking: liveAssistant.isSpeaking
    });
    console.log('Voice service supported:', voiceService.isSupported());
    
    if (newMicState) {
      // Enable mic - start listening immediately
      console.log('Enabling mic and starting listening...');
      if (liveAssistant.isActive && !liveAssistant.isPaused) {
        // If AI is currently speaking, stop it first
        if (liveAssistant.isSpeaking) {
          console.log('Stopping AI speech to start listening');
          voiceService.stopSpeaking();
        }
        
        // Update state and start listening
        setLiveAssistant(prev => ({ 
          ...prev, 
          micEnabled: true,
          isSpeaking: false
        }));
        
        // Start listening immediately with a small delay to ensure state is updated
        setTimeout(() => {
          console.log('Starting listening immediately');
          startLiveListening();
        }, 50);
      } else {
        console.log('Cannot start listening - assistant not active or paused');
        setLiveAssistant(prev => ({ ...prev, micEnabled: true }));
      }
    } else {
      // Disable mic - stop listening and any ongoing processes
      console.log('Disabling mic - stopping listening and speech');
      setLiveAssistant(prev => ({ 
        ...prev, 
        micEnabled: false,
        isListening: false,
        isSpeaking: false,
        transcript: ''
      }));
      
      // Stop both listening and speaking
      voiceService.stopListening();
      voiceService.stopSpeaking();
      
      // Clear all timeouts
      clearAllTimeouts();
    }
  };

  const startLiveListening = async () => {
    // Get current state using a callback to avoid stale state
    setLiveAssistant(currentState => {
      console.log('startLiveListening called with state:', {
        isSupported: voiceService.isSupported(),
        isPaused: currentState.isPaused,
        micEnabled: currentState.micEnabled,
        isListening: currentState.isListening,
        isProcessing: currentState.isProcessing
      });

      if (!voiceService.isSupported()) {
        console.error('Voice service not supported');
        return { ...currentState, error: 'Voice recognition not supported' };
      }

      if (currentState.isPaused) {
        console.log('Assistant is paused, not starting listening');
        return currentState;
      }

      // Only check mic enabled if not manually triggered
      if (!currentState.micEnabled) {
        console.log('Mic not enabled, not starting listening');
        return currentState;
      }

      // Don't start if already listening or processing
      if (currentState.isListening) {
        console.log('Already listening, not starting again');
        return currentState;
      }

      if (currentState.isProcessing) {
        console.log('Currently processing, not starting listening');
        return currentState;
      }

      console.log('Starting live listening...');
      
      // Start the actual listening process
      setTimeout(() => {
        startListeningProcess();
      }, 0);

      return { 
        ...currentState, 
        isListening: true, 
        transcript: '', 
        error: null 
      };
    });
  };

  const startListeningProcess = () => {
    // Start silence timer
    startSilenceTimer();

    try {
      voiceService.startListening(
        (transcript) => {
          console.log('Transcript received:', transcript);
          setLiveAssistant(prev => ({ ...prev, transcript }));
          
          // Reset silence timer when user speaks
          resetSilenceTimer();
          
          // Clear previous timeout
          if (transcriptTimeoutRef.current) {
            clearTimeout(transcriptTimeoutRef.current);
          }
          
          // Set timeout to process transcript after user stops speaking
          transcriptTimeoutRef.current = setTimeout(() => {
            setLiveAssistant(currentState => {
              if (transcript.trim() && transcript !== currentState.lastProcessedTranscript) {
                console.log('Processing transcript:', transcript);
                handleLiveInput(transcript);
              }
              return currentState;
            });
          }, 1500); // Wait 1.5 seconds after user stops speaking
        },
        (error) => {
          console.error('Listening error:', error);
          setLiveAssistant(prev => ({ ...prev, error, isListening: false }));
          clearAllTimeouts();
        },
        () => {
          console.log('Listening ended');
          setLiveAssistant(currentState => {
            const newState = { ...currentState, isListening: false };
            
            // Only restart listening if assistant is still active and not paused/processing/speaking and mic is enabled
            if (currentState.isActive && !currentState.isPaused && !currentState.isProcessing && !currentState.isSpeaking && currentState.micEnabled) {
              listeningTimeoutRef.current = setTimeout(() => {
                startLiveListening();
              }, 1000);
            }
            
            return newState;
          });
        }
      );
    } catch (error) {
      console.error('Error starting voice service:', error);
      setLiveAssistant(prev => ({ 
        ...prev, 
        error: 'Failed to start voice recognition',
        isListening: false 
      }));
    }
  };

  const startSilenceTimer = () => {
    // Stop listening after 10 seconds of silence
    silenceTimeoutRef.current = setTimeout(() => {
      if (liveAssistant.isListening && liveAssistant.transcript.trim() === '') {
        setLiveAssistant(prev => ({ ...prev, isListening: false }));
        voiceService.stopListening();
        
        // Restart listening after a short delay
        setTimeout(() => {
          if (liveAssistant.isActive && !liveAssistant.isPaused && liveAssistant.micEnabled) {
            startLiveListening();
          }
        }, 2000);
      }
    }, 10000); // 10 seconds
  };

  const resetSilenceTimer = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    startSilenceTimer();
  };

  const handleLiveInput = async (input: string) => {
    // Prevent duplicate processing
    if (liveAssistant.isProcessing || liveAssistant.isSpeaking || input === liveAssistant.lastProcessedTranscript) {
      return;
    }

    setLiveAssistant(prev => ({ 
      ...prev, 
      isProcessing: true, 
      isListening: false,
      lastProcessedTranscript: input 
    }));
    
    // Stop listening while processing
    voiceService.stopListening();
    
    // Clear any pending timeouts
    clearAllTimeouts();
    
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: 'user',
      content: input,
        timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await callGeminiAPI(input);
      
      if (response.success && response.content) {
        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '',
          timestamp: new Date().toISOString(),
          isStreaming: true,
          fullContent: response.content!
        };
        
        setChatHistory(prev => [...prev, botResponse]);
        
        // Start streaming the response
        streamResponse(response.content!, botResponse.id);
        
        // Speak the full response after streaming
        setTimeout(() => {
          speakResponse(response.content!);
        }, response.content!.split(' ').length * 50 + 500);
      } else {
        const errorResponse: ChatMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setLiveAssistant(prev => ({ ...prev, isProcessing: false }));
      
      // Resume listening after streaming completes
      setTimeout(() => {
        if (liveAssistant.isActive && !liveAssistant.isPaused && liveAssistant.micEnabled) {
          startLiveListening();
        }
      }, 2000); // Increased delay to account for streaming
    }
  };

  // Camera Functions
  const openCamera = async () => {
    try {
      console.log('Opening camera...');
      
      // First set the camera state to open
      setCameraState(prev => ({ 
        ...prev, 
        isOpen: true, 
        isCaptured: false,
        capturedImage: null
      }));

      // Request camera access with more flexible constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 }, 
          facingMode: "user" 
        },
        audio: false
      });
      
      console.log('Camera stream obtained:', stream);
      
      // Update state with stream
      setCameraState(prev => ({ 
        ...prev, 
        stream
      }));
      
      // Use a longer delay to ensure DOM is updated
      setTimeout(async () => {
        const videoElement = cameraVideoRef.current;
        if (videoElement) {
          try {
            console.log('Setting video srcObject...');
            videoElement.srcObject = stream;
            
            // Wait for video to be ready
            videoElement.onloadedmetadata = async () => {
              try {
                console.log('Video metadata loaded, starting play...');
                await videoElement.play();
                console.log('Camera started successfully');
              } catch (playError) {
                console.error('Error playing video:', playError);
                setLiveAssistant(prev => ({ ...prev, error: 'Could not start camera feed.' }));
              }
            };
            
            videoElement.onerror = (error) => {
              console.error('Video error:', error);
              setLiveAssistant(prev => ({ ...prev, error: 'Camera video error occurred.' }));
            };
            
          } catch (playError) {
            console.error('Error setting video srcObject:', playError);
            setLiveAssistant(prev => ({ ...prev, error: 'Could not start camera feed.' }));
          }
        } else {
          console.error('Video element not found');
          setLiveAssistant(prev => ({ ...prev, error: 'Camera element not found.' }));
        }
      }, 200);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Could not access camera. Please check permissions.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on your device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
      }
      
      setLiveAssistant(prev => ({ ...prev, error: errorMessage }));
      
      // Reset camera state on error
      setCameraState(prev => ({ 
        ...prev, 
        isOpen: false, 
        stream: null 
      }));
    }
  };

  const closeCamera = () => {
    console.log('Closing camera...');
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
    }
    
    // Clear video element
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    
    setCameraState(prev => ({ 
      ...prev, 
      isOpen: false, 
      stream: null,
      isCaptured: false,
      capturedImage: null
    }));
  };

  const captureImage = () => {
    console.log('Capturing image...');
    if (cameraVideoRef.current && canvasRef.current) {
      const video = cameraVideoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCameraState(prev => ({ 
          ...prev, 
          isCaptured: true, 
          capturedImage: imageData 
        }));
        console.log('Image captured successfully');
      } else {
        console.error('Video not ready for capture');
        setLiveAssistant(prev => ({ ...prev, error: 'Camera not ready for capture.' }));
      }
    } else {
      console.error('Video or canvas element not found');
      setLiveAssistant(prev => ({ ...prev, error: 'Camera elements not found.' }));
    }
  };

  const sendCapturedImage = async () => {
    if (!cameraState.capturedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: "I've captured an image. Can you analyze this for me?",
      timestamp: new Date().toISOString(),
      image: cameraState.capturedImage
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setLiveAssistant(prev => ({ ...prev, isProcessing: true }));

    // Close camera immediately when sending to AI
    closeCamera();

    try {
      // Prepare the image for Gemini API
      const imageInput = prepareImageForGemini(cameraState.capturedImage, 'image/jpeg');
      
      // Send both text and image to the API
      const response = await callGeminiAPI(
        "Analyze this image and tell me in detail: what is the disease, what caused it, how to solve it, and how to avoid it?",
        [imageInput]
      );
      
      if (response.success && response.content) {
        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: '',
          timestamp: new Date().toISOString(),
          isStreaming: true,
          fullContent: response.content!
        };
        
        setChatHistory(prev => [...prev, botResponse]);
        
        // Start streaming the response
        streamResponse(response.content!, botResponse.id);
        
        // Only speak the response if live assistant is active
        if (liveAssistant.isActive) {
          setTimeout(() => {
            speakResponse(response.content!);
          }, response.content!.split(' ').length * 50 + 500);
        }
      } else {
        const errorResponse: ChatMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.error || 'Sorry, I couldn\'t analyze the image. Please try again.',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorResponse: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while analyzing the image. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setLiveAssistant(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const retakeImage = () => {
    console.log('Retaking image...');
    
    // Reset the captured state
    setCameraState(prev => ({ 
      ...prev, 
      isCaptured: false, 
      capturedImage: null 
    }));
    
    // Force a re-render and video restart
    setTimeout(() => {
      if (cameraVideoRef.current && cameraState.stream) {
        const videoElement = cameraVideoRef.current;
        
        // Pause and reset video
        videoElement.pause();
        videoElement.currentTime = 0;
        
        // Re-set the video source to force restart
        videoElement.srcObject = null;
        setTimeout(() => {
          videoElement.srcObject = cameraState.stream;
          
          // Restart video playback
          videoElement.play().catch(error => {
            console.error('Error restarting video:', error);
            setLiveAssistant(prev => ({ ...prev, error: 'Could not restart camera feed.' }));
          });
          
          console.log('Camera feed restarted for retake');
        }, 50);
      }
    }, 100);
  };

  // Lightbox functions
  const openImageLightbox = (imageUrl: string) => {
    setLightboxState({
      isOpen: true,
      imageUrl
    });
  };

  const closeImageLightbox = () => {
    setLightboxState({
      isOpen: false,
      imageUrl: null
    });
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `agrisense-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle pasted images
  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setPastedImage(result);
          };
          reader.readAsDataURL(file);
          event.preventDefault();
          break;
        }
      }
    }
  };

  const removePastedImage = () => {
    setPastedImage(null);
  };

  // Voice functions
  const speakResponse = async (text: string): Promise<void> => {
    if (!voiceEnabled || liveAssistant.isPaused) return;
    
    setLiveAssistant(prev => ({ ...prev, isSpeaking: true }));
    
    // Clean the text for speech (remove markdown characters)
    const cleanedText = cleanSpeechText(text);
    
    return new Promise((resolve) => {
      voiceService.speak(
        cleanedText,
        () => {
          // Speech started
        },
        () => {
          setLiveAssistant(prev => ({ ...prev, isSpeaking: false }));
          resolve();
        }
      );
    });
  };

  // Regular chat functions
  const handleSendMessage = async () => {
    if ((message.trim() || pastedImage) && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now(),
        type: 'user',
        content: message || (pastedImage ? "I've shared an image. Can you analyze this for me?" : ""),
        timestamp: new Date().toISOString(),
        image: pastedImage || undefined
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      setMessage('');
      setPastedImage(null); // Clear pasted image
      setIsLoading(true);
      setIsTyping(true);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.blur();
        }
      }, 0);

      const typingMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true
      };
      
      setChatHistory(prev => [...prev, typingMessage]);

      // AI Agent: Weather & Forecast
      if ((isWeatherQuestion(userMessage.content) || isForecastQuestion(userMessage.content)) && !pastedImage) {
        try {
          let locationString = extractLocation(userMessage.content);
          if (!locationString) {
            // Try to get user's current location
            try {
              const position = await weatherService.getCurrentPosition();
              locationString = `${position.coords.latitude},${position.coords.longitude}`;
            } catch {
              locationString = 'Mumbai'; // fallback
            }
          }
          if (isForecastQuestion(userMessage.content)) {
            // Forecast logic
            const days = extractForecastDays(userMessage.content);
            const forecast = await weatherService.getWeatherForecast(locationString, days);
            let responseText = `Here's the ${days}-day forecast for ${locationString} (showing up to 7 days):\n\n`;
            responseText += forecast.slice(0, days).map(day =>
              `- ${day.date}: ${day.condition}, High: ${day.maxTemp}°C, Low: ${day.minTemp}°C, Rain: ${day.chanceOfRain}%`
            ).join('\n');
            setChatHistory(prev => {
              const filtered = prev.filter(msg => !msg.isLoading);
              return [...filtered, {
                id: Date.now() + 2,
                type: 'bot',
                content: responseText,
                timestamp: new Date().toISOString()
              }];
            });
          } else {
            // Current weather logic
            const weather = await weatherService.getCurrentWeather(locationString);
            const responseText = `Here's the current weather for ${weather.location}, ${weather.country}:\n\n` +
              `- Condition: ${weather.description}\n` +
              `- Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n` +
              `- Humidity: ${weather.humidity}%\n` +
              `- Wind Speed: ${weather.windSpeed} km/h\n` +
              `- UV Index: ${weather.uvIndex}\n` +
              `- Last updated: ${weather.lastUpdated}`;
            setChatHistory(prev => {
              const filtered = prev.filter(msg => !msg.isLoading);
              return [...filtered, {
                id: Date.now() + 2,
                type: 'bot',
                content: responseText,
                timestamp: new Date().toISOString()
              }];
            });
          }
        } catch (error) {
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.isLoading);
            return [...filtered, {
              id: Date.now() + 2,
              type: 'bot',
              content: 'Sorry, I could not fetch the weather or forecast right now.',
              timestamp: new Date().toISOString()
            }];
          });
        } finally {
          setIsLoading(false);
          setIsTyping(false);
        }
        return;
      }

      try {
        let response;
        
        if (pastedImage) {
          // Prepare the pasted image for Gemini API
          const imageInput = prepareImageForGemini(pastedImage, 'image/jpeg');
          
          // Send both text and image to the API
          response = await callGeminiAPI(
            message || "Analyze this image and tell me in detail: what is the disease, what caused it, how to solve it, and how to avoid it?",
            [imageInput]
          );
        } else {
          // Text-only message
          response = await callGeminiAPI(message);
        }
        
        if (response.success && response.content) {
          const botResponse = {
            id: Date.now() + 2,
            type: 'bot' as const,
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true,
            fullContent: response.content!
          };
          
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.isLoading);
            return [...filtered, botResponse];
          });
          
          // Start streaming the response
          streamResponse(response.content!, botResponse.id);
          
          // Only speak the response if live assistant is active
          if (liveAssistant.isActive) {
            setTimeout(() => {
              speakResponse(response.content!);
            }, response.content!.split(' ').length * 50 + 500); // Wait for streaming to complete
          }
        } else {
          setChatHistory(prev => {
            const filtered = prev.filter(msg => !msg.isLoading);
            return [...filtered, {
              id: Date.now() + 2,
              type: 'bot',
              content: 'Sorry, I encountered an error. Please try again or check your internet connection.',
              timestamp: new Date().toISOString()
            }];
          });
        }
      } catch (error) {
        setChatHistory(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          return [...filtered, {
            id: Date.now() + 2,
            type: 'bot',
            content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
            timestamp: new Date().toISOString()
          }];
        });
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentScrollY = window.scrollY;
    handleSendMessage();
    
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const clearChat = () => {
    setChatHistory([]);
    // Generate new random questions when chat is cleared
    setQuickQuestions(getRandomQuestions());
  };

  const testVoiceService = () => {
    console.log('=== VOICE SERVICE TEST ===');
    console.log('Voice service supported:', voiceService.isSupported());
    
    // Test microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Microphone access granted:', stream);
        stream.getTracks().forEach(track => track.stop());
        
        // Test voice service
        if (voiceService.isSupported()) {
          console.log('Testing voice service...');
    voiceService.startListening(
      (transcript) => {
              console.log('Test transcript received:', transcript);
              setLiveAssistant(prev => ({ ...prev, transcript: `Test: ${transcript}` }));
      },
      (error) => {
              console.error('Test listening error:', error);
              setLiveAssistant(prev => ({ ...prev, error: `Test error: ${error}` }));
      },
      () => {
              console.log('Test listening ended');
      }
    );

          // Stop after 5 seconds
          setTimeout(() => {
    voiceService.stopListening();
            console.log('Test listening stopped');
          }, 5000);
        } else {
          console.error('Voice service not supported');
          setLiveAssistant(prev => ({ ...prev, error: 'Voice service not supported' }));
        }
      })
      .catch(error => {
        console.error('Microphone access denied:', error);
        setLiveAssistant(prev => ({ ...prev, error: `Microphone access denied: ${error.message}` }));
      });
  };

  const formatMarkdown = (text: string): string => {
    // Convert markdown to HTML-like formatting
    return text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code: `text` -> <code>text</code>
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  const cleanSpeechText = (text: string): string => {
    // Remove markdown characters for speech
    return text
      // Remove bold markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic markers
      .replace(/\*(.*?)\*/g, '$1')
      // Remove code markers
      .replace(/`(.*?)`/g, '$1')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Streaming function to simulate typing effect
  const streamResponse = (fullContent: string, messageId: number) => {
    const words = fullContent.split(' ');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const currentContent = words.slice(0, currentIndex + 1).join(' ');
        setChatHistory(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: currentContent, isStreaming: true }
              : msg
          )
        );
        currentIndex++;
    } else {
        // Streaming complete
        setChatHistory(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isStreaming: false, fullContent: fullContent }
              : msg
          )
        );
        clearInterval(streamInterval);
      }
    }, 50); // Adjust speed here (lower = faster)
  };

  // Utility: Detect if a message is a weather question
  function isWeatherQuestion(text: string) {
    return /\b(weather|temperature|forecast|rain|humidity|wind|climate|uv index|sunny|cloudy|storm|rainfall|heat|cold|snow)\b/i.test(text);
  }

  // Utility: Extract location from user message (e.g., 'weather in Kolkata' => 'Kolkata')
  function extractLocation(text: string): string | null {
    // Look for 'in <location>' or 'at <location>'
    const match = text.match(/\b(?:in|at|for|of)\s+([A-Za-z\s,]+)/i);
    if (match && match[1]) {
      // Clean up the location string
      return match[1].replace(/\?$/, '').trim();
    }
    // Try to match a city/country name at the end (e.g., 'Kolkata', 'Delhi, India')
    const cityMatch = text.match(/weather\s+(?:in|at|for)?\s*([A-Za-z\s,]+)$/i);
    if (cityMatch && cityMatch[1]) {
      return cityMatch[1].replace(/\?$/, '').trim();
    }
    return null;
  }

  // Utility: Detect if a message is a forecast question
  function isForecastQuestion(text: string) {
    return /\b(forecast|next \d+ days|tomorrow|week|rain tomorrow|weather for \d+ days|weather next week)\b/i.test(text);
  }

  // Utility: Extract number of days for forecast
  function extractForecastDays(text: string): number {
    // e.g., 'next 5 days', 'forecast for 7 days'
    const match = text.match(/(?:next|for)\s*(\d{1,2})\s*days?/i);
    if (match && match[1]) {
      return Math.max(1, Math.min(7, parseInt(match[1], 10)));
    }
    if (/tomorrow/i.test(text)) return 2;
    if (/week/i.test(text)) return 7;
    return 3; // default
  }

  // Save chat history to sessionStorage and localStorage on update
  useEffect(() => {
    const data = JSON.stringify(chatHistory);
    sessionStorage.setItem('agrisense_chat_history', data);
    localStorage.setItem('agrisense_chat_history', data);
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="flex items-center gap-2"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 pb-24">
        <div className="space-y-3 p-2">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      chat.type === 'user' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700'
                    }`}>
                      {chat.type === 'bot' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1 rounded-full">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">AgriSense AI</span>
                        </div>
                      )}
                      {chat.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      ) : (
                  <div className="text-sm leading-relaxed">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: chat.type === 'bot' ? formatMarkdown(chat.content) : chat.content 
                      }}
                    />
                    {chat.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"></span>
                    )}
                  </div>
                )}
                {chat.image && (
                  <div className="mt-3">
                    <img 
                      src={chat.image} 
                      alt="Captured image" 
                      className="w-[350px] max-w-[90vw] h-auto rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageLightbox(chat.image!)}
                    />
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(chat.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
          {/* Quick Questions Section - ChatGPT Style */}
          {chatHistory.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="max-w-2xl w-full space-y-6 px-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a topic to get started with farming advice</p>
                </div>
                
                                    <div className="grid grid-cols-1 gap-3">
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className="h-auto p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 text-left justify-start group"
                          onClick={() => handleQuickQuestion(question)}
                          disabled={isLoading}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 text-sm leading-relaxed break-words">
                          {question}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 New suggestions appear each time you clear the chat
                  </p>
                </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
        </div>
              </div>
              
            {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 z-40">
        {/* Pasted Image Preview */}
        {pastedImage && (
          <div className="mb-3 relative inline-block">
            <div className="relative inline-block">
              <img 
                src={pastedImage} 
                alt="Pasted image preview" 
                className="w-[100px] max-w-[100px] h-auto rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <Button
                onClick={removePastedImage}
                className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white border-0 p-0 flex items-center justify-center"
                size="sm"
                style={{ minWidth: 'unset', minHeight: 'unset' }}
              >
                <X className="w-2 h-2" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">Pasted image ready to send</div>
          </div>
        )}
        
                <div className="flex gap-3">
                                      <div className="flex-1 relative">
                      <Textarea
                        ref={textareaRef}
              placeholder="Ask a question... (You can paste images with Ctrl+V)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
              onPaste={handlePaste}
                        className="min-h-[60px] max-h-[120px] resize-none pr-12"
                        disabled={isLoading || voiceState.isListening}
                      />
                    </div>
                  <Button 
                    onClick={handleSendClick} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 h-[60px] shadow-lg"
            disabled={(!message.trim() && !pastedImage) || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
          <Button
            onClick={startLiveAssistant}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 h-[60px] shadow-lg transform hover:scale-105 transition-all duration-200"
            title="Live Assistant"
          >
            <Camera className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
      
      {/* Live Assistant Overlay */}
      {liveAssistant.isActive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Animated Bubble */}
            <div className="flex-1 flex items-center justify-center">
              <div className={`relative ${liveAssistant.isListening ? 'animate-pulse' : ''}`}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  liveAssistant.isListening 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse' 
                    : liveAssistant.isProcessing 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                    : liveAssistant.isSpeaking 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 animate-pulse' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-600'
                }`}>
                  {liveAssistant.isListening ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
                  ) : liveAssistant.isProcessing ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : liveAssistant.isSpeaking ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
      </div>
      
                {/* Status Text */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center">
                  <p className="text-lg font-semibold">
                    {liveAssistant.isListening 
                      ? 'Listening...' 
                      : liveAssistant.isProcessing 
                      ? 'Processing...' 
                      : liveAssistant.isSpeaking 
                      ? 'Speaking...' 
                      : liveAssistant.isPaused 
                      ? 'Paused' 
                      : 'Ready to listen'
                    }
                  </p>
                  {liveAssistant.transcript && (
                    <p className="text-sm opacity-80 mt-1">"{liveAssistant.transcript}"</p>
                  )}
        </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <Button
                onClick={toggleLivePause}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                title={liveAssistant.isPaused ? 'Resume' : 'Pause'}
              >
                {liveAssistant.isPaused ? (
                  <Play className="w-6 h-6 text-white" />
                ) : (
                  <Pause className="w-6 h-6 text-white" />
                )}
              </Button>
              
              <Button
                onClick={toggleMic}
                className={`w-16 h-16 rounded-full backdrop-blur-sm border ${
                  liveAssistant.micEnabled 
                    ? liveAssistant.isListening
                      ? 'bg-blue-500/80 hover:bg-blue-500 border-blue-400 animate-pulse'
                      : 'bg-green-500/80 hover:bg-green-500 border-green-400'
                    : 'bg-red-500/80 hover:bg-red-500 border-red-400'
                }`}
                title={
                  liveAssistant.micEnabled 
                    ? liveAssistant.isListening 
                      ? 'Stop listening' 
                      : 'Start listening'
                    : 'Enable microphone'
                }
              >
                {liveAssistant.micEnabled ? (
                  liveAssistant.isListening ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </Button>
              
              <Button
                onClick={openCamera}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 transform hover:scale-110 transition-all duration-200"
                title="Open camera"
              >
                <Camera className="w-6 h-6 text-white animate-pulse" />
              </Button>
              
              <Button
                onClick={stopLiveAssistant}
                className="w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-500 border border-red-400"
                title="Close live assistant"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Overlay */}
      {cameraState.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Camera Feed */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative max-w-2xl w-full">
                {!cameraState.isCaptured ? (
                  <div className="relative">
          <video
                      ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
                      className="w-full h-auto rounded-lg shadow-2xl"
                      style={{ minHeight: '400px' }}
                    />
                    {!cameraState.stream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                        <div className="text-white text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p>Starting camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={cameraState.capturedImage!} 
                      alt="Captured" 
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Captured
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              {!cameraState.isCaptured ? (
                <Button
                  onClick={captureImage}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                >
                  <Camera className="w-6 h-6 text-white" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={retakeImage}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white rounded-full"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={sendCapturedImage}
                    className="px-6 py-3 bg-green-500/80 backdrop-blur-sm hover:bg-green-500 border border-green-400 text-white rounded-full"
                    disabled={liveAssistant.isProcessing}
                  >
                    {liveAssistant.isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send to AI'
                    )}
                  </Button>
                </>
              )}
              
              <Button
                onClick={closeCamera}
                className="w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-500 border border-red-400"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Lightbox */}
      {lightboxState.isOpen && lightboxState.imageUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <div className="relative">
              <img 
                src={lightboxState.imageUrl} 
                alt="Full size image" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Close button */}
              <Button
                onClick={closeImageLightbox}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
              
              {/* Download button */}
              <Button
                onClick={() => downloadImage(lightboxState.imageUrl!)}
                className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white border-0"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {liveAssistant.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">{liveAssistant.error}</p>
        </div>
      )}
    </div>
  );
}