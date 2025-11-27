Mini Catalogo Prodotti
Obiettivo: realizzare una piccola applicazione full-stack (frontend + backend + database) per la gestione di un catalogo prodotti con categorie.

Requisiti
Funzionalità
Prodotti

Campi minimi: id, name, price, category_id, tags, created_at.
Operazioni: list, get by id, create, update, delete.
List: ricerca testuale, filtro per categoria, filtro per prezzo minimo/massimo, ordinamento per prezzo o data di creazione, paginazione.
Validazioni: name obbligatorio; price ≥ 0; category_id valido se presente.
Categorie

Campi minimi: id, name.
Operazioni: list, create.
Frontend

Vista elenco prodotti con ricerca/filtri/ordinamento/paginazione.
Form creazione/modifica prodotto.
Visualizzazione chiara degli stati (caricamento/errore/successo).
Backend

API REST con routing chiaro e status code coerenti.
Filtri, ordinamento e paginazione gestiti lato server.
Database

Persistenza relazionale (PostgreSQL consigliato; in alternativa SQLite).
Migrazioni o script di inizializzazione.
Avvio

Preferibile utilizzo di Docker/Docker Compose per avvio rapido (app + DB).
Variabili di ambiente tramite file dedicato (es. .env.example).
Consegna (obbligatoria su GitHub)
Pubblica il progetto in una repository GitHub (pubblica o privata con accesso fornito su richiesta).
Includi:
Codice frontend e backend.
README.md con istruzioni di avvio (Docker e avvio locale), configurazione variabili, comandi per migrazioni/seed, e comandi test.
docker-compose.yml e relativi Dockerfile.
Migrazioni o script DB; file .env.example.
Usa commit granulari con messaggi chiari; evita un unico commit cumulativo.
Tagga una release (es. v0.1) o fornisci branch di consegna dedicata.
Vincoli
Stack: a scelta (linguaggi e framework liberi).
Qualità attesa: struttura chiara, coerenza stilistica, gestione errori, documentazione minima essenziale.
Criteri di valutazione
Completezza funzionale
Qualità e organizzazione del codice
Correttezza API e validazioni
UX essenziale del frontend
Developer Experience (README, avvio rapido, migrazioni/test di base)