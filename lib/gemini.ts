const GEMINI_API_KEY = 'AIzaSyD8wq_oMhJQy5fQxGKrcCoWRFkwATe7FLk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface GeminiImageInput {
  mimeType: string;
  data: string; // base64 encoded image data
}

export async function callGeminiAPI(
  prompt: string, 
  images?: GeminiImageInput[]
): Promise<GeminiResponse> {
  try {
    // Prepare parts array with text
    const parts: any[] = [
      {
        text: `You are an agricultural AI assistant for AgriSense, a smart farming platform. Provide helpful, accurate, and practical advice for farmers. Keep responses concise but informative. Focus on practical farming solutions, crop management, disease prevention, and sustainable agriculture practices.

User question: ${prompt}`
      }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data
          }
        });
      });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        success: true,
        content: data.candidates[0].content.parts[0].text
      };
    } else {
      return {
        success: false,
        error: 'No response from AI'
      };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AI response'
    };
  }
}

// Helper function to convert base64 image data to the format expected by Gemini
export function prepareImageForGemini(base64Data: string, mimeType: string = 'image/jpeg'): GeminiImageInput {
  // Remove data URL prefix if present
  const base64WithoutPrefix = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  
  return {
    mimeType: mimeType,
    data: base64WithoutPrefix
  };
} 