
export enum Category {
  ALL = 'Wszystkie',
  CHEBUREKI = 'Chebureki',
  MAIN_DISHES = 'Dania główne',
  DUMPLINGS = 'Pierogi',
  CHINKALI = 'Chinkali',
  SOUPS = 'Zupy',
  DRINKS = 'Napoje'
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
  isEnabled?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'read_only' | 'write';
  can_manage_users: boolean;
  can_manage_integrations: boolean;
  can_manage_payments: boolean;
  can_manage_delivery: boolean;
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
