const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  timestamp: string;
  vehicleData?: any;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  vehicleData?: any;
}

export const chatApi = {
  /**
   * Lähetä viesti chatbotille
   */
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v2/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  /**
   * Hae chat-sessio
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/api/v2/chat/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    return response.json();
  },
};
