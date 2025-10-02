import { useState, useEffect } from 'react';

export const usePromptAPI = () => {
  const [session, setSession] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializePromptAPI();
  }, []);

  const initializePromptAPI = async () => {
    try {
      if (!('LanguageModel' in window)) {
        throw new Error('Prompt API not available');
      }

      const availability = await window.LanguageModel.availability();
      if (availability === 'no') {
        throw new Error('Model not available');
      }

      const promptSession = await window.LanguageModel.create({
        temperature: 0.3, // Lower temperature for more consistent parsing
        topK: 10,
        initialPrompts: [
          {
            role: 'system',
            content: `You are a financial transaction parser. Extract amount, description, type, category and date from user speech.

Categories: Grocery, Food, Transport, Entertainment, Shopping, Utilities, Income, Health, Education, Other.

Type: "INCOME" or "EXPENSE".

Always respond with valid JSON only:
{
  "amount": number (positive for expenses, negative for income),
  "description": "brief description",
  "type": INCOME or EXPENSE,
  "category": "category name"
}

Examples:
- "I spent 25 dollars on groceries at walmart" → {"amount": 25, "description": "Groceries at Walmart", "category": "Food", "type": "EXPENSE"}
- "Got paid 2500 salary" → {"amount": 2500, "description": "Salary", "category": "Income", "type": "INCOME"}
- "Uber ride cost me 15 bucks" → {"amount": 15, "description": "Uber ride", "category": "Transport", "type": "EXPENSE"}
- "Received 500 from freelance work" → {"amount": 500, "description": "Freelance work", "category": "Income", "type": "INCOME"}
- "Received 3200 salary for July month" → {"amount": 3200, "description": "July Salary", "category": "Income", "type": "INCOME", "date": "2023-07-31"}
- "Paid 80 for internet bill" → {"amount": 80, "description": "Internet bill", "category": "Utilities", "type": "EXPENSE"}`
          }
        ]
      });

      setSession(promptSession);
      setIsReady(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatResponseAsJSON = (response) => {
    const lines = response.split('\n');
    if (lines.length > 0 && lines[0].startsWith('```')){
        lines.shift();
    }
    if (lines.length > 0 && lines[lines.length - 1].endsWith('```')){
        lines.pop();
    }
    return lines.join('\n');
  }

  const parseTransaction = async (speechText) => {
    if (!session) {
      throw new Error('Prompt API not ready');
    }

    try {
      const response = await session.prompt(speechText);
//     const response = ```json
// {
//   "amount": 25,
//   "description": "Groceries at Walmart",
//   "category": "groceries",
//   "type": "EXPENSE"
// }
// ```
      console.log('Prompt API response:', response);
      const validJSON = formatResponseAsJSON(response);
      const parsed = JSON.parse(validJSON.trim());
      
      // Validate the response structure
      if (typeof parsed.amount !== 'number' || !parsed.description || !parsed.category) {
        throw new Error('Invalid response format');
      }

      return parsed;
    } catch (err) {
      console.error('Error parsing transaction:', err);
      throw new Error('Failed to parse transaction');
    }
  };

  return { session, isReady, error, parseTransaction };
};

