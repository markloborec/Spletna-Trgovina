# Športna Trgovina s kolesarsko opremo Bicklstore

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Spletna trgovina s kolesarsko opremo, razvita kot akademski projekt. Omogoča prikaz izdelkov, filtriranje, ogled kategorij, registracijo in prijavo uporabnika, večjezičnost ter osnovne podporne funkcije, potrebne za delovanje spletne trgovine. Projekt predstavlja temelje modernega spletnega trgovinskega sistema z ločenim frontendom in backendom.

## Trenutne funkcionalnosti (stanje do 3. cikla)
### Uporabniki
- Registracija in prijava uporabnika (JWT)
- Pridobivanje uporabniških podatkov (profil)
- Modalna okna za prijavo/registracijo
- Frontend funkcionalnost za pozabljeno geslo
  
![Bicikl store homepage](./img/Biciklstorehomepage.GIF)

### Izdelki in kategorije
- Prikaz vseh izdelkov (kolesa, oblačila, oprema)
- Prikaz podrobnosti izdelka
- Prikaz kategorij izdelkov
- Trije filtri za opremo
- Model in factory za produkt
- Seed podatki za izdelke, kategorije in variante
(variant backend trenutno še ne vrača)

### Navigacija in jezik
- Routing med stranmi
- Globalna menjava jezika (i18n)
### Informacije in poslovalnice
- Interaktivni zemljevid poslovalnic
- Kontaktna stran in obrazec

## Uporabljene tehnologije 
### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT avtentikacija
### Frontend
- Angular
- Komponentna arhitektura
- Services za komunikacijo z API-ji
- i18n podpora
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

## Arhitektura sistema
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

## Testiranje
Trenutno je vzpostavljeno ročno testiranje API endpointov (Postman) in osnovno preverjanje delovanja frontenda.
Avtomatizirani testi bodo dodani v naslednjih ciklih projekta.

### Razvijalci
- **Matevž Koren** - Full Stack razvoj
- **Mark Loborec** - Dokumentacija, frontend razvoj
- **Naja Miličič** - Backend razvoj

### SLIKE:


![Kolesa](./img/Kolesa.GIF)
**KOLESA:** Zgoraj je stran za nakup kolesa. Opremljena je z veliko filtri za boljšo uporabniško izkušnjo in vsemi podrobnostmi glede tipa kolesa.

![Kontakt](./img/Kontakt.GIF)
**KONTAKT:** Zgoraj je izgled strani za kontakt. Trenutno ima stran osnovne kontakne podatke o podjetju in Google maps mapo, ki kaže vse poslovalnice Biciklstore.

![Oblačila](./img/Oblačila.GIF)
**OBLAČILA:** Tako kot kolesa imajo tudi oblačila svoje filtre in podrobnosti, ki izboljšajo uporabniško izkušnjo in omogočijo lažji in hitrejši nakup.

![Oprema](./img/Oprema.GIF)
**OPREMA:** Ker naša stran omogoča nakup vseh predmetov povezanih s kolesarjenjem smo naredili še stran za opremo. Opremo je prav tako mogoče filtirati glede na želje kupca.


