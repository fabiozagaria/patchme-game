# Contesto tecnico — PatchMe

Aggiornato: 2026-09-11

## Obiettivo corrente
Mantenere stabile PatchMe 1.0, mobile-first e locale, raccogliendo correzioni dall'uso reale prima di qualsiasi fase backend.

## Stato osservato
- Versione dichiarata: 1.0.0 Stabile.
- React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS, Radix UI e Zod.
- Dati persistiti localmente nel browser; nessun account o sincronizzazione server-side.
- PWA installabile, progressione locale, Bit, missioni/trofei, profilo/cosmetici, condivisione immagini e centro notifiche.
- Sviluppo AI-assisted dichiarato pubblicamente, con idea/direzione/test/decisioni finali curate dall'autore.
- Repository collegato a Lovable: non riscrivere la history pubblicata.

## Priorità tecnica dichiarata
Correzioni mirate e piccoli miglioramenti della 1.0. Il backend viene valutato solo come fase successiva e separata dopo i test della versione locale.

## Limiti correnti
- dati legati al browser/dispositivo;
- nessuna autenticazione o recupero account;
- nessuna sincronizzazione tra dispositivi;
- nessun link pubblico persistente alle singole patch.

## Regola di ripresa
Prima di nuove funzionalità verificare se appartengono davvero alla stabilizzazione 1.0 o a una fase successiva. Preservare compatibilità/migrazione dei dati locali e mantenere il branch in uno stato funzionante per la sincronizzazione con Lovable.


## Tema UI — 2026-10-02
Pulsante sole/luna accessibile nell’intestazione, tema coerente con i colori esistenti e scelta ricordata nel browser.
