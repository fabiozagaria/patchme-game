# Patch Notes Studio

Crea una web app mobile-first chiamata PatchMe.

OBIETTIVO
PatchMe trasforma i cambiamenti della settimana in patch notes personali ispirate agli aggiornamenti dei videogiochi. Deve essere realmente usabile da smartphone e predisposta a diventare un'app Android tramite Capacitor.

INTRO OBBLIGATORIA
All'avvio mostra per circa 1,2 secondi:
fabio
zagaria
dev
su tre righe, compatta, centrata, robusta, con animazione originale e d'impatto, adatta a tema chiaro/scuro. Non copiare logo, font, suoni o animazioni di Supercell. Mostrala solo al caricamento iniziale, non durante la navigazione.

PRIMO AVVIO
Nessun dato demo permanente. Se è il primo avvio mostra una configurazione vuota con:
- nome visualizzato;
- formato versione: anno/settimana (es. v26.36), sequenziale (v1.0), manuale;
- tema chiaro, scuro o sistema;
- colore principale.
Tutto deve essere modificabile nelle impostazioni.
In questa versione salva configurazione e patch localmente sul dispositivo. Non aggiungere autenticazione, Supabase o backend.

HOME / ARCHIVIO
- saluto discreto;
- pulsante evidente “Nuova patch”;
- elenco patch dalla più recente;
- stato vuoto curato;
- ogni scheda mostra titolo, versione, data, stato bozza/pubblicata e riepilogo;
- apertura, modifica ed eliminazione con conferma;
- accesso alle impostazioni.
Non creare patch di esempio.

MODELLO PATCH
Ogni patch contiene id univoco, titolo, versione, data, stato bozza/pubblicata, sezioni ordinate, createdAt e updatedAt.
Sezioni predefinite:
- Novità
- Miglioramenti
- Correzioni
- Bug conosciuti
- Funzionalità rimosse
- Prossimo aggiornamento
- Sezione personalizzata

EDITOR
Permetti di:
- aggiungere/rimuovere/riordinare sezioni;
- aggiungere, modificare ed eliminare più elementi testuali in ogni sezione;
- creare sezioni personalizzate;
- salvare come bozza;
- pubblicare;
- aprire l’anteprima;
- uscire con conferma se ci sono modifiche non salvate.
Non salvare elementi completamente vuoti.

VALIDAZIONE
Titolo e versione obbligatori. Una patch pubblicata deve contenere almeno una sezione con un elemento valido. Errori vicino ai campi, messaggi brevi dopo salvataggio/errore. L'app non deve rompersi con local storage assente o dati non validi.

ANTEPRIMA
Crea una scheda grafica condivisibile con nome, titolo, versione, data, sole sezioni non vuote e piccolo marchio PatchMe. Predisponi il componente per una futura esportazione immagine, senza aggiungere ora dipendenze instabili.

DESIGN
Interfaccia videoludica moderna, originale ed elegante:
- tema scuro predefinito;
- fondo grafite quasi nero;
- superfici leggermente più chiare;
- bianco caldo;
- verde acido controllato come accento;
- colori accessibili per categorie;
- bordi sottili, ombre leggere, angoli moderati;
- animazioni rapide.
Evita cyberpunk eccessivo, neon inutili, immagini stock, emoji usate come icone, testo minuscolo e copie di giochi esistenti.
Garantisci contrasto, focus visibile, label e touch target comodi.

ARCHITETTURA
TypeScript tipizzato, evita any. Separa componenti, modelli, stato, validazione, configurazione, temi, logica versioni e persistenza. Centralizza nome PatchMe, firma fabio/zagaria/dev, colori, durata intro, categorie e testi. Usa un servizio/repository dedicato per la persistenza locale invece di accedere a localStorage ovunque.

RESPONSIVE
Mobile-first per Android: verifica 360px, 390px, tablet e desktop. Navigazione semplice e sicura nelle aree del telefono.

NON AGGIUNGERE
Autenticazione, Supabase, social, follower, commenti, pubblicità, abbonamenti, IA, notifiche, classifiche o dati demo.

CRITERI DI ACCETTAZIONE
Il flusso deve funzionare interamente:
1. intro;
2. configurazione vuota;
3. archivio vuoto;
4. creazione patch con titolo/versione/sezione/elemento;
5. salvataggio bozza;
6. persistenza dopo riapertura;
7. modifica;
8. pubblicazione;
9. anteprima;
10. eliminazione con conferma.
Implementa e verifica questo flusso prima di aggiungere qualunque altra funzione.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://patchme-fabiozagariadev.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66393695-78bf-4732-83ed-7ac9f5464f8d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
