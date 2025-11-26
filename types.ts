
export enum Category {
  ALL = 'Wszystkie',
  SUSHI = 'Sushi',
  BURGERS = 'Burgery',
  SHAWARMA = 'Shoarma',
  SALADS = 'Sałatki'
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
