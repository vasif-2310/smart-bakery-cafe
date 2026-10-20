const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const InventoryBatch = require('../models/InventoryBatch');
const BakerySettings = require('../models/BakerySettings');
const Coupon = require('../models/Coupon');
const { CATEGORIES } = require('../config/constants');

/**
 * EXACT 30 INITIAL PRODUCTS AS SPECIFIED IN PROJECT REQUIREMENTS
 * Category A: Bakery (10 items)
 * Category B: Non-Vegetarian (10 items)
 * Category C: Café (10 items)
 */
const initialProducts = [
  // ==========================================
  // CATEGORY A: BAKERY (10 Products)
  // ==========================================
  {
    name: 'Chocolate Cake',
    description: 'Decadent multi-layered Belgian dark chocolate sponge filled with silky chocolate ganache and chocolate curls.',
    category: CATEGORIES.BAKERY,
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Flour', 'Belgian Cocoa', 'Sugar', 'Butter', 'Dark Chocolate Ganache', 'Baking Powder'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 45,
    preparationTime: 35,
    isFeatured: true,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: '500g (Serves 4-5)', priceDelta: 0 },
        { name: '1 kg (Serves 8-10)', priceDelta: 450 },
        { name: '1.5 kg (Party Size)', priceDelta: 850 },
      ],
      flavors: ['Classic Belgian Truffle', 'Dutch Dark Truffle', 'Hazelnut Praline'],
      frostings: ['Rich Dark Ganache', 'Whipped Buttercream', 'Silky Milk Chocolate'],
      allowCustomMessage: true,
      maxMessageLength: 35,
    },
  },
  {
    name: 'Black Forest Pastry',
    description: 'Traditional German Kirsch-flavored chocolate sponge layered with whipped vanilla cream and tart sour cherries.',
    category: CATEGORIES.BAKERY,
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Cocoa Sponge', 'Vanilla Whipped Cream', 'Sour Cherries', 'Chocolate Flakes'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 40,
    preparationTime: 10,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Red Velvet Pastry',
    description: 'Vibrant crimson velvet sponge layered with smooth, tangy cream cheese frosting and fine sponge crumbs.',
    category: CATEGORIES.BAKERY,
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Buttermilk', 'Cocoa', 'Cream Cheese', 'Vanilla Bean', 'Flour'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 35,
    preparationTime: 10,
    isFeatured: true,
    isPopular: true,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Fudgy, dense chocolate brownie with a crackly top, loaded with melted walnut chunks and dark chocolate chips.',
    category: CATEGORIES.BAKERY,
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1606313564555-d41c9b31d4d3?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Dark Chocolate', 'Walnuts', 'Butter', 'Brown Sugar', 'Flour'],
    allergens: ['Gluten', 'Dairy', 'Nuts'],
    isAvailable: true,
    stockQuantity: 60,
    preparationTime: 8,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Croissant',
    description: 'Golden, crescent-shaped French pastry laminated with pure European butter for crisp, flaky, honeycomb perfection.',
    category: CATEGORIES.BAKERY,
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['French Wheat Flour', 'European Cultured Butter', 'Yeast', 'Milk', 'Sea Salt'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 50,
    preparationTime: 5,
    isFeatured: true,
    isPopular: true,
  },
  {
    name: 'Blueberry Muffin',
    description: 'Moist and fluffy golden vanilla muffin bursting with wild blueberries and finished with a crunchy cinnamon streusel.',
    category: CATEGORIES.BAKERY,
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Wild Blueberries', 'Flour', 'Butter', 'Brown Sugar', 'Cinnamon', 'Buttermilk'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 40,
    preparationTime: 5,
    isFeatured: false,
    isPopular: false,
  },
  {
    name: 'Chocolate Cupcake',
    description: 'Tender dark chocolate cupcake crowned with a swirl of rich cocoa buttercream and dark chocolate sprinkles.',
    category: CATEGORIES.BAKERY,
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Cocoa', 'Flour', 'Buttercream', 'Sugar', 'Dark Sprinkles'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 55,
    preparationTime: 5,
    isFeatured: false,
    isPopular: false,
  },
  {
    name: 'Garlic Bread',
    description: 'Artisanal baguette slices toasted crisp with roasted garlic herb butter, parsley, and melted mozzarella cheese.',
    category: CATEGORIES.BAKERY,
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['French Baguette', 'Roasted Garlic', 'Butter', 'Parsley', 'Mozzarella'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 30,
    preparationTime: 12,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Cheese Sandwich',
    description: 'Grilled sourdough bread packed with a creamy trio of Cheddar, Mozzarella, and herb-infused cream cheese.',
    category: CATEGORIES.BAKERY,
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Sourdough Bread', 'Aged Cheddar', 'Mozzarella', 'Oregano', 'Butter'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 35,
    preparationTime: 12,
    isFeatured: false,
    isPopular: false,
  },
  {
    name: 'Veg Puff',
    description: 'Flaky golden puff pastry envelope stuffed with a spiced potato, green pea, cumin, and fresh cilantro filling.',
    category: CATEGORIES.BAKERY,
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Laminated Puff Pastry', 'Potatoes', 'Green Peas', 'Garam Masala', 'Cumin'],
    allergens: ['Gluten'],
    isAvailable: true,
    stockQuantity: 65,
    preparationTime: 5,
    isFeatured: false,
    isPopular: true,
  },

  // ==========================================
  // CATEGORY B: NON-VEGETARIAN (10 Products)
  // ==========================================
  {
    name: 'Chicken Burger',
    description: 'Crisp seasoned chicken breast patty topped with cheddar cheese, iceberg lettuce, tomatoes, and smoky aioli on a brioche bun.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Chicken Breast', 'Brioche Bun', 'Cheddar Cheese', 'Iceberg Lettuce', 'Smoked Aioli'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    isAvailable: true,
    stockQuantity: 40,
    preparationTime: 15,
    isFeatured: true,
    isPopular: true,
  },
  {
    name: 'Chicken Pizza',
    description: 'Hand-stretched sourdough crust smothered in San Marzano tomato sauce, shredded mozzarella, grilled chicken, and bell peppers.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Sourdough Pizza Dough', 'Grilled Herb Chicken', 'San Marzano Sauce', 'Mozzarella', 'Bell Peppers'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 25,
    preparationTime: 20,
    isFeatured: true,
    isPopular: true,
  },
  {
    name: 'Chicken Sandwich',
    description: 'Thinly sliced roasted herb chicken breast, garlic emulsion, baby spinach, and crisp gherkins between toasted multigrain slices.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Roasted Chicken', 'Multigrain Bread', 'Garlic Mayo', 'Spinach', 'Gherkins'],
    allergens: ['Gluten', 'Eggs'],
    isAvailable: true,
    stockQuantity: 30,
    preparationTime: 12,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Chicken Nuggets',
    description: 'Eight pieces of tender minced chicken nuggets coated in seasoned golden panko breadcrumbs, served with tangy honey mustard dip.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Chicken Breast Mince', 'Panko Crumbs', 'Spices', 'Honey Mustard Dip'],
    allergens: ['Gluten'],
    isAvailable: true,
    stockQuantity: 50,
    preparationTime: 10,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Chicken Wrap',
    description: 'Warm tortilla rolled with marinated spiced chicken strips, crunchy purple cabbage, pickled onions, and chipotle ranch dressing.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Flour Tortilla', 'Spiced Chicken', 'Purple Cabbage', 'Chipotle Ranch', 'Pickled Onion'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 35,
    preparationTime: 12,
    isFeatured: false,
    isPopular: false,
  },
  {
    name: 'Chicken Popcorn',
    description: 'Bite-sized cubes of marinated chicken breast flash-fried in a peppery buttermilk coating, served with spicy sriracha mayo.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Chicken Cubes', 'Buttermilk Coating', 'Black Pepper', 'Paprika', 'Sriracha Mayo'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    isAvailable: true,
    stockQuantity: 45,
    preparationTime: 10,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Chicken Puff',
    description: 'Light, flaky puff pastry filled with mild pepper and onion sautéed chicken keema, baked to golden crispness.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Puff Pastry', 'Minced Chicken', 'Onions', 'Black Pepper', 'Coriander'],
    allergens: ['Gluten'],
    isAvailable: true,
    stockQuantity: 50,
    preparationTime: 5,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Chicken Tikka Sandwich',
    description: 'Tandoori-spiced smoked chicken tikka chunks mixed with mint mayo, capsicum, and chaat masala in toasted panini bread.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Tandoori Chicken Tikka', 'Panini Bread', 'Mint Mayonnaise', 'Capsicum', 'Onions'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    isAvailable: true,
    stockQuantity: 30,
    preparationTime: 14,
    isFeatured: true,
    isPopular: true,
  },
  {
    name: 'Egg Roll',
    description: 'Crisp handmade paratha layered with double sunny beaten eggs, shredded onions, green chilies, and tangy lemon sauce.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 99,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Handmade Paratha', 'Fresh Eggs', 'Sliced Onions', 'Green Chilies', 'Lemon Chilli Sauce'],
    allergens: ['Gluten', 'Eggs'],
    isAvailable: true,
    stockQuantity: 40,
    preparationTime: 8,
    isFeatured: false,
    isPopular: true,
  },
  {
    name: 'Chicken Cheese Toast',
    description: 'Thick sliced brioche smothered with diced chicken in white bechamel, melted cheddar cheese, and Italian herbs.',
    category: CATEGORIES.NON_VEGETARIAN,
    price: 169,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    ingredients: ['Brioche Toast', 'Chicken Breast', 'Cheddar Cheese', 'Bechamel Sauce', 'Oregano'],
    allergens: ['Gluten', 'Dairy'],
    isAvailable: true,
    stockQuantity: 35,
    preparationTime: 12,
    isFeatured: false,
    isPopular: false,
  },

  // ==========================================
  // CATEGORY C: CAFÉ (10 Products)
  // ==========================================
  {
    name: 'Espresso',
    description: 'A rich and intense double shot extracted under high pressure from 100% single-origin Arabica beans, featuring a dense golden crema.',
    category: CATEGORIES.CAFE,
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Freshly Ground Arabica Coffee Beans', 'Filtered Water'],
    allergens: [],
    isAvailable: true,
    stockQuantity: 100,
    preparationTime: 4,
    isFeatured: false,
    isPopular: false,
    customizationOptions: {
      beverageAddons: [
        { name: 'Extra Espresso Shot', priceDelta: 40 },
        { name: 'Vanilla Syrup Shot', priceDelta: 30 },
      ],
      temperatureOptions: ['Hot'],
    },
  },
  {
    name: 'Americano',
    description: 'Double espresso shots gently poured over piping hot filtered water, highlighting smooth nutty and chocolate notes.',
    category: CATEGORIES.CAFE,
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Arabica Espresso', 'Hot Water'],
    allergens: [],
    isAvailable: true,
    stockQuantity: 100,
    preparationTime: 4,
    isFeatured: false,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (240ml)', priceDelta: 0 },
        { name: 'Large (360ml)', priceDelta: 40 },
      ],
      temperatureOptions: ['Hot', 'Iced'],
    },
  },
  {
    name: 'Cappuccino',
    description: 'Equal parts bold espresso, velvety steamed whole milk, and a thick, cloud-like layer of dense microfoam dusted with cocoa powder.',
    category: CATEGORIES.CAFE,
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Arabica Espresso', 'Whole Milk', 'Cocoa Powder'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 90,
    preparationTime: 6,
    isFeatured: true,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (240ml)', priceDelta: 0 },
        { name: 'Large (360ml)', priceDelta: 50 },
      ],
      beverageAddons: [
        { name: 'Oat Milk Substitute', priceDelta: 45 },
        { name: 'Almond Milk Substitute', priceDelta: 45 },
        { name: 'Cinnamon Dusting', priceDelta: 10 },
      ],
      sweetnessLevels: ['Unsweetened', 'Less Sweet', 'Regular Sweet'],
      temperatureOptions: ['Hot'],
    },
  },
  {
    name: 'Café Latte',
    description: 'A delicate espresso base balanced with silky steamed milk and finished with a thin layer of foam and free-poured latte art.',
    category: CATEGORIES.CAFE,
    price: 170,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Arabica Espresso', 'Steamed Milk', 'Microfoam'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 90,
    preparationTime: 6,
    isFeatured: false,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (250ml)', priceDelta: 0 },
        { name: 'Large (380ml)', priceDelta: 50 },
      ],
      beverageAddons: [
        { name: 'Oat Milk Substitute', priceDelta: 45 },
        { name: 'Caramel Drizzle', priceDelta: 30 },
        { name: 'Hazelnut Syrup', priceDelta: 30 },
      ],
      sweetnessLevels: ['Unsweetened', 'Less Sweet', 'Regular Sweet'],
      temperatureOptions: ['Hot', 'Iced'],
    },
  },
  {
    name: 'Mocha',
    description: 'Harmonious fusion of rich dark chocolate syrup, freshly pulled espresso, and steamed milk, topped with whipped cream.',
    category: CATEGORIES.CAFE,
    price: 190,
    imageUrl: 'https://images.unsplash.com/photo-1596078841242-15ffec3cfa7d?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Dark Chocolate Syrup', 'Espresso', 'Steamed Milk', 'Whipped Cream'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 80,
    preparationTime: 7,
    isFeatured: true,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (280ml)', priceDelta: 0 },
        { name: 'Large (400ml)', priceDelta: 55 },
      ],
      sweetnessLevels: ['Standard', 'Extra Sweet'],
      temperatureOptions: ['Hot', 'Iced'],
    },
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled Arabica coffee blended with whole milk, vanilla cream, cane sugar, and crushed ice, topped with chocolate drizzle.',
    category: CATEGORIES.CAFE,
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Chilled Coffee', 'Milk', 'Vanilla Cream', 'Chocolate Drizzle', 'Ice'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 85,
    preparationTime: 5,
    isFeatured: true,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (350ml)', priceDelta: 0 },
        { name: 'Large (500ml)', priceDelta: 50 },
      ],
      beverageAddons: [
        { name: 'Vanilla Ice Cream Scoop', priceDelta: 40 },
        { name: 'Crushed Brownie Bits', priceDelta: 40 },
      ],
      sweetnessLevels: ['Less Sweet', 'Regular Sweet', 'Extra Sweet'],
      temperatureOptions: ['Iced'],
    },
  },
  {
    name: 'Iced Latte',
    description: 'Chilled milk poured over crystal ice cubes and crowned with a fresh double shot of espresso for a refreshing morning lift.',
    category: CATEGORIES.CAFE,
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Espresso', 'Cold Milk', 'Ice Cubes'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 75,
    preparationTime: 5,
    isFeatured: false,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (350ml)', priceDelta: 0 },
        { name: 'Large (500ml)', priceDelta: 45 },
      ],
      beverageAddons: [
        { name: 'Oat Milk Substitute', priceDelta: 45 },
        { name: 'Vanilla Syrup Shot', priceDelta: 30 },
      ],
      temperatureOptions: ['Iced'],
    },
  },
  {
    name: 'Hot Chocolate',
    description: 'Thick, comforting artisanal drinking chocolate melted with whole milk and real Belgian cocoa, served with soft marshmallows.',
    category: CATEGORIES.CAFE,
    price: 175,
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Belgian Dark Chocolate', 'Cocoa Butter', 'Whole Milk', 'Marshmallows'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 70,
    preparationTime: 6,
    isFeatured: false,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (250ml)', priceDelta: 0 },
        { name: 'Large (380ml)', priceDelta: 50 },
      ],
      beverageAddons: [
        { name: 'Extra Marshmallows', priceDelta: 25 },
        { name: 'Whipped Cream', priceDelta: 30 },
      ],
      temperatureOptions: ['Hot'],
    },
  },
  {
    name: 'Masala Tea',
    description: 'Authentic Indian chai brewed with premium Assam CTC tea leaves, fresh crushed ginger, cardamom pods, cinnamon, and whole milk.',
    category: CATEGORIES.CAFE,
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Assam Black Tea', 'Fresh Ginger', 'Cardamom', 'Cinnamon', 'Clove', 'Milk'],
    allergens: ['Dairy'],
    isAvailable: true,
    stockQuantity: 120,
    preparationTime: 6,
    isFeatured: false,
    isPopular: true,
    customizationOptions: {
      sweetnessLevels: ['Unsweetened', 'Mild Sweet', 'Regular Sweet', 'Kadak (Strong Sweet)'],
      temperatureOptions: ['Hot'],
    },
  },
  {
    name: 'Chocolate Milkshake',
    description: 'Thick and creamy gourmet shake prepared with rich dark chocolate fudge, chilled milk, and premium chocolate gelato.',
    category: CATEGORIES.CAFE,
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    ingredients: ['Chocolate Gelato', 'Choco Fudge', 'Chilled Whole Milk', 'Choco Wafers'],
    allergens: ['Dairy', 'Gluten'],
    isAvailable: true,
    stockQuantity: 60,
    preparationTime: 7,
    isFeatured: true,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: 'Regular (350ml)', priceDelta: 0 },
        { name: 'Monster Jar (500ml)', priceDelta: 60 },
      ],
      beverageAddons: [
        { name: 'Oreo Crumbs', priceDelta: 35 },
        { name: 'Nutella Swirl', priceDelta: 45 },
      ],
      temperatureOptions: ['Iced'],
    },
  },
];

/**
 * INITIAL PROMOTIONAL COUPONS
 */
const initialCoupons = [
  {
    code: 'WELCOME50',
    description: 'Get 50% discount on your first order up to ₹150',
    discountType: 'percentage',
    discountAmount: 50,
    minOrderValue: 200,
    maxDiscountAmount: 150,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    usageLimit: 1000,
    isActive: true,
  },
  {
    code: 'BAKERY100',
    description: 'Flat ₹100 off on gourmet cakes and bakery orders above ₹500',
    discountType: 'fixed',
    discountAmount: 100,
    minOrderValue: 500,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    applicableCategories: [CATEGORIES.BAKERY],
    isActive: true,
  },
  {
    code: 'CAFE20',
    description: '20% off on all Café beverages and coffee',
    discountType: 'percentage',
    discountAmount: 20,
    minOrderValue: 150,
    maxDiscountAmount: 80,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    applicableCategories: [CATEGORIES.CAFE],
    isActive: true,
  },
];

/**
 * IDEMPOTENT SEED EXECUTION
 * Uses findOneAndUpdate with upsert: true matching on 'name' so re-running never creates duplicate products!
 */
async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_bakery_cafe';

  console.log(`[Seed Script] Connecting to database: ${uri}`);
  await mongoose.connect(uri);

  console.log('[Seed Script] Seeding initial 30 products across Bakery, Non-Veg, and Café...');

  let upsertedCount = 0;
  for (const item of initialProducts) {
    const updated = await Product.findOneAndUpdate(
      { name: item.name },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create an initial active freshness batch for every product
    await InventoryBatch.findOneAndUpdate(
      { product: updated._id, batchNumber: `BATCH-${item.category.substring(0, 3).toUpperCase()}-001` },
      {
        $set: {
          product: updated._id,
          batchNumber: `BATCH-${item.category.substring(0, 3).toUpperCase()}-001`,
          quantity: item.stockQuantity,
          remainingQuantity: item.stockQuantity,
          manufacturingDate: new Date(),
          expiryDate: new Date(Date.now() + (item.category === CATEGORIES.BAKERY ? 4 : 7) * 24 * 60 * 60 * 1000),
          status: 'active',
        },
      },
      { upsert: true, new: true }
    );

    upsertedCount++;
  }

  console.log(`[Seed Script] Successfully verified and upserted ${upsertedCount} unique products.`);

  // Seed Default Store Settings
  console.log('[Seed Script] Ensuring default Bakery store settings...');
  await BakerySettings.getSettings();

  // Seed Promotional Coupons
  console.log('[Seed Script] Seeding default promotional coupons...');
  for (const coupon of initialCoupons) {
    await Coupon.findOneAndUpdate(
      { code: coupon.code },
      { $set: coupon },
      { upsert: true, new: true }
    );
  }

  console.log('[Seed Script] Database seed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

// Execute seed if run directly from CLI
if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error(`[Seed Script Error] Seeding failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { initialProducts, initialCoupons, seedDatabase };
