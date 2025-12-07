# Športna Trgovina – Kolesarska Oprema

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Spletna aplikacija za trgovino s kolesarsko opremo, ki ponuja celovito izkušnjo spletnega nakupovanja za kolesarske navdušence.

## 🌟 Funkcionalnosti

### 🛒 Osnovne funkcionalnosti
- **Upravljanje uporabnikov**: Registracija, prijava, upravljanje profila
- **Nakupovalna košarica**: Dodajanje/odstranjevanje izdelkov, spremljanje stanja

### 🔍 Napredno iskanje in filtriranje
- **Inteligentno iskanje**: Hitro iskanje po celotni ponudbi izdelkov
- **Filtriraj po**:
  - Kategoriji (kolesa, oblačila, dodatki, orodja)
  - Znamki
  - Ceni
  - Velikosti
  - Barvi
  - Oceni uporabnikov

### 📱 Uporabniški vmesnik
- Odzivna zasnova za vse naprave
- Intuitivna navigacija
- Vizualne galerije izdelkov
- Podrobni opisi izdelkov s slikami

### 🏢 Informacije o podjetju
- Kontaktni obrazec
- Lokacija in urnik
- Informacije o podjetju
- FAQ sekcija

## 🚀 Namestitev in zagon

### Predpogoji
- Node.js (v16 ali novejši)
- Angular CLI
- MongoDB (lokalen ali Atlas)
- npm ali yarn

### 1. Kloniranje repozitorija
```bash
git clone https://github.com/yourusername/sportna-trgovina.git
cd sportna-trgovina
```

### 2. Namestitev odvisnosti

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Konfiguracija

#### Backend konfiguracija
Ustvarite `.env` datoteko v backend mapi:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
```

#### Frontend konfiguracija
Uredite `environment.ts` v `src/environments/`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 4. Zagon aplikacije

#### Opcija A: Ločen zagon
```bash
# Terminal 1: Zagon backend strežnika
cd backend
node server.js
# ali za razvoj: npm run dev

# Terminal 2: Zagon frontend aplikacije
cd frontend
ng serve --open
```

#### Opcija B: Z uporabo skript (če so definirane)
```bash
# Namestitev in zagon celotne aplikacije
npm run install-all
npm start
```

### 5. Dostop do aplikacije
- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend API: [http://localhost:3000](http://localhost:3000)
- MongoDB: Localhost:27017 (ali vaš Atlas cluster)

## 🏗️ Arhitektura

### Frontend (Angular)

### Backend (Node.js + Express)

### Baza podatkov (MongoDB)
- **Uporabniki**: User collection
- **Izdelki**: Products collection
- **Naročila**: Orders collection
- **Kategorije**: Categories collection

## 🧪 Testiranje

```bash
# Frontend testi
cd frontend
npm test

# Backend testi
cd backend
npm test

# E2E testi
npm run e2e
```

## 🐛 Reševanje težav

### Pogoste težave

1. **MongoDB povezava**
   ```bash
   # Preverite, ali je MongoDB zagnan
   mongod --version
   # Preverite povezavo v .env datoteki
   ```

2. **Porti so zasedeni**
   ```bash
   # Poglejte, kateri procesi uporabljajo porte
   sudo lsof -i :3000
   sudo lsof -i :4200
   ```

3. **Odvisnosti manjkajo**
   ```bash
   # Ponovno namestite odvisnosti
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📦 Deployment

### Produkcijski build
```bash
# Frontend build
cd frontend
ng build --prod

# Backend deployment
cd backend
npm install --production
NODE_ENV=production node server.js
```

## 👥 Credits

### Razvijalci
- **Matevž Koren** - Full Stack Developer
- **Mark Loborec** - Dokumntiranje
- **Naja Miličič** - Backend development


## 📄 Licenca

Ta projekt je licenciran pod MIT licenco - glej [LICENSE](LICENSE) datoteko za podrobnosti.

## 🤝 Podpora

Za vprašanja in podporo obiščite:
- **Email**: support@sportnatrgovina.si
- **Website**: [www.sportnatrgovina.si](https://www.sportnatrgovina.si)
- **Telefon**: +386 1 234 5678

---

⭐ Če vam je ta projekt všeč, prosimo dajte zvezdico na GitHubu!