const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    productId: 1,
    name: "Wireless Headphones",
    category: "Audio",
    price: 2999,
    oldPrice: 3999,
    discount: 25,
    rating: 4.7,
    reviews: 245,
    ai: true,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700",
      "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=700",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700",
    ],
    specifications: {
      Brand: "Sony",
      Model: "WH-1000XM5",
      Color: "Black",
      Battery: "30 Hours",
      Bluetooth: "5.3",
      Weight: "250 g",
      Driver: "30 mm",
      Microphone: "Built-in",
      NoiseCancellation: "Active",
      Charging: "USB Type-C",
      Warranty: "1 Year",
    },
  },

  {
    productId: 2,
    name: "Gaming Mouse",
    category: "Gaming",
    price: 1499,
    oldPrice: 1999,
    discount: 20,
    rating: 4.5,
    reviews: 318,
    ai: false,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700",
      "https://images.unsplash.com/photo-1626779836378-00fcb42eb1aa?w=700",
      "https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=700",
    ],
    specifications: {
      Brand: "Razer",
      Model: "DeathAdder V2",
      Color: "Black",
      DPI: "20,000 DPI",
      Connectivity: "Wired USB",
      Weight: "82 g",
      Sensor: "Focus+ Optical",
      Buttons: "8 Programmable",
      Lighting: "Razer Chroma RGB",
      Warranty: "2 Years",
    },
  },

  {
    productId: 3,
    name: "Mechanical Keyboard",
    category: "Gaming",
    price: 3999,
    oldPrice: 5499,
    discount: 27,
    rating: 4.8,
    reviews: 504,
    ai: true,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=700",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=700",
      "https://images.unsplash.com/photo-1561478771-06b29d44c9b2?w=700",
    ],
    specifications: {
      Brand: "Keychron",
      Model: "K2 Wireless",
      Color: "Dark Grey",
      SwitchType: "Gateron Red",
      Connectivity: "Bluetooth 5.1 & Type-C",
      Battery: "4000 mAh",
      Backlight: "RGB Backlit",
      Weight: "790 g",
      Keycaps: "Double-shot ABS",
      Warranty: "1 Year",
    },
  },

  {
    productId: 4,
    name: "Smart Watch",
    category: "Wearables",
    price: 4999,
    oldPrice: 6999,
    discount: 29,
    rating: 4.6,
    reviews: 189,
    ai: false,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700",
      "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=700",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700",
    ],
    specifications: {
      Brand: "Apple",
      Model: "Watch Series 9",
      Color: "Midnight Aluminum",
      Display: "Always-On Retina OLED",
      Battery: "18 Hours",
      Bluetooth: "5.3",
      WaterResistance: "50 meters (WR50)",
      Sensors: "Heart Rate, SpO2, ECG",
      Weight: "39 g",
      Warranty: "1 Year",
    },
  },

  {
    productId: 5,
    name: "Ultra-Slim Laptop",
    category: "Electronics",
    price: 54999,
    oldPrice: 64999,
    discount: 15,
    rating: 4.9,
    reviews: 142,
    ai: true,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700",
    ],
    specifications: {
      Brand: "Apple",
      Model: "MacBook Air M2",
      Color: "Space Grey",
      Processor: "Apple M2 8-Core",
      RAM: "16 GB Unified",
      Storage: "512 GB SSD",
      Display: "13.6-inch Liquid Retina",
      Battery: "Up to 18 Hours",
      Weight: "1.24 kg",
      Warranty: "1 Year",
    },
  },

  {
    productId: 6,
    name: "Ergonomic Laptop Stand",
    category: "Accessories",
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.4,
    reviews: 98,
    ai: false,
    favorite: false,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700",
      "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=700",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700",
    ],
    specifications: {
      Brand: "Portronics",
      Model: "My Buddy K",
      Color: "Silver",
      Material: "Aluminum Alloy",
      Compatibility: "Laptops 10 to 17 inches",
      Adjustability: "6 Viewing Angles",
      Foldable: "Yes",
      Weight: "260 g",
      Warranty: "6 Months",
    },
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log(`✅ ${products.length} products inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Product seeding failed:", error);
    process.exit(1);
  }
};

seedProducts();