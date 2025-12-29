
export enum Category {
  ALL = 'Wszystkie',
  CHEBUREKI = 'Chebureki',
  CHINKALI = 'Chinkali',
  DUMPLINGS = 'Pierogi',
  DRINKS = 'Napoje',
  SOUPS = 'Zupy',
  MAIN_DISHES = 'Dania główne'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  calories: number;
  description: string;
  ingredients: string[];
  image: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'read_only' | 'write';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User | null;
}

export interface CheckoutFormData {
  name: string;
  address: string;
  phone: string;
  paymentMethod: 'card' | 'cash';
  deliveryTime: 'asap' | 'scheduled';
}

export interface AiMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
