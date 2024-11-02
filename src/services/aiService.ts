import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, make API calls through your backend
});

export interface DreamAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    emotions: string[];
  };
  themes: string[];
  interpretation: string;
  recommendations: string[];
}

export const aiService = {
  async analyzeDream(dreamText: string): Promise<DreamAnalysis> {
    const prompt = `Analyze this dream and provide the following in JSON format:
      1. Sentiment (score from -1 to 1, label, and dominant emotions)
      2. Main themes (up to 5)
      3. Brief interpretation
      4. Personal recommendations based on the dream
      
      Dream: "${dreamText}"`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  },

  async generateDreamArtwork(dreamText: string): Promise<string> {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a dreamy, artistic interpretation of this dream: ${dreamText}. 
               Style: ethereal, surreal, dreamlike quality with soft colors.`,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  },

  async findSimilarDreams(dreamText: string, communityDreams: any[]): Promise<any[]> {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: dreamText,
    });

    // In a real app, you'd store and compare embeddings in a vector database
    // This is a simplified version
    return communityDreams.slice(0, 3);
  },

  async generateDreamArt(dreamText: string): Promise<string> {
    // For demo purposes, return a placeholder image
    const artStyles = [
      'https://source.unsplash.com/random/400x400/?dream',
      'https://source.unsplash.com/random/400x400/?fantasy',
      'https://source.unsplash.com/random/400x400/?surreal'
    ];
    
    return artStyles[Math.floor(Math.random() * artStyles.length)];
  }
}; 