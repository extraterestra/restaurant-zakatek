
import { GoogleGenAI } from "@google/genai";
import { MENU_ITEMS } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getChefRecommendation = async (userQuery: string): Promise<string> => {
  if (!apiKey) {
    return "Przepraszam, mój mózg AI nie jest teraz połączony (Brak klucza API). Ale polecam nasze domowe Czeburaki!";
  }

  const menuContext = MENU_ITEMS.map(item =>
    `- [ID: ${item.id}] ${item.name} (${item.category}): ${item.description}. Cena: ${item.price} zł. Kalorie: ${item.calories}. Składniki: ${item.ingredients.join(', ')}.`
  ).join('\n');

  const systemInstruction = `
    Jesteś przyjaznym i kompetentnym kelnerem w restauracji "Zakątek Smaków", znanej z domowej kuchni, pysznych Czeburek, Chinkali, Pierogów, Zup i Dań głównych.
    Twoim celem jest polecanie pozycji z menu na podstawie zapytania użytkownika.
    
    Oto nasze menu:
    ${menuContext}

    Zasady:
    1. Polecaj tylko pozycje z podanego menu.
    2. Odpowiadaj w języku polskim.
    3. Bądź zwięzły i opisuj dania w apetyczny sposób.
    4. Jeśli rekomendujesz konkretne danie, MUSISZ na końcu zdania o nim dodać jego ID w formacie [PRODUCT:id_dania]. Np. "Polecam nasz Czeburek Tradycyjny [PRODUCT:c1]."
    5. Jeśli użytkownik poprosi o coś, czego nie mamy, grzecznie zaproponuj najbliższą alternatywę.
    6. Utrzymuj odpowiedź poniżej 400 znaków.
    7. Używaj emoji, aby być przyjaznym.
    8. Zwracaj się do restauracji jako "Zakątek Smaków".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    return response.text || "Nie mogłem znaleźć konkretnej rekomendacji, ale wszystko w Zakątku Smaków jest pyszne!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Mam mały problem z myśleniem w tej chwili. Może spróbujesz naszych bestsellerów?";
  }
};
