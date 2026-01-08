"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("./config/db");
const Category_1 = require("./models/Category");
const Product_1 = require("./models/Product");
const ProductVariant_1 = require("./models/ProductVariant");
dotenv_1.default.config();
if (process.env.NODE_ENV !== "development") {
    console.error("❌ Seeding is disabled outside development environment");
    process.exit(1);
}
/**
 * Uporaba:
 *   npm run seed              -> upsert (NE briše, ID-ji ostanejo stabilni)
 *   npm run seed -- --reset   -> pobriše in na novo vstavi (ID-ji se spremenijo)
 */
const SHOULD_RESET = process.argv.includes("--reset");
// Helper: stabilen ObjectId iz string ključa (da imaš stabilne _id-je med seeding-i)
function stableObjectId(key) {
    const hex = crypto_1.default.createHash("md5").update(key).digest("hex").slice(0, 24);
    return new mongoose_1.default.Types.ObjectId(hex);
}
async function seed() {
    try {
        await (0, db_1.connectDB)();
        console.log("DB host:", mongoose_1.default.connection.host);
        console.log("DB name:", mongoose_1.default.connection.name);
        if (SHOULD_RESET) {
            console.log("⚠️ RESET mode: clearing existing data...");
            await ProductVariant_1.ProductVariant.deleteMany({});
            await Product_1.Product.deleteMany({});
            await Category_1.Category.deleteMany({});
        }
        else {
            console.log("✅ UPSERT mode: keeping existing data (stable IDs).");
        }
        // -------------------------
        // Categories (stable IDs)
        // -------------------------
        console.log("Upserting categories...");
        const categoryDocs = [
            { _id: stableObjectId("cat:cestna"), name: "Cestna kolesa" },
            { _id: stableObjectId("cat:gorska"), name: "Gorska kolesa" },
            { _id: stableObjectId("cat:celade"), name: "Čelade" },
            { _id: stableObjectId("cat:oblacila"), name: "Kolesarska oblačila" },
        ];
        for (const c of categoryDocs) {
            await Category_1.Category.updateOne({ _id: c._id }, { $set: c }, { upsert: true });
        }
        const roadCat = categoryDocs[0];
        const mtbCat = categoryDocs[1];
        const helmetCat = categoryDocs[2];
        const clothingCat = categoryDocs[3];
        // -------------------------
        // Products (stable IDs)
        // -------------------------
        console.log("Upserting products...");
        // ✅ FRONTEND public: /public/product-images/*
        // Angular servira kot: /product-images/<file>
        const productDocs = [
            // SPECIALIZED – CESTNA KOLESA
            {
                _id: stableObjectId("prod:specialized-allez"),
                type: "cycles",
                category: roadCat._id,
                name: "Specialized Allez",
                short_description: "Lahko aluminijasto cestno kolo za rekreativce.",
                long_description: "Specialized Allez je vsestransko cestno kolo, idealno za začetnike in tiste, ki iščejo hitro in odzivno vožnjo.",
                price: 999.99,
                brand: "Specialized",
                image_url: "/product-images/SpecializedAllez.webp",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.specialized.com",
            },
            {
                _id: stableObjectId("prod:specialized-tarmac-sl7"),
                type: "cycles",
                category: roadCat._id,
                name: "Specialized Tarmac SL7",
                short_description: "Dirkalno cestno kolo z vrhunsko aerodinamiko.",
                long_description: "Tarmac SL7 združuje aerodinamiko Venge-a in lahkotnost prejšnjih Tarmac modelov.",
                price: 5500,
                brand: "Specialized",
                image_url: "/product-images/TarmacSL7.webp",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.specialized.com",
            },
            {
                _id: stableObjectId("prod:sworks-tarmac-sl8"),
                type: "cycles",
                category: roadCat._id,
                name: "Specialized S-Works Tarmac SL8",
                short_description: "Najhitrejše Specialized kolo – vrh zmogljivosti.",
                long_description: "S-Works Tarmac SL8 je zasnovan za tekmovalce, ki želijo najboljše možno razmerje med aerodinamiko, težo in togostjo.",
                price: 14500,
                brand: "S-Works",
                image_url: "/product-images/Specialized S-Works Tarmac SL8.webp",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.specialized.com",
            },
            {
                _id: stableObjectId("prod:sworks-roubaix"),
                type: "cycles",
                category: roadCat._id,
                name: "Specialized S-Works Roubaix",
                short_description: "Udobno endurance kolo z FutureShock tehnologijo.",
                long_description: "S-Works Roubaix omogoča izjemno udobje na dolgih turah in slabih cestah.",
                price: 12000,
                brand: "S-Works",
                image_url: "/product-images/Specialized S-Works Roubaix.webp",
                inStock: false,
                warrantyMonths: 24,
                officialProductSite: "https://www.specialized.com",
            },
            // MTB
            {
                _id: stableObjectId("prod:trek-marlin-7"),
                type: "cycles",
                category: mtbCat._id,
                name: "Trek Marlin 7",
                short_description: "Gorsko kolo za trail ture.",
                long_description: "Trek Marlin 7 je odlično izhodišče za XC in trail vožnjo.",
                price: 899.95,
                brand: "Trek",
                image_url: "/product-images/Trek Marlin 7.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.trekbikes.com",
            },
            // ČELADE
            {
                _id: stableObjectId("prod:met-trenta-3k"),
                type: "equipment",
                category: helmetCat._id,
                name: "MET Trenta 3K Carbon MIPS",
                short_description: "Čelada z MIPS in 3K ogljikovim okvirjem.",
                long_description: "MET Trenta 3K Carbon MIPS ponuja razmerje med težo, varnostjo in zračnostjo.",
                price: 299,
                brand: "MET",
                image_url: "/product-images/MET Trenta 3K Carbon MIPS.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://met-helmets.com",
            },
            {
                _id: stableObjectId("prod:met-rivale"),
                type: "equipment",
                category: helmetCat._id,
                name: "MET Rivale MIPS",
                short_description: "Aerodinamična čelada z MIPS zaščito.",
                long_description: "MET Rivale MIPS je odlična izbira za rekreativne in napredne kolesarje.",
                price: 159,
                brand: "MET",
                image_url: "/product-images/MET Rivale MIPS.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://met-helmets.com",
            },
            // OBLAČILA
            {
                _id: stableObjectId("prod:castelli-aero-race-jersey"),
                type: "clothing",
                category: clothingCat._id,
                name: "Castelli Aero Race Jersey",
                short_description: "Aerodinamična majica za hitre ture.",
                long_description: "Castelli Aero Race jersey je izdelan iz lahkih materialov in optimiziran za pretok zraka.",
                price: 119,
                brand: "Castelli",
                image_url: "/product-images/Castelli Aero Race Jersey.webp",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.castelli-cycling.com",
            },
            {
                _id: stableObjectId("prod:castelli-free-aero-rc"),
                type: "clothing",
                category: clothingCat._id,
                name: "Castelli Free Aero RC Bibshort",
                short_description: "Vrhunske hlače za dolge, intenzivne vožnje.",
                long_description: "Free Aero RC so ene najbolj udobnih kolesarskih hlač na trgu.",
                price: 169,
                brand: "Castelli",
                image_url: "/product-images/Castelli Free Aero RC Bibshort.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.castelli-cycling.com",
            },
            {
                _id: stableObjectId("prod:castelli-perfetto-ros"),
                type: "clothing",
                category: clothingCat._id,
                name: "Castelli Perfetto RoS Jacket",
                short_description: "Lahka zimska jakna z vodoodporno membrano.",
                long_description: "Perfetto RoS nudi zaščito pred vetrom in rahlim dežjem, hkrati pa je zelo zračna.",
                price: 229,
                brand: "Castelli",
                image_url: "/product-images/Castelli Perfetto RoS Jacket1.jpg",
                inStock: false,
                warrantyMonths: 24,
                officialProductSite: "https://www.castelli-cycling.com",
            },
            // DODATNI PRODUKTI
            {
                _id: stableObjectId("prod:giant-contend-ar-1"),
                type: "cycles",
                category: roadCat._id,
                name: "Giant Contend AR 1",
                short_description: "Udobno endurance cestno kolo z več prostora za gume.",
                long_description: "Giant Contend AR 1 je primeren za dolge ture, slabše ceste in vsestransko uporabo.",
                price: 1899,
                brand: "Giant",
                image_url: "/product-images/Giant Contend AR 1.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.giant-bicycles.com",
            },
            {
                _id: stableObjectId("prod:canyon-endurace-cf7"),
                type: "cycles",
                category: roadCat._id,
                name: "Canyon Endurace CF 7",
                short_description: "Karbon endurance okvir in stabilna geometrija.",
                long_description: "Endurace CF 7 ponuja udobje in hitrost na daljših razdaljah ter odlično vrednost za denar.",
                price: 2399,
                brand: "Canyon",
                image_url: "/product-images/Canyon Endurace CF 7.png",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.canyon.com",
            },
            {
                _id: stableObjectId("prod:scott-scale-970"),
                type: "cycles",
                category: mtbCat._id,
                name: "Scott Scale 970",
                short_description: "XC hardtail za hitro vožnjo po makadamu in trailu.",
                long_description: "Scott Scale 970 je lahek in odziven hardtail, odlična izbira za XC rekreacijo.",
                price: 1299,
                brand: "Scott",
                image_url: "/product-images/Scott Scale 970.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.scott-sports.com",
            },
            {
                _id: stableObjectId("prod:cube-reaction-tm"),
                type: "cycles",
                category: mtbCat._id,
                name: "Cube Reaction TM",
                short_description: "Trail hardtail z robustnejšo opremo in geometrijo.",
                long_description: "Cube Reaction TM je pripravljen na zahtevnejše traile in agresivnejšo vožnjo.",
                price: 1599,
                brand: "Cube",
                image_url: "/product-images/Cube Reaction TM.jpg",
                inStock: false,
                warrantyMonths: 24,
                officialProductSite: "https://www.cube.eu",
            },
            {
                _id: stableObjectId("prod:giro-syntax-mips"),
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
                image_url: "/product-images/Giro Syntax MIPS.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.giro.com",
            },
            {
                _id: stableObjectId("prod:poc-ventral-air-mips"),
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
                image_url: "/product-images/POC Ventral Air MIPS.webp",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://poc.com",
            },
            {
                _id: stableObjectId("prod:bell-z20-mips"),
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
                image_url: "/product-images/Bell Z20 MIPS.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.bellhelmets.com",
            },
            {
                _id: stableObjectId("prod:rapha-core-jersey"),
                type: "clothing",
                category: clothingCat._id,
                name: "Rapha Core Jersey",
                short_description: "Minimalistična majica za vsakodnevne ture.",
                long_description: "Rapha Core Jersey je zasnovana za udobje, dobro prileganje in zanesljivo uporabo.",
                price: 95,
                brand: "Rapha",
                image_url: "/product-images/Rapha Core Jersey1.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.rapha.cc",
            },
            {
                _id: stableObjectId("prod:assos-mille-gt-bibshorts"),
                type: "clothing",
                category: clothingCat._id,
                name: "Assos Mille GT Bib Shorts",
                short_description: "Udobne bib hlače za dolge razdalje.",
                long_description: "Assos Mille GT ponuja vrhunsko udobje in stabilnost pri večurnih vožnjah.",
                price: 199,
                brand: "Assos",
                image_url: "/product-images/Assos Mille GT Bib Shorts1.webp",
                inStock: false,
                warrantyMonths: 24,
                officialProductSite: "https://www.assos.com",
            },
            {
                _id: stableObjectId("prod:sportful-fiandre-light-jacket"),
                type: "clothing",
                category: clothingCat._id,
                name: "Sportful Fiandre Light Jacket",
                short_description: "Lahka jakna za prehodno vreme.",
                long_description: "Fiandre Light jakna je odlična za vetrovne razmere in hladnejše jutranje ture.",
                price: 179,
                brand: "Sportful",
                image_url: "/product-images/Sportful Fiandre Light Jacket1.jpg",
                inStock: true,
                warrantyMonths: 24,
                officialProductSite: "https://www.sportful.com",
            },
        ];
        for (const p of productDocs) {
            await Product_1.Product.updateOne({ _id: p._id }, { $set: p }, { upsert: true });
        }
        // -------------------------
        // Variants (stable IDs)
        // -------------------------
        console.log("Upserting product variants...");
        const variantDocs = [
            {
                _id: stableObjectId("var:allez-54"),
                product: stableObjectId("prod:specialized-allez"),
                variant_name: "Velikost 54",
                sku: "ALLEZ-54",
                stock_quantity: 5,
                extra_price: 0,
            },
            {
                _id: stableObjectId("var:allez-56"),
                product: stableObjectId("prod:specialized-allez"),
                variant_name: "Velikost 56",
                sku: "ALLEZ-56",
                stock_quantity: 3,
                extra_price: 0,
            },
            {
                _id: stableObjectId("var:tarmac-54"),
                product: stableObjectId("prod:specialized-tarmac-sl7"),
                variant_name: "Velikost 54",
                sku: "TARMAC-54",
                stock_quantity: 2,
                extra_price: 0,
            },
            {
                _id: stableObjectId("var:tarmac-56"),
                product: stableObjectId("prod:specialized-tarmac-sl7"),
                variant_name: "Velikost 56",
                sku: "TARMAC-56",
                stock_quantity: 1,
                extra_price: 0,
            },
            {
                _id: stableObjectId("var:marlin-m"),
                product: stableObjectId("prod:trek-marlin-7"),
                variant_name: "Velikost M",
                sku: "MARLIN-M",
                stock_quantity: 4,
                extra_price: 0,
            },
        ];
        for (const v of variantDocs) {
            await ProductVariant_1.ProductVariant.updateOne({ _id: v._id }, { $set: v }, { upsert: true });
        }
        console.log("✅ Seeding finished.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
}
seed();
