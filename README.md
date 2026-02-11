
## Kudos

Monorepo (Nx) s frontendem a backendem.

## Požadavky

- Node.js + npm

## Instalace

```bash
npm install
```

## Spuštění aplikace (lokálně)

Pro běh aplikace stačí spustit **frontend** a **backend** ve dvou samostatných terminálech:

```bash
# terminál 1
npm run frontend
```

```bash
# terminál 2
npm run backend
```

Poznámky k DB:

- **SQL databáze**: používá se lokální SQL databáze (SQLite).
- **Produkční/DEV databáze**: vytvoří se v **rootu repozitáře**.
- **Backend testy**: `npm run backend:test` si vytváří **oddělenou** databázi.
- **Migrace**: `npm run backend` automaticky spustí **počáteční migraci DB**.

## Testy

```bash
# e2e testy (Playwright)
npm run e2e
```

```bash
# backend testy
npm run backend:test
```

## Užitečné příkazy

```bash
npm run typecheck
npm run lint
npm run build
```
