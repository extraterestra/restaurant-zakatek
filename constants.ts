
import { Product, Category } from './types';

export const MENU_ITEMS: Product[] = [
  // Sushi Rolls
  {
    id: 's1',
    name: 'Philadelphia z Łososiem',
    category: Category.SUSHI,
    price: 38.00,
    calories: 320,
    description: 'Klasyczna rolka z aksamitnym serkiem, świeżym ogórkiem i dużą porcją norweskiego łososia.',
    ingredients: ['Łosoś', 'Serek Philadelphia', 'Ogórek', 'Ryż', 'Nori'],
    image: 'https://i.imgur.com/avvAzr1.jpg',
    isSpicy: false
  },
  {
    id: 's2',
    name: 'Pieczony z Łososiem i Mango',
    category: Category.SUSHI,
    price: 41.00,
    calories: 410,
    description: 'Ciepła rolka z łososiem pod pierzynką z sosu serowego, przełamana słodyczą mango.',
    ingredients: ['Łosoś', 'Mango', 'Sos Serowy', 'Ryż', 'Nori', 'Sos Unagi'],
    image: 'https://i.imgur.com/ZMLpjTC.jpg',
    isSpicy: false
  },
  {
    id: 's3',
    name: 'Pieczony z Kurczakiem i Mango',
    category: Category.SUSHI,
    price: 40.00,
    calories: 430,
    description: 'Pieczona rolka z delikatnym kurczakiem, mango i sosem teriyaki.',
    ingredients: ['Kurczak', 'Mango', 'Sos Serowy', 'Ryż', 'Nori', 'Teriyaki'],
    image: 'https://i.imgur.com/ZMLpjTC.jpg',
    isSpicy: false
  },
  {
    id: 's4',
    name: 'Tempura z Łososiem i Ogórkiem',
    category: Category.SUSHI,
    price: 43.00,
    calories: 450,
    description: 'Chrupiąca rolka w tempurze z łososiem i ogórkiem, idealne połączenie tekstur.',
    ingredients: ['Łosoś', 'Ogórek', 'Tempura', 'Panko', 'Ryż', 'Nori'],
    image: 'https://i.imgur.com/jo4w03o.jpeg',
    isSpicy: false
  },
  {
    id: 's5',
    name: 'Tempura z Kurczakiem i Mango',
    category: Category.SUSHI,
    price: 41.00,
    calories: 460,
    description: 'Złocista tempura skrywająca kurczaka i mango. Chrupiąca i sycąca.',
    ingredients: ['Kurczak', 'Mango', 'Tempura', 'Panko', 'Ryż', 'Nori'],
    image: 'https://i.imgur.com/Rsskfq3.jpg',
    isSpicy: false
  },

  // Burgers
  {
    id: 'b1',
    name: 'Burger Wołowy Klasyk',
    category: Category.BURGERS,
    price: 35.00,
    calories: 650,
    description: 'Soczysta wołowina 100%, świeże warzywa i nasz autorski sos w maślanej bułce.',
    ingredients: ['Wołowina', 'Sałata', 'Pomidor', 'Czerwona Cebula', 'Ogórek Kiszony', 'Sos Autorski'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    isSpicy: false
  },
  {
    id: 'b2',
    name: 'Burger Crispy Chicken',
    category: Category.BURGERS,
    price: 32.00,
    calories: 580,
    description: 'Chrupiący kurczak w złocistej panierce z sosem majonezowym i świeżą sałatą.',
    ingredients: ['Kurczak Panierowany', 'Sałata', 'Pomidor', 'Majonez', 'Bułka Brioche'],
    image: 'https://i.imgur.com/IavBLF8.jpg',
    isSpicy: false
  },

  // Shawarma
  {
    id: 'sh1',
    name: 'Shoarma Drobiowa Fit',
    category: Category.SHAWARMA,
    price: 29.00,
    calories: 420,
    description: 'Lekka wersja klasyka. Grillowane kawałki kurczaka z dużą ilością warzyw w pełnoziarnistej tortilli.',
    ingredients: ['Kurczak Grillowany', 'Kapusta Pekińska', 'Ogórek', 'Pomidor', 'Sos Jogurtowy', 'Tortilla Pełnoziarnista'],
    image: 'https://i.imgur.com/uAdZoHz.jpeg',
    isSpicy: false
  },

  // Salads
  {
    id: 'sa1',
    name: 'Sałatka Warzywna Ogród',
    category: Category.SALADS,
    price: 25.00,
    calories: 180,
    description: 'Eksplozja witamin. Mieszanka chrupiących sałat i sezonowych warzyw.',
    ingredients: ['Mix Sałat', 'Pomidorki Cherry', 'Ogórek', 'Papryka', 'Olej Oliwkowy'],
    image: 'https://i.imgur.com/x6QzvGw.jpeg',
    isVegetarian: true,
    isSpicy: false
  },
  {
    id: 'sa2',
    name: 'Sałatka Cezar Królewska',
    category: Category.SALADS,
    price: 31.00,
    calories: 350,
    description: 'Klasyka gatunku. Grillowany kurczak, chrupiące grzanki, parmezan i oryginalny sos Cezar.',
    ingredients: ['Sałata Rzymska', 'Kurczak Grillowany', 'Grzanki', 'Parmezan', 'Sos Cezar'],
    image: 'https://i.imgur.com/vSvEnnC.jpeg',
    isSpicy: false
  },
  {
    id: 'sa3',
    name: 'Cytrusowe Przebudzenie',
    category: Category.SALADS,
    price: 27.00,
    calories: 220,
    description: 'Orzeźwiająca kompozycja z grejpfrutem, pomarańczą, awokado i prażonymi pestkami słonecznika.',
    ingredients: ['Szpinak', 'Grejpfrut', 'Pomarańcza', 'Awokado', 'Słonecznik', 'Dressing Miodowo-Cytrynowy'],
    image: 'https://i.imgur.com/6iyIoju.jpeg',
    isVegetarian: true,
    isSpicy: false
  }
];
