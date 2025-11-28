import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { ProductVariant } from "./models/ProductVariant";

dotenv.config();

async function seed() {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await ProductVariant.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("Inserting categories...");
    const categories = await Category.insertMany([
      { name: "Cestna kolesa" },
      { name: "Gorska kolesa" },
      { name: "Čelade" },
      { name: "Kolesarska oblačila" }
    ]);

    const roadCat = categories.find(c => c.name === "Cestna kolesa")!;
    const mtbCat = categories.find(c => c.name === "Gorska kolesa")!;
    const helmetCat = categories.find(c => c.name === "Čelade")!;
    const clothingCat = categories.find(c => c.name === "Kolesarska oblačila")!;

    console.log("Inserting products...");
    const products = await Product.insertMany([
      {
        category: roadCat._id,
        name: "Specialized Allez",
        short_description: "Lahko aluminijasto cestno kolo za začetnike.",
        long_description: "Specialized Allez je vsestransko cestno kolo primerno za rekreativce...",
        price: 999.99,
        brand: "Specialized",
        image_url: ""
      },
      {
        category: mtbCat._id,
        name: "Trek Marlin 7",
        short_description: "Gorsko kolo za trail ture.",
        long_description: "Trek Marlin 7 je odlično izhodišče za XC in trail vožnjo...",
        price: 899.95,
        brand: "Trek",
        image_url: ""
      },
      {
        category: helmetCat._id,
        name: "Giro Helios",
        short_description: "Lahka in zračna cestna čelada.",
        long_description: "Giro Helios ponuja napredno zaščito in odlično prezračevanje...",
        price: 219.0,
        brand: "Giro",
        image_url: ""
      },
      {
        category: clothingCat._id,
        name: "Castelli Jersey",
        short_description: "Kolesarska majica za poletje.",
        long_description: "Castelli majica iz lahkih materialov za vroče dni na kolesu...",
        price: 79.9,
        brand: "Castelli",
        image_url: ""
      }
    ]);

    console.log("Inserting product variants...");
    await ProductVariant.insertMany([
      {
        product: products[0]._id,
        variant_name: "Velikost 54",
        sku: "ALLEZ-54",
        stock_quantity: 5,
        extra_price: 0
      },
      {
        product: products[0]._id,
        variant_name: "Velikost 56",
        sku: "ALLEZ-56",
        stock_quantity: 3,
        extra_price: 0
      }
    ]);

    console.log("Seeding finished.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
