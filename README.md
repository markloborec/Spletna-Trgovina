# Športna Trgovina – Kolesarska Oprema

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Spletna trgovina s kolesarsko opremo, razvita po SCRUM metodi in razdeljena v cikle (sprinte). Projekt vključuje razvoj frontenda, backenda in integracije z bazo podatkov.

## Trenutne funkcionalnosti (stanje do 3. cikla)
### Backend (Node.js + Express + MongoDB)
Implementirane funkcionalnosti:
- Registracija in prijava uporabnika (JWT avtentikacija)
- Vračanje uporabniških podatkov (/api/auth/me)
- Pridobivanje seznama izdelkov
- Pridobivanje podrobnosti izdelka
- Pridobivanje kategorij izdelkov
- Seed podatki za izdelke, kategorije in variante (variant backend še ne vrača)
- Povezava na MongoDB + osnovna struktura modelov

### Frontend (Angular)
Implementirane funkcionalnosti:
#### Uporabniški vmesnik
- Zaključen osnovni vizualni koncept aplikacije
- Končan homepage
- Delitev aplikacije na ključne komponente (komponentna arhitektura)

#### Navigacija in jeziki
- Globalna izbira jezika + jezikovna menjava v headerju
- Delujoč routing med stranmi

#### Prikaz izdelkov
- Prikaz vseh koles
- Prikaz vseh oblačil
- Prikaz celotne opreme
- 3 različna filtriranja opreme
- Model + Factory pattern za produkt
- Osnovna struktura strani za kategorije izdelkov

#### Lokacije in kontakt
- Interaktivni zemljevid poslovalnic
- Stran "Kontakt" + kontaktni obrazec
- Vse osnovne kontaktne povezave

#### Uporabniki
- Registracija in prijava uporabnika
- Frontend pop-upi (modal) za prijavo/registracijo
- Funkcionalnost “pozabljeno geslo” (frontend obrazec)
- UserService za upravljanje uporabniških podatkov
- Prikaz profila uporabnika (UI)

## Namestitev in zagon

### 1. Kloniranje repozitorija
```bash
git clone https://github.com/yourusername/sportna-trgovina.git
cd sportna-trgovina
```

### 2. Backend
   Namestitev odvisnosti: 
```bash
cd backend
npm install
```

    Konfiguracija
Ustvarimo `.env` datoteko v backend mapi:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
```

    Zagon strežnika
```npm run dev```

### 3. Frontend
    Namestitev odvisnosti
```bash
cd frontend
npm install
```

    Konfiguracija
Uredimo `environment.ts` v `src/environments/`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

    Zagon aplikacije
cd frontend
ng serve --open
```

```
Frontend: http://localhost:4200
Backend API: http://localhost:4000/api

## Arhitektura sistema

### Frontend 
- Angular aplikacija s komponentnim pristopom
- Podpora za i18n
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


## 🧪 Testiranje

Trenutno je vzpostavljeno ročno testiranje API endpointov (Postman) in osnovno preverjanje delovanja frontenda.
Avtomatizirani testi bodo dodani v naslednjih ciklih projekta.

## Reševanje težav

### Pogoste težave

1. **Težave z MongoDB**
- preveri povezavo v .env
- preveri, ali teče MongoDB strežnik

2. **Porti 4000 ali 4200 je zaseden**
   ```bash
   # Poglejte, kateri procesi uporabljajo porte
   sudo lsof -i :3000
   sudo lsof -i :4200
   ```

3. **Manjkajoče odvisnosti**
   ```bash
   # Ponovno namestite odvisnosti
   rm -rf node_modules package-lock.json
   npm install
   ```

### Razvijalci
- **Matevž Koren** - Full Stack razvoj
- **Mark Loborec** - Dokumentacija
- **Naja Miličič** - Backend razvoj


## 📄 Licenca

Ta projekt je licenciran pod MIT licenco - glej [LICENSE](LICENSE) datoteko za podrobnosti.


⭐ Če vam je ta projekt všeč, prosimo dajte zvezdico na GitHubu!
