<div align="center">
  <img src="public/assets/patchy-mascot.png" alt="Patchy, la mascotte di PatchMe" width="220" />

  # PatchMe

  **La tua vita è un gioco. Ogni settimana riceve una patch.**

  [![Status](https://img.shields.io/badge/status-0.2.0%20Alpha-b7ff3c?style=flat-square&labelColor=141414)](https://patchme-fabiozagariadev.vercel.app)
  [![Vercel](https://img.shields.io/badge/live-Vercel-ffffff?style=flat-square&logo=vercel&logoColor=000000)](https://patchme-fabiozagariadev.vercel.app)
  [![Telegram](https://img.shields.io/badge/Telegram-@patchmegame-26A5E4?style=flat-square&logo=telegram&logoColor=ffffff)](https://t.me/patchmegame)

  [Prova PatchMe](https://patchme-fabiozagariadev.vercel.app) · [Aggiornamenti Telegram](https://t.me/patchmegame)
</div>

## Cos'è PatchMe

PatchMe trasforma i cambiamenti della settimana in patch notes personali ispirate agli aggiornamenti dei videogiochi.

Puoi raccontare novità, miglioramenti, problemi risolti, bug ancora aperti e ciò che vuoi aggiungere nella tua prossima versione. Alla fine ottieni una scheda grafica pronta da salvare e condividere.

Il progetto è mobile-first, non richiede registrazione e conserva i dati direttamente nel browser.

## Funzionalità

- tour introduttivo e configurazione iniziale;
- creazione libera oppure guidata tramite cinque domande;
- patch in stato bozza o pubblicata;
- sezioni predefinite, personalizzabili e riordinabili;
- elementi testuali multipli per ogni sezione;
- visibilità separata delle sezioni nelle immagini condivise;
- anteprima ed esportazione della patch come immagine;
- archivio locale con modifica ed eliminazione;
- temi chiaro, scuro e sincronizzato con il dispositivo;
- colori principali personalizzabili;
- condivisione nativa dell'app con fallback copia-link;
- sezione Novità e collegamento al canale Telegram;
- PWA installabile con icone dedicate;
- interfaccia responsive e ottimizzata per smartphone.

## Patchy

Patchy è la mascotte ufficiale di PatchMe: una piccola creatura digitale nata da un aggiornamento.

Il simbolo `+` rappresenta miglioramenti e nuove funzionalità, mentre i pixel dell'antenna reagiscono ai diversi momenti dell'app.

| Classico | Pensieroso | Festeggia | Bug trovato |
| --- | --- | --- | --- |
| ![Patchy classico](public/assets/patchy-mascot.png) | ![Patchy pensieroso](public/assets/patchy-thinking.png) | ![Patchy festeggia](public/assets/patchy-celebrate.png) | ![Patchy buggato](public/assets/patchy-bug.png) |

## Stato del progetto

PatchMe è attualmente in **0.2.0 Alpha**.

Il flusso principale funziona, ma struttura, interfaccia e funzionalità possono ancora cambiare. In questa fase il progetto viene testato con un gruppo ristretto di persone e sviluppato a partire dal loro utilizzo reale.

### Limiti attuali

- i dati sono salvati soltanto nel browser utilizzato;
- cancellando i dati del sito si perdono impostazioni e patch;
- non esistono ancora account o sincronizzazione tra dispositivi;
- i link pubblici alle singole patch non sono ancora disponibili.

## Roadmap

### Prossimi aggiornamenti

- condivisione di immagine e link in un'unica azione;
- pagine pubbliche per le patch;
- scheda personaggio con classe, livello e statistiche;
- achievement e recap periodici;
- nuove pose ed espressioni di Patchy.

### Più avanti

- autenticazione e recupero dell'account;
- database e sincronizzazione tra dispositivi;
- profili, lore personale e personaggi collegati;
- reazioni tematiche e patch di gruppo;
- applicazione Android.

## Privacy

La versione Alpha non invia le patch a un server. Impostazioni e contenuti restano nel `localStorage` del dispositivo, salvo quando l'utente decide volontariamente di esportare o condividere un'immagine.

## Stack tecnico

- React 19 e TypeScript;
- TanStack Start e TanStack Router;
- Vite;
- Tailwind CSS;
- Radix UI;
- Zod;
- `html-to-image`;
- Vercel per il deploy.

## Avvio locale

Requisiti:

- Node.js;
- npm.

```bash
git clone https://github.com/fabiozagaria/patchme-fabiozagariadev.git
cd patchme-fabiozagariadev
npm install
npm run dev
```

Comandi disponibili:

```bash
npm run dev      # server di sviluppo
npm run build    # build di produzione
npm run preview  # anteprima della build
npm run lint     # controllo del codice
npm run format   # formattazione
```

## Struttura principale

```text
src/
├── components/   Componenti dell'interfaccia e Patchy
├── config/       Configurazione centrale dell'app
├── lib/          Modelli, validazione, persistenza ed esportazione
├── routes/       Pagine TanStack Router
└── state/        Stato globale dell'app

public/
└── assets/       Mascotte, pose e icone installabili
```

## Feedback

PatchMe cresce attraverso utilizzo reale e feedback concreti. Se trovi un bug o hai un'idea, puoi segnalarla tramite GitHub oppure seguire gli aggiornamenti su [@patchmegame](https://t.me/patchmegame).

---

<div align="center">
  Creato da <a href="https://github.com/fabiozagaria">fabiozagariadev</a> con l'aiuto di Patchy 💚
</div>
