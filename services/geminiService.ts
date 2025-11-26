
import { GoogleGenAI } from "@google/genai";
import { MENU_ITEMS } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getChefRecommendation = async (userQuery: string): Promise<string> => {
  if (!apiKey) {
    return "Przepraszam, mój mózg AI nie jest teraz połączony (Brak klucza API). Ale polecam Filadelfię!";
  }

  const menuContext = MENU_ITEMS.map(item => 
    `- ${item.name} (${item.category}): ${item.description}. Cena: ${item.price} zł. Kalorie: ${item.calories}. Składniki: ${item.ingredients.join(', ')}.`
  ).join('\n');

  const systemInstruction = `
    Jesteś przyjaznym i kompetentnym kelnerem w restauracji "SIVIK", znanej ze świeżego sushi, burgerów i zdrowych opcji.
    Twoim celem jest polecanie pozycji z menu na podstawie zapytania użytkownika.
    
    Oto nasze menu:
    ${menuContext}

    Zasady:
    1. Polecaj tylko pozycje z podanego menu.
    2. Odpowiadaj w języku polskim.
    3. Bądź zwięzły i opisuj dania w apetyczny sposób.
    4. Jeśli użytkownik poprosi o coś, czego nie mamy, grzecznie zaproponuj najbliższą alternatywę.
    5. Utrzymuj odpowiedź poniżej 300 znaków.
    6. Używaj emoji, aby być przyjaznym.
    7. Zwracaj się do restauracji jako "SIVIK".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    return response.text || "Nie mogłem znaleźć konkretnej rekomendacji, ale wszystko w SIVIK jest pyszne!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Mam mały problem z myśleniem w tej chwili. Może spróbujesz naszych bestsellerów?";
  }
};
