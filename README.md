# AFFINI — App

## Come avviare il progetto sul tuo computer

1. Installa [Node.js](https://nodejs.org) se non lo hai già (versione 18 o superiore)
2. Apri il Terminale, naviga nella cartella del progetto:
   ```
   cd affini-app
   ```
3. Installa le dipendenze:
   ```
   npm install
   ```
4. Avvia il progetto in locale per vederlo nel browser:
   ```
   npm run dev
   ```
5. Apri il link che appare nel terminale (di solito `http://localhost:5173`)

## File principali

- `src/App.jsx` — tutto il codice dell'app
- `src/supabaseClient.js` — connessione al database Supabase
- `src/main.jsx` — punto di ingresso dell'app

## Deploy online

Per pubblicare l'app online, vedi le istruzioni per Vercel nel prossimo step.
