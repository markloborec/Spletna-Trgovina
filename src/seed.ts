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
      { name: "Kolesarska oblačila" },
    ]);

    const roadCat = categories.find((c) => c.name === "Cestna kolesa")!;
    const mtbCat = categories.find((c) => c.name === "Gorska kolesa")!;
    const helmetCat = categories.find((c) => c.name === "Čelade")!;
    const clothingCat = categories.find(
      (c) => c.name === "Kolesarska oblačila"
    )!;

    console.log("Inserting products...");
    const products = await Product.insertMany([
      // ---------------------------
      // SPECIALIZED – CESTNA KOLESA
      // ---------------------------
      {
        category: roadCat._id,
        name: "Specialized Allez",
        short_description: "Lahko aluminijasto cestno kolo za rekreativce.",
        long_description:
          "Specialized Allez je vsestransko cestno kolo, idealno za začetnike in tiste, ki iščejo hitro in odzivno vožnjo.",
        price: 999.99,
        brand: "Specialized",
        image_url: "",
      },
      {
        category: roadCat._id,
        name: "Specialized Tarmac SL7",
        short_description: "Dirkalno cestno kolo z vrhunsko aerodinamiko.",
        long_description:
          "Tarmac SL7 združuje aerodinamiko Venge-a in lahkotnost prejšnjih Tarmac modelov. Profesionalna izbira za maksimalno učinkovitost.",
        price: 5500,
        brand: "Specialized",
        image_url: "",
      },
      {
        category: roadCat._id,
        name: "Specialized S-Works Tarmac SL8",
        short_description:
          "Najhitrejše Specialized kolo – vrh zmogljivosti.",
        long_description:
          "S-Works Tarmac SL8 je zasnovan za tekmovalce, ki želijo najboljše možno razmerje med aerodinamiko, težo in togostjo.",
        price: 14500,
        brand: "S-Works",
        image_url: "",
      },
      {
        category: roadCat._id,
        name: "Specialized S-Works Roubaix",
        short_description:
          "Udobno endurance kolo z FutureShock tehnologijo.",
        long_description:
          "S-Works Roubaix omogoča izjemno udobje na dolgih turah in slabih cestah, zahvaljujoč FutureShock vzmetenju.",
        price: 12000,
        brand: "S-Works",
        image_url: "",
      },

      // ---------------------------
      // MTB KOLO 
      // ---------------------------
      {
        category: mtbCat._id,
        name: "Trek Marlin 7",
        short_description: "Gorsko kolo za trail ture.",
        long_description:
          "Trek Marlin 7 je odlično izhodišče za XC in trail vožnjo po gozdnih poteh in enoslednicah.",
        price: 899.95,
        brand: "Trek",
        image_url: "",
      },

      // ---------------------------
      // MET ČELADE
      // ---------------------------
      {
        category: helmetCat._id,
        name: "MET Trenta 3K Carbon MIPS",
        short_description:
          "Čelada z MIPS in 3K ogljikovim okvirjem – Pogačarjeva izbira.",
        long_description:
          "MET Trenta 3K Carbon MIPS ponuja izjemno razmerje med težo, varnostjo in zračnostjo. Uporablja jo tudi Tadej Pogačar v WorldTouru.",
        price: 299,
        brand: "MET",
        image_url: "",
      },
      {
        category: helmetCat._id,
        name: "MET Rivale MIPS",
        short_description:
          "Aerodinamična čelada z izboljšano varnostjo MIPS.",
        long_description:
          "MET Rivale MIPS je idealna za rekreativne in napredne kolesarje, ki želijo nižjo ceno, a vrhunsko zaščito in aerodinamiko.",
        price: 159,
        brand: "MET",
        image_url: "",
      },

      // ---------------------------
      // OBLAČILA
      // ---------------------------
      {
        category: clothingCat._id,
        name: "Castelli Aero Race Jersey",
        short_description: "Aerodinamična majica za hitre ture.",
        long_description:
          "Castelli Aero Race jersey je izdelan iz lahkih materialov in optimiziran za pretok zraka – idealen za vroče dni in intervalne treninge.",
        price: 119,
        brand: "Castelli",
        image_url: "",
      },
      {
        category: clothingCat._id,
        name: "Castelli Free Aero RC Bibshort",
        short_description:
          "Vrhunske hlače za dolge, intenzivne vožnje.",
        long_description:
          "Free Aero RC so ene najbolj udobnih kolesarskih hlač na trgu, zasnovane za profesionalne kolesarje in dolge treninge.",
        price: 169,
        brand: "Castelli",
        image_url: "",
      },
      {
        category: clothingCat._id,
        name: "Castelli Perfetto RoS Jacket",
        short_description: "Lahka zimska jakna z vodoodporno membrano.",
        long_description:
          "Perfetto RoS nudi zaščito pred vetrom in rahlim dežjem, hkrati pa je zelo zračna. Izvrstna za prehodna obdobja in hladnejše dni.",
        price: 229,
        brand: "Castelli",
        image_url: "",
      },
    ]);

    console.log("Inserting product variants...");
    await ProductVariant.insertMany([
      {
        product: products[0]._id,
        variant_name: "Velikost 54",
        sku: "ALLEZ-54",
        stock_quantity: 5,
        extra_price: 0,
      },
      {
        product: products[0]._id,
        variant_name: "Velikost 56",
        sku: "ALLEZ-56",
        stock_quantity: 3,
        extra_price: 0,
      },
    ]);

    console.log("Seeding finished.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
