
import { Product, Category } from './types';

export const MENU_ITEMS: Product[] = [
  // Chebureki
  {
    id: 'c1',
    name: 'Czeburek Tradycyjny',
    category: Category.CHEBUREKI,
    price: 10.00,
    calories: 350,
    description: 'Chrupiący pieróg z nadzieniem z mięsa mielonego wołowo-wieprzowego, cebuli, soli i pieprzu.',
    ingredients: ['Mięso wołowo-wieprzowe', 'Cebula', 'Sól', 'Pieprz', 'Ciasto'],
    image: 'https://i.imgur.com/eVXA6y7.jpeg',
    isSpicy: false
  },
  {
    id: 'c2',
    name: 'Czeburek z Twarogiem',
    category: Category.CHEBUREKI,
    price: 10.00,
    calories: 320,
    description: 'Delikatny pieróg z nadzieniem z twarogu, świeżego pomidora i koperku.',
    ingredients: ['Twaróg', 'Świeży pomidor', 'Koperek', 'Ciasto'],
    image: 'https://i.imgur.com/OBfuuCE.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'c3',
    name: 'Czeburek z Warzywami',
    category: Category.CHEBUREKI,
    price: 10.00,
    calories: 280,
    description: 'Wegetariańska wersja z ziemniakami, cebulą i aromatycznymi przyprawami.',
    ingredients: ['Ziemniaki', 'Cebula', 'Przyprawy', 'Ciasto'],
    image: 'https://i.imgur.com/grrti6a.jpeg',
    isSpicy: false,
    isVegetarian: true
  },

  // Chinkali
  {
    id: 'ch1',
    name: 'Chinkali',
    category: Category.CHINKALI,
    price: 20.00,
    calories: 400,
    description: 'Gruzińskie pierożki: mięso mielone wołowo-wieprzowe, cebula, przyprawy i soczysty bulion.',
    ingredients: ['Mięso wołowo-wieprzowe', 'Cebula', 'Przyprawy', 'Ciasto'],
    image: 'https://i.imgur.com/04TQ1pr.jpeg',
    isSpicy: false
  },

  // Pierogi
  {
    id: 'p1',
    name: 'Pierogi Tradycyjne',
    category: Category.DUMPLINGS,
    price: 15.00,
    calories: 380,
    description: 'Klasyczne pierogi z nadzieniem z ziemniaków, cebuli, soli i pieprzu.',
    ingredients: ['Ziemniaki', 'Cebula', 'Sól', 'Pieprz', 'Ciasto'],
    image: 'https://i.imgur.com/CZ0tqfn.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'p2',
    name: 'Pierogi Słodkie',
    category: Category.DUMPLINGS,
    price: 15.00,
    calories: 420,
    description: 'Słodka wersja z twarogiem wiejskim, cukrem i wanilią.',
    ingredients: ['Twaróg wiejski', 'Cukier', 'Wanilia', 'Ciasto'],
    image: 'https://i.imgur.com/gKySyuI.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'p3',
    name: 'Pierogi Mięsne',
    category: Category.DUMPLINGS,
    price: 15.00,
    calories: 450,
    description: 'Sycące pierogi z mięsem mielonym z łopatki, cebulą i przyprawami.',
    ingredients: ['Mięso mielone łopatka', 'Cebula', 'Przyprawy', 'Ciasto'],
    image: 'https://i.imgur.com/mMnPEBU.jpeg',
    isSpicy: false
  },

  // Drinks
  {
    id: 'd1',
    name: 'Herbata',
    category: Category.DRINKS,
    price: 5.00,
    calories: 0,
    description: 'Gorąca, aromatyczna herbata.',
    ingredients: ['Woda', 'Herbata'],
    image: 'https://i.imgur.com/Yc7OV2q.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'd2',
    name: 'Kawa po turecku',
    category: Category.DRINKS,
    price: 8.00,
    calories: 5,
    description: 'Mocna kawa parzona w tradycyjny sposób.',
    ingredients: ['Woda', 'Kawa'],
    image: 'https://i.imgur.com/vqzcP6O.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'd3',
    name: 'Kawa z mlekiem',
    category: Category.DRINKS,
    price: 10.00,
    calories: 40,
    description: 'Aromatyczna kawa z delikatnym mlekiem.',
    ingredients: ['Woda', 'Kawa', 'Mleko'],
    image: 'https://i.imgur.com/posqUaI.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'd4',
    name: 'Kompot',
    category: Category.DRINKS,
    price: 5.00,
    calories: 80,
    description: 'Domowy kompot z owoców.',
    ingredients: ['Woda', 'Owoce', 'Cukier'],
    image: 'https://i.imgur.com/BXQNIlV.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 'd5',
    name: 'Uzwar',
    category: Category.DRINKS,
    price: 5.00,
    calories: 90,
    description: 'Tradycyjny napój z suszonych owoców.',
    ingredients: ['Woda', 'Suszone owoce', 'Miód'],
    image: 'https://i.imgur.com/LKEWLnh.jpeg',
    isSpicy: false,
    isVegetarian: true
  },

  // Zupy
  {
    id: 's1',
    name: 'Barszcz',
    category: Category.SOUPS,
    price: 10.00,
    calories: 180,
    description: 'Tradycyjny barszcz czerwony z buraków, podawany z nutą śmietany.',
    ingredients: ['Buraki', 'Wywar warzywny', 'Przyprawy', 'Śmietana'],
    image: 'https://i.imgur.com/eE3aK0K.jpeg',
    isSpicy: false,
    isVegetarian: true
  },
  {
    id: 's2',
    name: 'Charczo',
    category: Category.SOUPS,
    price: 10.00,
    calories: 320,
    description: 'Gęsta i aromatyczna gruzińska zupa z wołowiny, ryżu i orzechów włoskich.',
    ingredients: ['Wołowina', 'Ryż', 'Orzechy włoskie', 'Przyprawy', 'Czosnek'],
    image: 'https://i.imgur.com/L3nzvY5.jpeg',
    isSpicy: true
  },
  {
    id: 's3',
    name: 'Zupa z pulpecikami',
    category: Category.SOUPS,
    price: 10.00,
    calories: 250,
    description: 'Delikatny wywar z mięsnymi pulpecikami i warzywami.',
    ingredients: ['Mięso mielone', 'Ziemniaki', 'Marchew', 'Zelenina'],
    image: 'https://i.imgur.com/k4eZPcG.jpeg',
    isSpicy: false
  },

  // Dania główne
  {
    id: 'm1',
    name: 'Pilaw',
    category: Category.MAIN_DISHES,
    price: 15.00,
    calories: 550,
    description: 'Tradycyjne danie z ryżu, soczystej wołowiny, marchwi i aromatycznych przypraw wschodnich.',
    ingredients: ['Ryż', 'Wołowina', 'Marchew', 'Cebula', 'Przyprawy'],
    image: 'https://i.imgur.com/ZdWsFHO.jpeg',
    isSpicy: false
  },
  {
    id: 'm2',
    name: 'Ziemniaki po wiejsku z żeberkami',
    category: Category.MAIN_DISHES,
    price: 25.00,
    calories: 750,
    description: 'Sycące danie z pieczonych ziemniaków i duszonych żeberek wieprzowych.',
    ingredients: ['Ziemniaki', 'Żeberka wieprzowe', 'Cebula', 'Czosnek'],
    image: 'https://i.imgur.com/1BAbrwk.jpeg',
    isSpicy: false
  },
  {
    id: 'm3',
    name: 'Frytki z skrzydełkami',
    category: Category.MAIN_DISHES,
    price: 25.00,
    calories: 680,
    description: 'Chrupiące frytki podawane ze złocistymi skrzydełkami z kurczaka.',
    ingredients: ['Frytki', 'Skrzydełka z kurczaka', 'Sos'],
    image: 'https://i.imgur.com/GZrmxEG.jpeg',
    isSpicy: false
  },
  {
    id: 'm4',
    name: 'Szaszłyk',
    category: Category.MAIN_DISHES,
    price: 25.00,
    calories: 600,
    description: 'Soczyste kawałki mięsa grillowane na szpadzie, podawane z cebulą.',
    ingredients: ['Mięso (wieprzowina/kurczak)', 'Cebula', 'Przyprawy'],
    image: 'https://i.imgur.com/myYXkDE.jpeg',
    isSpicy: false
  },
  {
    id: 'm5',
    name: 'Kasza gryczana z wątróbką',
    category: Category.MAIN_DISHES,
    price: 15.00,
    calories: 420,
    description: 'Pożywna kasza gryczana serwowana z duszoną wątróbką i cebulką.',
    ingredients: ['Kasza gryczana', 'Wątróbka drobiowa', 'Cebula'],
    image: 'https://i.imgur.com/IYxzbt6.jpeg',
    isSpicy: false
  }
];
