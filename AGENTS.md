<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Istruzioni per assistenti AI

## Scopo
PatchMe è un prodotto web mobile-first in sviluppo Alpha che trasforma persone e situazioni in patch notes condivisibili.

## Regole operative
- Leggere `README.md` e `docs/CONTEXT.md` prima di modifiche ampie.
- Preservare idea, direzione prodotto e decisioni finali dell'autore; l'AI può assistere progettazione, codice, review e debugging ma non deve sostituire la decisione di prodotto.
- Non introdurre backend, account o sincronizzazione prima che siano esplicitamente scelti come fase attiva.
- Preferire correzioni e stabilizzazione della 0.9 prima di espansioni laterali.
- Verificare build/lint e comportamento manuale pertinente prima di considerare conclusa una modifica.
- Mantenere migrazioni e compatibilità dei dati locali quando cambia lo schema persistito.
- Rispettare sempre le istruzioni Lovable presenti all'inizio di questo file.

## Fonti di verità
- Il codice è la verità tecnica.
- `README.md` descrive prodotto, versione e roadmap pubblica.
- `docs/CONTEXT.md` sintetizza stato e priorità tecniche correnti.
- Eventuali piani personali o valutazioni di studio restano fuori dal repository.

## Sicurezza e privacy
Non inserire token, credenziali, segreti o dati personali. La versione Alpha usa dati locali nel browser: non affermare invio o persistenza server-side se non realmente implementati.