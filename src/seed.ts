import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { ProductVariant } from "./models/ProductVariant";

dotenv.config();

if (process.env.NODE_ENV !== "development") {
  console.error("❌ Seeding is disabled outside development environment");
  process.exit(1);
}

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
    const clothingCat = categories.find((c) => c.name === "Kolesarska oblačila")!;

    console.log("Inserting products...");
    const products = await Product.insertMany([
      // ---------------------------
      // SPECIALIZED – CESTNA KOLESA
      // ---------------------------
      {
        type: "cycles",
        category: roadCat._id,
        name: "Specialized Allez",
        short_description: "Lahko aluminijasto cestno kolo za rekreativce.",
        long_description:
          "Specialized Allez je vsestransko cestno kolo, idealno za začetnike in tiste, ki iščejo hitro in odzivno vožnjo.",
        price: 999.99,
        brand: "Specialized",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.specialized.com",
      },
      {
        type: "cycles",
        category: roadCat._id,
        name: "Specialized Tarmac SL7",
        short_description: "Dirkalno cestno kolo z vrhunsko aerodinamiko.",
        long_description:
          "Tarmac SL7 združuje aerodinamiko Venge-a in lahkotnost prejšnjih Tarmac modelov.",
        price: 5500,
        brand: "Specialized",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.specialized.com",
      },
      {
        type: "cycles",
        category: roadCat._id,
        name: "Specialized S-Works Tarmac SL8",
        short_description: "Najhitrejše Specialized kolo – vrh zmogljivosti.",
        long_description:
          "S-Works Tarmac SL8 je zasnovan za tekmovalce, ki želijo najboljše možno razmerje med aerodinamiko, težo in togostjo.",
        price: 14500,
        brand: "S-Works",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.specialized.com",
      },
      {
        type: "cycles",
        category: roadCat._id,
        name: "Specialized S-Works Roubaix",
        short_description: "Udobno endurance kolo z FutureShock tehnologijo.",
        long_description:
          "S-Works Roubaix omogoča izjemno udobje na dolgih turah in slabih cestah.",
        price: 12000,
        brand: "S-Works",
        image_url: "",
        inStock: false,
        warrantyMonths: 24,
        officialProductSite: "https://www.specialized.com",
      },

      // ---------------------------
      // MTB KOLO
      // ---------------------------
      {
        type: "cycles",
        category: mtbCat._id,
        name: "Trek Marlin 7",
        short_description: "Gorsko kolo za trail ture.",
        long_description:
          "Trek Marlin 7 je odlično izhodišče za XC in trail vožnjo.",
        price: 899.95,
        brand: "Trek",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.trekbikes.com",
      },

      // ---------------------------
      // MET ČELADE
      // ---------------------------
      {
        type: "equipment",
        category: helmetCat._id,
        name: "MET Trenta 3K Carbon MIPS",
        short_description: "Čelada z MIPS in 3K ogljikovim okvirjem.",
        long_description:
          "MET Trenta 3K Carbon MIPS ponuja razmerje med težo, varnostjo in zračnostjo.",
        price: 299,
        brand: "MET",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://met-helmets.com",
      },
      {
        type: "equipment",
        category: helmetCat._id,
        name: "MET Rivale MIPS",
        short_description: "Aerodinamična čelada z MIPS zaščito.",
        long_description:
          "MET Rivale MIPS je odlična izbira za rekreativne in napredne kolesarje.",
        price: 159,
        brand: "MET",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://met-helmets.com",
      },

      // ---------------------------
      // OBLAČILA
      // ---------------------------
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Castelli Aero Race Jersey",
        short_description: "Aerodinamična majica za hitre ture.",
        long_description:
          "Castelli Aero Race jersey je izdelan iz lahkih materialov in optimiziran za pretok zraka.",
        price: 119,
        brand: "Castelli",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.castelli-cycling.com",
      },
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Castelli Free Aero RC Bibshort",
        short_description: "Vrhunske hlače za dolge, intenzivne vožnje.",
        long_description:
          "Free Aero RC so ene najbolj udobnih kolesarskih hlač na trgu.",
        price: 169,
        brand: "Castelli",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.castelli-cycling.com",
      },
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Castelli Perfetto RoS Jacket",
        short_description: "Lahka zimska jakna z vodoodporno membrano.",
        long_description:
          "Perfetto RoS nudi zaščito pred vetrom in rahlim dežjem, hkrati pa je zelo zračna.",
        price: 229,
        brand: "Castelli",
        image_url: "",
        inStock: false,
        warrantyMonths: 24,
        officialProductSite: "https://www.castelli-cycling.com",
      },

      // =========================================================
      // DODANIH 10 PRODUKTOV (da imaš več data za testiranje)
      // =========================================================

      // --- cycles (road) ---
      {
        type: "cycles",
        category: roadCat._id,
        name: "Giant Contend AR 1",
        short_description: "Udobno endurance cestno kolo z več prostora za gume.",
        long_description:
          "Giant Contend AR 1 je primeren za dolge ture, slabše ceste in vsestransko uporabo.",
        price: 1899,
        brand: "Giant",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.giant-bicycles.com",
      },
      {
        type: "cycles",
        category: roadCat._id,
        name: "Canyon Endurace CF 7",
        short_description: "Karbon endurance okvir in stabilna geometrija.",
        long_description:
          "Endurace CF 7 ponuja udobje in hitrost na daljših razdaljah ter odlično vrednost za denar.",
        price: 2399,
        brand: "Canyon",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.canyon.com",
      },

      // --- cycles (mtb) ---
      {
        type: "cycles",
        category: mtbCat._id,
        name: "Scott Scale 970",
        short_description: "XC hardtail za hitro vožnjo po makadamu in trailu.",
        long_description:
          "Scott Scale 970 je lahek in odziven hardtail, odlična izbira za XC rekreacijo.",
        price: 1299,
        brand: "Scott",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.scott-sports.com",
      },
      {
        type: "cycles",
        category: mtbCat._id,
        name: "Cube Reaction TM",
        short_description: "Trail hardtail z robustnejšo opremo in geometrijo.",
        long_description:
          "Cube Reaction TM je pripravljen na zahtevnejše traile in agresivnejšo vožnjo.",
        price: 1599,
        brand: "Cube",
        image_url: "",
        inStock: false,
        warrantyMonths: 24,
        officialProductSite: "https://www.cube.eu",
      },

      // --- equipment (helmets) ---
      {
        type: "equipment",
        category: helmetCat._id,
        name: "Giro Syntax MIPS",
        short_description: "Udobna cestna čelada z MIPS in dobro ventilacijo.",
        long_description: "Giro Syntax MIPS združuje varnost, udobje in zračnost za cestne ter gravel vožnje.",
        price: 129,
        brand: "Giro",
        material: "Polikarbonat",
        weight: 280,
        compatibility: ["Road", "Gravel"],
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.giro.com",
      },
      {
        type: "equipment",
        category: helmetCat._id,
        name: "POC Ventral Air MIPS",
        short_description: "Zelo zračna čelada za vroče dni in intenzivno vožnjo.",
        long_description: "POC Ventral Air MIPS je optimiziran za pretok zraka in udobje pri visokih temperaturah.",
        price: 249,
        brand: "POC",
        material: "Polikarbonat",
        weight: 250,
        compatibility: ["Road", "Gravel"],
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://poc.com",
      },
      {
        type: "equipment",
        category: helmetCat._id,
        name: "Bell Z20 MIPS",
        short_description: "Lahka in varna cestna čelada z MIPS.",
        long_description: "Bell Z20 MIPS je znan po udobju, zračnosti in dobri zaščiti pri padcih.",
        price: 189,
        brand: "Bell",
        material: "Polikarbonat",
        weight: 265,
        compatibility: ["Road"],
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.bellhelmets.com",
      },

      // --- clothing ---
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Rapha Core Jersey",
        short_description: "Minimalistična majica za vsakodnevne ture.",
        long_description:
          "Rapha Core Jersey je zasnovana za udobje, dobro prileganje in zanesljivo uporabo.",
        price: 95,
        brand: "Rapha",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.rapha.cc",
      },
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Assos Mille GT Bib Shorts",
        short_description: "Udobne bib hlače za dolge razdalje.",
        long_description:
          "Assos Mille GT ponuja vrhunsko udobje in stabilnost pri večurnih vožnjah.",
        price: 199,
        brand: "Assos",
        image_url: "",
        inStock: false,
        warrantyMonths: 24,
        officialProductSite: "https://www.assos.com",
      },
      {
        type: "clothing",
        category: clothingCat._id,
        name: "Sportful Fiandre Light Jacket",
        short_description: "Lahka jakna za prehodno vreme.",
        long_description:
          "Fiandre Light jakna je odlična za vetrovne razmere in hladnejše jutranje ture.",
        price: 179,
        brand: "Sportful",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.sportful.com",
      },
      {
        type: "equipment",
        category: helmetCat._id,
        name: "Bell Z20 MIPS",
        short_description: "Lahka in varna cestna čelada z MIPS.",
        long_description:
          "Bell Z20 MIPS je znan po udobju, zračnosti in dobri zaščiti pri padcih.",
        price: 189,
        brand: "Bell",
        image_url: "",
        inStock: true,
        warrantyMonths: 24,
        officialProductSite: "https://www.bellhelmets.com",
      },
    ]);

    console.log("Inserting product variants...");
    await ProductVariant.insertMany([
      // products[0] Specialized Allez
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

      // products[1] Specialized Tarmac SL7
      {
        product: products[1]._id,
        variant_name: "Velikost 54",
        sku: "TARMAC-54",
        stock_quantity: 2,
        extra_price: 0,
      },
      {
        product: products[1]._id,
        variant_name: "Velikost 56",
        sku: "TARMAC-56",
        stock_quantity: 1,
        extra_price: 0,
      },

      // products[4] Trek Marlin 7 
      {
        product: products[4]._id,
        variant_name: "Velikost M",
        sku: "MARLIN-M",
        stock_quantity: 4,
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
