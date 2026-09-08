# Contesto tecnico — PatchMe

Aggiornato: 2026-09-08

## Obiettivo corrente
Stabilizzare PatchMe 0.9 Alpha attraverso correzioni e uso reale, mantenendo il prodotto mobile-first e locale prima di introdurre un backend.

## Stato osservato
- Versione dichiarata: 0.9.0 Alpha.
- React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS, Radix UI e Zod.
- Dati persistiti localmente nel browser; nessun account o sincronizzazione server-side.
- PWA installabile, progressione locale, Bit, missioni/trofei, profilo/cosmetici, condivisione immagini e centro notifiche.
- Sviluppo AI-assisted dichiarato pubblicamente, con idea/direzione/test/decisioni finali curate dall'autore.
- Repository collegato a Lovable: non riscrivere la history pubblicata.

## Priorità tecnica dichiarata
Correzioni e piccoli miglioramenti fino alla stabilizzazione della 0.9. Il backend viene valutato solo dopo i test della versione locale.

## Limiti correnti
- dati legati al browser/dispositivo;
- nessuna autenticazione o recupero account;
- nessuna sincronizzazione tra dispositivi;
- nessun link pubblico persistente alle singole patch.

## Regola di ripresa
Prima di nuove funzionalità verificare se appartengono davvero alla stabilizzazione 0.9 o a una fase successiva. Preservare compatibilità/migrazione dei dati locali e mantenere il branch in uno stato funzionante per la sincronizzazione con Lovable.