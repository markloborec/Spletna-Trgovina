# Športna Trgovina s kolesarsko opremo Bicklstore

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Spletna trgovina s kolesarsko opremo, razvita kot akademski projekt. Omogoča prikaz izdelkov, filtriranje, ogled kategorij, registracijo in prijavo uporabnika, večjezičnost ter osnovne podporne funkcije, potrebne za delovanje spletne trgovine. Projekt predstavlja temelje modernega spletnega trgovinskega sistema z ločenim frontendom in backendom.

## Trenutne funkcionalnosti (stanje do 6. cikla)
### Uporabniki
- Registracija in prijava uporabnika (JWT)
- Pridobivanje uporabniških podatkov (profil)
- Modalna okna za prijavo/registracijo
- Frontend funkcionalnost za pozabljeno geslo
- Prilagoditve za slepe in slabovidne.
  
![Bicikl store homepage](./img/Biciklstorehomepage.GIF)

### Izdelki in kategorije
- Prikaz vseh izdelkov (kolesa, oblačila, oprema)
- Prikaz podrobnosti izdelka
- Prikaz kategorij izdelkov
- Trije filtri za opremo
- Model in factory za produkt
- Seed podatki za izdelke, kategorije in variante
- Backend podpira delo z variantami (zaloga, cena, izračun košarice)
- urejanje seznama izdelkov (paginacija, filtriranje, sortiranje)

### Mnenja in ocene
- Dodajanje/posodabljanje mnenja in ocene za izdelek (prijavljen uporabnik)
- Pridobivanje seznama mnenj za izdelek
- Brisanje mnenja (avtor ali admin)
- Povprečna ocena in število ocen na produktu (agregacija)

### Navigacija in jezik
- Routing med stranmi
- Globalna menjava jezika 
### Informacije in poslovalnice
- Interaktivni zemljevid poslovalnic
- Kontaktna stran in obrazec

### 🛒Košarica 
- Definirana struktura košarice (productId, variantId, quantity)
- Izračun vmesne vsote (subtotal)
- Dodan izračun davka (DDV) in dostave
- Preverjanje zaloge na ravni variant
- Centralizirana logika izračuna cene

### 🛒Naročila (Orders/Checkout)
- Implementiran checkout proces, kjer se iz košarice ustvari naročilo
- Validacija zaloge in pravilnosti izbrane variante ob nakupu
- Podprte variante izdelkov z zalogo (velikost, količina)
- Snapshot podatkov izdelkov ob naročilu (ime, cena, varianta, količina)
- Samodejno znižanje zaloge po uspešno zaključenem checkoutu
- Samodejno praznjenje košarice po nakupu

## 💻Uporabljene tehnologije 
### Backend
- Node.js + Express
- MongoDB + Mongoose
### Frontend
- Angular
- Komponentna arhitektura
- Services za komunikacijo z API-ji
- Integriran Google Translate Website Widget
## Namestitev in zagon
### Kloniranje repozitorija
```bash
git clone https://github.com/markloborec/Spletna-Trgovina.git
cd Spletna-Trgovina
```

### Backend
**Namestitev odvisnosti**
```bash
cd backend
npm install
```

**Konfiguracija**
- Ustvarite datoteko .env v backend mapi z naslednjo vsebino:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
NODE_ENV=development
```

**Zagon strežnika**
```bash
npm run dev
```

### Frontend
   **Namestitev odvisnosti**
```bash
cd sports-store
npm install
```

   **Konfiguracija**
- Uredimo `environment.ts` v `src/environments/`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api'
};
```

   **Zagon aplikacije**
```bash
cd sports-store
ng serve --open
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:4000/api

### 🏗️Arhitektura sistema
### Frontend 
- Angular aplikacija s komponentnim pristopom
- Integriran Google Translate Website Widget
- Services za komunikacijo z API-ji
- Modeli in tovarniški vzorci za podatkovne objekte
### Backend 
- Express API v Node.js
- JWT avtentikacija
- Mongoose modeli:
1. Users
2. Products
3. Categories
4. ProductVariants
### Baza podatkov
- MongoDB (lokalno ali preko Atlas)

### Struktura projekta:

<p style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.2; margin: 0;"> frontend/<br> ├── 📁 .vscode/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Visual Studio Code konfiguracija<br> ├── 📁 public/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Statični javni fajli<br> │&nbsp;&nbsp;&nbsp;├── 📁 flag-icons/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Zastavne ikone<br> │&nbsp;&nbsp;&nbsp;├── 📁 leafset/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Leafset ikone/komponente<br> │&nbsp;&nbsp;&nbsp;├── 📁 product-images/&nbsp;&nbsp;&nbsp;&nbsp;#  Slike izdelkov<br> │&nbsp;&nbsp;&nbsp;├── 📁 store-images/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Slike trgovine<br> │&nbsp;&nbsp;&nbsp;├── 📄 BicklStoreLogo.ico&nbsp;&nbsp;#  Favicon ICO<br> │&nbsp;&nbsp;&nbsp;├── 📄 BicklStoreLogo.png&nbsp;&nbsp;#  Glavni logo<br> │&nbsp;&nbsp;&nbsp;└── 📄 favicon.ico&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Favicon<br> ├── 📁 src/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Izvorna koda aplikacije<br> │&nbsp;&nbsp;&nbsp;├── 📁 app/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Angular moduli in komponente<br> │&nbsp;&nbsp;&nbsp;├── 📄 index.html&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Glavni HTML dokument<br> │&nbsp;&nbsp;&nbsp;├── 📄 main.ts&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Vstopna točka aplikacije<br> │&nbsp;&nbsp;&nbsp;└── 📄 styles.scss&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Globalni stili (SCSS)<br> ├── 📄 .editorconfig&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Stil kodiranja<br> ├── 📄 .gitignore&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Ignorirani fajli za Git<br> ├── 📄 README.md&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Dokumentacija projekta<br> ├── 📄 angular.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Angular CLI konfiguracija<br> ├── 📄 package-lock.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Točne verzije npm paketov<br> ├── 📄 package.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  NPM paketi in skripte<br> ├── 📄 proxy.config.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Proxy konfiguracija za razvoj<br> ├── 📄 tsconfig.app.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  TypeScript konfiguracija za aplikacijo<br> ├── 📄 tsconfig.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  Glavna TypeScript konfiguracija<br> └── 📄 tsconfig.spec.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;#  TypeScript konfiguracija za teste </p>

### /backend

<p style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.2; margin: 0;"> Spletna-Trgovina/<br> ├── 📁 dist/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Prevajana/zbrana aplikacija<br> ├── 📁 config/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Konfiguracijske datoteke<br> ├── 📁 controllers/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Kontrolerji za zahteve<br> ├── 📁 middleware/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Vmesna programska oprema<br> ├── 📁 migrations/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Migracije podatkovne baze<br> ├── 📁 models/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Modeli podatkov<br> ├── 📁 routes/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Definicije poti (API endpointi)<br> ├── 📁 services/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Poslovna logika in storitve<br> ├── 📁 utils/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Pomožne funkcije in orodja<br> ├── 📁 node_modules/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Namestljeni npm paketi<br> ├── 📁 src/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Izvorna koda aplikacije<br> ├── 📄 app.js&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Glavna Express aplikacija<br> ├── 📄 seed.js&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Skripta za inicializacijo baze<br> ├── 📄 server.js&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Začetna točka strežnika<br> ├── 📄 .env&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Okoljske spremenljivke<br> ├── 📄 .gitignore&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Ignorirani fajli za Git<br> ├── 📄 README.md&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Dokumentacija projekta<br> ├── 📄 package-lock.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Točne verzije npm paketov<br> ├── 📄 package.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# NPM paketi in skripte<br> └── 📄 tsconfig.json&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# TypeScript konfiguracija </p>


## Testiranje
Aplikacija je bila testirana na zalednem in čelnem delu. Tekom testiranja so bile odkrite manjše nepravilnosti, ki so bile kasneje odpravljene s strani razvijalcev.


### Dodatne funkcije:
👓 Spletna stran je prilagodljiva za slepe in slabovidne uporabnike.

### 🔧Razvijalci
- **Matevž Koren** - Full Stack razvoj
- **Mark Loborec** - Dokumentacija, frontend razvoj
- **Naja Miličič** - Backend razvoj
### ℹ️Kontakt in informacije:
- **Discord**
- **E-mail**: bickilstore@gmail.com
- **Telefonska številka**: +386 041 223 531
  
### Licenca:
Projekt je licenciran pod MIT licenco.

### ❓UVOD ZA UPORABNIKA S SLIKAMI:

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev strani Kolesa</h3> |
| ![Kolesa](./img/Kolesa.GIF) |
| **KOLESA:** Zgoraj je stran za nakup kolesa. Opremljena je z veliko filtri za boljšo uporabniško izkušnjo in vsemi podrobnostmi glede tipa kolesa. |
| **Filtri:** |
| - **Velikost obročev**: Omogoča filitrianje po velikosti obroča kolesa. Izbira velikosti obroča je odvisna od velikosti posamenzika in hkrati zaradi udobja v vožnji (Absorbiranje vibracij med vožnjo, oprijem gume...) |
| - **Okvir**: Omogoča filitrianje po velikosti okvirja kolesa in materiala kolesa (Aluminij, karbon). To je pomembna zaradi velikosti uporabnika, saj je lahko večji okrir bolj udoben/primeren za kupca večje velikosti, hkrati pa lažji okvir iz karbona omogoča bolj udobno izkušnjo. |
| - **Min. Prestav**: Omogoča filitirnaje po številu prestav. Uporabnik lahko tako najde primerno kolo glede na želje razmerja prestav. |
| - **Razpoložljivost**: Omogoča filtiranje v trenutno razpoložljiva kolesa na lokacijah BicklStore. Če kolo ni razpoložljivo lahko uporabnik klikne na gumb obvesti me. |
| - **Sortiraj**: Omogoča vpogled spletne strani po Imenu, ceni... |
| - **Naraščajoče/Padajoče**: Omogoča pregled spletne strani kot Naraščajoče ( npr. najcenjši izdelki so vidni najprej) in Padajoče (npr. najdražji izdelki so vidni najprej). |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev strani Kontakt</h3> |
| ![Kontakt](./img/Kontakt.GIF) |
| **KONTAKT:** Zgoraj je izgled strani za kontakt. Trenutno ima stran osnovne kontakne podatke o podjetju in Google maps mapo, ki kaže vse poslovalnice Biciklstore. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev strani Oblačila</h3> |
| ![Oblačila](./img/Oblačila.GIF) |
| **OBLAČILA:** Tako kot kolesa imajo tudi oblačila svoje filtre in podrobnosti, ki izboljšajo uporabniško izkušnjo in omogočijo lažji in hitrejši nakup. |
| **Filtri:** |
| - **Velikost**: Omogoča filitrianje po velikosti oblačila ((XS, S, M, L, XL, XXL). |
| - **Material**: Omogoča filtriranje po materialu oblačila (poliester, bombaž...) |
| - **Spol**: Omogoča filtriranje oblačila glede na spol uporabinka (Moška, Ženska in Unisex oblačila). |
| - **Barva**: Omogoča filtirnaje po barvi izdelka. Stranka lahko izbere oblačilo svoje barve. |
| - **Razpoložljivost**: Omogoča filtiranje v trenutno razpoložljiva oblačila na lokacijah BicklStore. Če oblačilo ni razpoložljivo lahko uporabnik klikne na gumb obvesti me. |
| - **Sortiraj**: Omogoča vpogled spletne strani po Imenu, ceni... |
| - **Naraščajoče/Padajoče**: Omogoča pregled spletne strani kot Naraščajoče ( npr. najcenjši izdelki so vidni najprej) in Padajoče (npr. najdražji izdelki so vidni najprej). |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev strani Oprema</h3> |
| ![Oprema](./img/Oprema.GIF) |
| **OPREMA:**  Ker naša stran omogoča nakup vseh predmetov povezanih s kolesarjenjem smo naredili še stran za opremo. Opremo je prav tako mogoče filtirati glede na želje kupca. |
| **Filtri:** |
| - **Brand**: Omogoča filtriranje po zaželeni znamki. |
| - **Material**: Omogoča filtriranje po materialu izdelka (plastika, aluminij, karbon,...) Vpliva na težo, trpežnost in zmogljivost opreme. |
| - **Združljivost**: Omogoča filtirranje po združljivosti opreme. |
| - **Razpoložljivost**: Omogoča filtiranje v trenutno razpoložljivo opremo na lokacijah BicklStore. Če oprema ni razpoložljiva lahko uporabnik klikne na gumb obvesti me. |
| - **Sortiraj**: Omogoča vpogled spletne strani po Imenu, ceni... |
| - **Naraščajoče/Padajoče**: Omogoča pregled spletne strani kot Naraščajoče ( npr. najcenjši izdelki so vidni najprej) in Padajoče (npr. najdražji izdelki so vidni najprej). |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Registracija</h3> |
| <div align="center"><img src="./img/Registracija.GIF" alt="Registracija" style="max-width: 100%; width: auto; height: auto;"></div> |
| **REGISTRACIJA:** Preden lahko stranka kupuje preko spleta se mora registrirati. Zaradi varnosti je to nujno. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Prijava</h3> |
| <div align="center"><img src="./img/Prijava.GIF" alt="Prijava" style="max-width: 100%; width: auto; height: auto;"></div> |
| **PRIJAVA:** Za nakup je potrebna prijava zaradi varnostnih razlogov. Uporabnik mora vnesti svoj spletni naslov ter svoje izbrano geslo. Če je geslo pozabil je možnost nastavitve novega gesla z klikom na gumb "Pozabljeno geslo". |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Košarica</h3> |
| <div align="center">![Kosarica1](./img/kosarica1.png)</div> |
| **KOŠARICA:** Košarica omogoča pregled izdelkov, ki jih stranka hoče kupiti ter njihovo skupno ceno. Izdelek se doda v košarico, ko stranka klikne na gumb "Dodaj v košarico" za določeni izdelek. Ikona košarice se prav tako posodobi glede na število izdelkov v njej. Ko je stranka prepričana, da je nakupila vse mora klikniti gumb "Odpri košarico" za zaključek nakupa. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Zaključek nakupa</h3> |
| <div align="center">![Kosarica2](./img/kosarica2.png)</div> |
| **ZAKLJUČEK:** Ko je stranka pripravljena kupiti izdelek je kliknila gumb odpri košarico. Ta gumb bo stranko napotil do strani za plačilo, kjer se vidi število in ceno izdelkov, ki jih želijo kupiti. Stranka bo imela možnost plačila glede na opcije, ki jih ponuja spletna stran. Če stranka noče kupiti izdelka lahko posamezno klikne na gumb "X" ali pa lahko zavrže vse izdelke z klikom na gumb "Izprazni Košarico". |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Profil</h3> |
| <div align="center">![profil](./img/profil.png)</div> |
| **PROFIL:** Stranka lahko dostopa do svojega profila in spreminja svoje informacije. Lahko je pomembno zaradi dostave (npr. drugačna lokacija ali telefonska številka)... |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Informacije izdelka</h3> |
| <div align="center">![informacijeizdelka](./img/informacijeizdelka.png)</div> |
| **INFORMACIJE IZDELKA:** S tem stranka dostopa do dodatnih informacij glede izdelka. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Plačilo</h3> |
| <div align="center">![Kosaricazakljucek](./img/Kosaricazakljucek.png)</div> |
| **PLAČILO:** Ko stranka zaključi z nakupom je potrebno plačilo. Tukaj se lahko odloči za vse opcije, ki so podane kot možnost plačila. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Pretekla naročila</h3> |
| <div align="center">![Preteklanaročila](./img/Preteklanarocila.png)</div> |
| **PRETEKLA NAROČILA:** Tukaj lahko stranka pregleda vsa svoja naročila preko Bicklstore. Stranka ima zabeležen datum in čas nakupa, ceno izdelka, število izdelkov ter Št. naročila. |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Oddaja mnenja</h3> |
| <div align="center">![Ocena](./img/ocena.png)</div> |
| **ODDAJA MNENJA:** V oknu pretekla naročila lahko stranka odda še svoje mnenje o izdelku. Prav tako lahko oceni kvaliteto izdelka z klikom na zvezdice (1-5). |
| |

| |
|:-:|
| <h3 style="text-align: center; margin: 10px 0;">📌 Razložitev Podrobnosti izdelka</h3> |
| <div align="center">![Podrobnosti](./img/podrobnosti.png)</div> |
| **PODROBNOSTI:** V temu zavihku so vidne podrobnosti (opis, uradna stran, znamka, material, teža, kompatibilnost) izdelka in zbrana mnenja posameznikov. Torej tukaj lahko stranka prebere mnenja drugih strank o posameznem izdelku. |
| |
