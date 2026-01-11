# Športna Trgovina s kolesarsko opremo Bicklstore

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Spletna trgovina s kolesarsko opremo, razvita kot akademski projekt. Omogoča prikaz izdelkov, filtriranje, ogled kategorij, registracijo in prijavo uporabnika, večjezičnost ter osnovne podporne funkcije, potrebne za delovanje spletne trgovine. Projekt predstavlja temelje modernega spletnega trgovinskega sistema z ločenim frontendom in backendom.


# Kazalo

- [Športna Trgovina s kolesarsko opremo Bicklstore](#športna-trgovina-s-kolesarsko-opremo-bicklstore)
  - [Funkcionalnosti:](#funkcionalnosti)
    - [Uporabniki](#uporabniki)
    - [Izdelki in kategorije](#izdelki-in-kategorije)
    - [Mnenja in ocene](#mnenja-in-ocene)
    - [Navigacija in jezik](#navigacija-in-jezik)
    - [Informacije in poslovalnice](#informacije-in-poslovalnice)
    - [🛒Košarica](#košarica)
    - [🛒Naročila (Orders/Checkout)](#naročila-orderscheckout)
  - [💻Uporabljene tehnologije](#uporabljene-tehnologije)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Namestitev in zagon](#namestitev-in-zagon)
    - [Kloniranje repozitorija](#kloniranje-repozitorija)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [🏗️Arhitektura sistema](#arhitektura-sistema)
    - [Frontend](#frontend-2)
    - [Backend](#backend-2)
    - [Baza podatkov](#baza-podatkov)
    - [Struktura projekta:](#struktura-projekta)
  - [Testiranje](#testiranje)
  - [Dodatne funkcije:](#dodatne-funkcije)
  - [🔧Razvijalci](#razvijalci)
  - [ℹ️Kontakt in informacije:](#kontakt-in-informacije)
  - [Licenca:](#licenca)
  - [❓UVOD ZA UPORABNIKA S SLIKAMI:](#uvod-za-uporabnika-s-slikami)

## Funkcionalnosti:
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

# Vizualni vodnik po Bicklstore

<div align="center">
  <h2>Interaktivni uvodnik za uporabnike</h2>
  <p>Spodaj najdete podrobne razlage vseh funkcionalnosti s posnetki zaslona in GIF-animacijami</p>
  <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
    <span style="background: #007bff; color: white; padding: 5px 15px; border-radius: 20px;">Nakupovanje</span>
    <span style="background: #28a745; color: white; padding: 5px 15px; border-radius: 20px;">Račun</span>
    <span style="background: #17a2b8; color: white; padding: 5px 15px; border-radius: 20px;">Oprema</span>
    <span style="background: #6f42c1; color: white; padding: 5px 15px; border-radius: 20px;">Podpora</span>
  </div>
</div>

---

## RAZLOŽITEV STRANI KOLESA

<div align="center">
  <h3>Nakup koles z naprednimi filtri</h3>
  <img src="./img/Kolesa.GIF" alt="Kolesa stran" width="800" style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</div>

### Opis funkcionalnosti:
Stran za nakup koles je opremljena s **6 vrstami filtrov**, ki omogočajo natančno iskanje glede na vaše potrebe.

### Dostopni filtri:

<table>
<tr>
<td width="50%">

#### Tehnični filtri:
- **Velikost obročev** (16", 26", 27.5", 29")
- **Material okvirja** (Aluminij, Karbon)
- **Minimalno število prestav** (1-12)

</td>
<td width="50%">

#### Praktični filtri:
- **Razpoložljivost** (Trenutno na zalogi)
- **Sortiranje** (Po imenu, ceni, popularnosti)
- **Vrstni red** (Naraščajoče/Padajoče)

</td>
</tr>
</table>

### Zakaj so filtri pomembni?
- **Velikost obroča**: Vpliva na udobje in absorpcijo vibracij
- **Material okvirja**: Karbon = lažji, aluminij = trpežnejši
- **Prestave**: Več prestav = večja prilagodljivost terenu

---

## RAZLOŽITEV STRANI KONTAKT

<div align="center">
  <h3>Povezava s podjetjem in poslovalnicami</h3>
  <img src="./img/Kontakt.GIF" alt="Kontakt stran" width="800" style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</div>

### Dostopne informacije:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">

<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">

#### Podatki o podjetju:
- **E-mail:** bickilstore@gmail.com
- **Telefon:** +386 041 223 531
- **Delovni čas:** Po dogovoru
- **Naslov:** Različne lokacije po Sloveniji

</div>

<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">

#### Google Maps integracija:
- Interaktivni zemljevid
- Vse poslovalnice Bicklstore
- Iskanje po lokaciji
- Mobilno prijazen vmesnik

</div>

</div>

---

## RAZLOŽITEV STRANI OBLAČILA

<div align="center">
  <h3>Modna kolesarska oblačila</h3>
  <img src="./img/Oblačila.GIF" alt="Oblačila stran" width="800" style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</div>

### Specializirani filtri za oblačila:

<table>
<thead>
<tr>
<th>Filter</th>
<th>Možnosti</th>
<th>Namembnost</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Velikost</strong></td>
<td>XS, S, M, L, XL, XXL</td>
<td>Ujemanje s telesno postavo</td>
</tr>
<tr>
<td><strong>Material</strong></td>
<td>Poliester, Bombaž, Mesh</td>
<td>Dišavnost in udobje</td>
</tr>
<tr>
<td><strong>Spol</strong></td>
<td>Moška, Ženska, Unisex</td>
<td>Kroj in dizajn</td>
</tr>
<tr>
<td><strong>Barva</strong></td>
<td>Vse barvne možnosti</td>
<td>Osebni slog</td>
</tr>
</tbody>
</table>

### Posebne funkcije:
- Multimedijski prikaz (več kot 1 slika na izdelek)
- Ocene in mnenja uporabnikov
- Obvesti me za naročilo izdelkov

---

## RAZLOŽITEV STRANI OPREMA

<div align="center">
  <h3>Kompletna kolesarska oprema</h3>
  <img src="./img/Oprema.GIF" alt="Oprema stran" width="800" style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</div>

### Filtri za profesionalno opremo:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">

<div style="border-left: 4px solid #007bff; padding-left: 15px;">
<h4>Brand filter</h4>
<p>Iskanje po priljubljenih znamkah: Shimano, Giro, Specialized, itd.</p>
</div>

<div style="border-left: 4px solid #28a745; padding-left: 15px;">
<h4>Material filter</h4>
<p>Plastika, aluminij, karbon, jeklo - vsak za druge namene</p>
</div>

<div style="border-left: 4px solid #17a2b8; padding-left: 15px;">
<h4>Združljivost</h4>
<p>Filtrirajte po kompatibilnosti z vašim kolesom</p>
</div>

</div>

---

## UPORABNIŠKI RAČUN

### Registracija
<div align="center">
  <img src="./img/Registracija.GIF" alt="Registracija" width="600" style="border-radius: 10px; margin: 10px 0;">
</div>

**Zahteve za registracijo:**
- Veljaven e-poštni naslov
- Geslo (min. 8 znakov)
- Potrditev gesla
- Sprejem pogojev uporabe

### Prijava
<div align="center">
  <img src="./img/Prijava.GIF" alt="Prijava" width="600" style="border-radius: 10px; margin: 10px 0;">
</div>

**Funkcionalnosti prijave:**
- Varna prijava s hashiranimi gesli
- Pozabljeno geslo - povezava za ponastavitev
- Obvestila o napačni prijavi
- Samodejna preusmeritev po prijavi

---

## KOŠARICA IN NAKUP

### Košarica
<div align="center">
  <img src="./img/kosarica1.png" alt="Košarica" width="700" style="border-radius: 10px; margin: 10px 0;">
</div>

**Funkcionalnosti košarice:**

<table>
<tr>
<td width="50%">

#### Osnovne funkcije:
- Spreminjanje količine
- Odstranjevanje posameznih izdelkov
- Izprazni celotno košarico
- Samodejno shranjevanje sprememb

</td>
<td width="50%">

#### Izračuni:
- Vmesna vsota
- DDV (22%)
- Stroški dostave
- Skupna cena

</td>
</tr>
</table>

### Zaključek nakupa
<div align="center">
  <img src="./img/kosarica2.png" alt="Zaključek nakupa" width="700" style="border-radius: 10px; margin: 10px 0;">
</div>

**Postopek zaključka:**

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
<h4 style="color: white; text-align: center;">3-h korakov do uspešnega nakupa</h4>

1. **Pregled košarice** - preverite izdelke in količine
2. **Izberite način plačila** - kartica, Paypal, predračun
3. **Potrdite naročilo** - prejmete potrdilo po e-pošti
</div>

---

## PROFIL IN NAROČILA

### Uporabniški profil
<div align="center">
  <img src="./img/profil.png" alt="Profil" width="600" style="border-radius: 10px; margin: 10px 0;">
</div>

**Nastavitve profila:**
- Osebni podatki (ime, priimek)
- Kontaktni podatki (e-pošta, telefon)
- Naslov za dostavo
- Sprememba gesla

### Pretekla naročila
<div align="center">
  <img src="./img/Preteklanarocila.png" alt="Pretekla naročila" width="700" style="border-radius: 10px; margin: 10px 0;">
</div>

**Informacije o naročilih:**

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">

<div style="text-align: center; padding: 15px; background: #e8f4fd; border-radius: 8px;">
<strong>Datum in čas</strong>
<p>Natančno časovno označbo nakupa</p>
</div>

<div style="text-align: center; padding: 15px; background: #e8f4fd; border-radius: 8px;">
<strong>Cena izdelka</strong>
<p>Cena ob času nakupa z DDV</p>
</div>

<div style="text-align: center; padding: 15px; background: #e8f4fd; border-radius: 8px;">
<strong>Št. naročila</strong>
<p>Unikatna številka za sledenje</p>
</div>

<div style="text-align: center; padding: 15px; background: #e8f4fd; border-radius: 8px;">
<strong>Status dostave</strong>
<p>Informacije o pošiljki</p>
</div>

</div>

---

## MNENJA IN OCENE

### Oddaja mnenja
<div align="center">
  <img src="./img/ocena.png" alt="Oddaja mnenja" width="600" style="border-radius: 10px; margin: 10px 0;">
</div>

**Postopek ocenjevanja:**

1. Izberite naročilo iz preteklih naročil
2. Kliknite "Oceni izdelek"
3. Izberite oceno (1-5 zvezdic)
4. Dodajte komentar (neobvezno)
5. Pošljite mnenje

### Podrobnosti izdelka z mnenji
<div align="center">
  <img src="./img/podrobnosti.png" alt="Podrobnosti izdelka" width="700" style="border-radius: 10px; margin: 10px 0;">
</div>

**Informacije na strani izdelka:**

<table>
<thead>
<tr>
<th>Zavihek</th>
<th>Vsebina</th>
<th>Koristnost</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Opis</strong></td>
<td>Podrobne specifikacije</td>
<td>Tehnične informacije</td>
</tr>
<tr>
<td><strong>Specifikacije</strong></td>
<td>Material, teža, kompatibilnost</td>
<td>Primerjalne podatke</td>
</tr>
<tr>
<td><strong>Mnenja</strong></td>
<td>Ocene drugih kupcev</td>
<td>Priporočila</td>
</tr>
<tr>
<td><strong>Povezave</strong></td>
<td>Uradna stran, navodila</td>
<td>Dodatni viri</td>
</tr>
</tbody>
</table>

---

<div align="center" style="margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 15px;">
  <h3 style="color: #2c3e50;">Začnite z nakupovanjem še danes!</h3>
  <p style="font-size: 1.1em; margin: 15px 0;">Bicklstore ponuja vse, kar potrebujete za popoln kolesarski doživljaj</p>
  
  <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
    <a href="#" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
      Oglejte si kolesa
    </a>
    <a href="#" style="display: inline-block; background: #3498db; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
      Raziščite oblačila
    </a>
    <a href="#" style="display: inline-block; background: #2ecc71; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
      Poglejte opremo
    </a>
  </div>
  
  <p style="margin-top: 25px; color: #7f8c8d; font-size: 0.9em;">
    Potrebujete pomoč? Obrnite se na <a href="mailto:bickilstore@gmail.com" style="color: #3498db; text-decoration: none;">našo podporo</a>
  </p>
</div>
# Pogosta vprašanja (FAQ)

**Opomba:** Odgovori na naslednja vprašanja so tudi vizualno prikazani v [Uvodniku za uporabnika s slikami](#-uvod-za-uporabnika-s-slikami), kjer lahko poleg navodil vidite tudi posnetke zaslonov in konkretne primere uporabe.

## 1. Kako se registriram in prijavim v aplikacijo?
Za registracijo kliknite na ikono profila v zgornjem desnem kotu in izberite "Registracija". Vnesite svoj e-poštni naslov, geslo in druge zahtevane podatke. Po uspešni registraciji se lahko prijavite z istimi podatki. Če ste pozabili geslo, uporabite funkcijo "Pozabljeno geslo".

*(Vizualni prikaz: Glejte razdelek "RAZLOŽITEV REGISTRACIJA" in "RAZLOŽITEV PRIJAVA" v Uvodniku za uporabnika)*

## 2. Kako deluje filtriranje izdelkov?
Vsaka kategorija (kolesa, oblačila, oprema) ima svoje specifične filtre. Filtre lahko najdete na levi strani vsake kategorije. Za kolesa lahko filtriate po velikosti obroča, materialu okvirja in številu prestav. Za oblačila po velikosti, materialu, spolu in barvi. Za opremo po znamki, materialu in združljivosti.

*(Vizualni prikaz: Glejte razdelke "RAZLOŽITEV STRANI KOLESA", "RAZLOŽITEV STRANI OBLAČILA" in "RAZLOŽITEV STRANI OPREMA" v Uvodniku za uporabnika)*

## 3. Kaj pomeni status "Razpoložljivost" pri izdelkih?
Status "Razpoložljivost" označuje, ali je izdelek trenutno na zalogi v kateri koli od naših poslovalnic. Če izdelek ni razpoložljiv, lahko kliknete na gumb "Obvesti me", da vas obvestimo, ko bo izdelek ponovno na voljo.

*(Vizualni prikaz: Gumb "Obvesti me" je prikazan v filtru "Razpoložljivost" v vseh kategorijah v Uvodniku)*

## 4. Kako dodam izdelek v košarico?
Na strani izdelka izberite želeno varianto (npr. velikost, barva) in količino, nato kliknite gumb "Dodaj v košarico". Ikona košarice v zgornjem desnem kotu se bo posodobila s številom izdelkov.

*(Vizualni prikaz: Glejte razdelek "RAZLOŽITEV KOŠARICA" v Uvodniku za uporabnika)*

## 5. Kaj vse vsebuje izračun cene v košarici?
Košarica prikazuje vmesno vsoto, DDV (22%), stroške dostave in skupno ceno. Cene se samodejno posodabljajo, ko spreminjate količine ali odstranjujete izdelke.

*(Vizualni prikaz: Glejte sliko košarice v razdelku "RAZLOŽITEV KOŠARICA" in "RAZLOŽITEV ZAKLJUČEK NAKUPA" v Uvodniku)*

## 6. Kako poteka postopek nakupa?
1. Dodajte izdelke v košarico
2. Kliknite ikono košarice in nato "Odpri košarico"
3. Preverite naročilo in kliknite "Nadaljuj na plačilo"
4. Izberite način plačila in dostave
5. Potrdite naročilo
6. Po uspešnem plačilu se bo košarica samodejno izpraznila in zaloga posodobila

*(Vizualni prikaz: Celoten postopek je prikazan v razdelkih "RAZLOŽITEV KOŠARICA", "RAZLOŽITEV ZAKLJUČEK NAKUPA" in "RAZLOŽITEV PLAČILO" v Uvodniku)*

## 7. Kako lahko spremenim svoje podatke?
Prijavite se v svoj račun in kliknite na ikono profila ter izberite "Moj profil". Tukaj lahko posodobite svoje osebne podatke, naslov dostave in kontaktne informacije.

*(Vizualni prikaz: Glejte razdelek "RAZLOŽITEV PROFIL" v Uvodniku za uporabnika)*

## 8. Kako dodam mnenje o izdelku?
Mnenje lahko dodate le za izdelke, ki ste jih že kupili. V zavihku "Pretekla naročila" izberite ustrezno naročilo in kliknite "Oceni izdelek". Tukaj lahko dodate komentar in oceno od 1 do 5 zvezdic.

*(Vizualni prikaz: Glejte razdelek "RAZLOŽITEV ODDAJA MNENJA" v Uvodniku za uporabnika)*

## 9. Kje najdem svoja pretekla naročila?
V svojem profilu izberite "Pretekla naročila". Tukaj lahko vidite zgodovino vseh svojih nakupov, vključno s podrobnostmi o izdelkih, ceni in statusu naročila.

*(Vizualni prikaz: Glejte razdelek "RAZLOŽITEV PRETEKLA NAROČILA" v Uvodniku za uporabnika)*

## 10. Kaj storiti, če imam tehnične težave z aplikacijo?
- Preverite, ali ste na najnovejši različici brskalnika
- Počistite predpomnilnik brskalnika
- Poskusite znova prijaviti v aplikacijo
- Če težave ostajajo, nas kontaktirajte na bickilstore@gmail.com ali pokličite na +386 041 223 531

---

**Več vizualnih navodil in posnetkov zaslona:** Za podrobnejše navodila s konkretnimi primeri obiščite razdelek [❓ UVOD ZA UPORABNIKA S SLIKAMI](#-uvod-za-uporabnika-s-slikami), kjer je vsak korak prikazan z slikami in GIF-posnetki.

Vaš 
