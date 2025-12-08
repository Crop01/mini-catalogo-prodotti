# Mini Catalogo Prodotti - Full Stack Application

Progetto Full-Stack per la gestione di un inventario prodotti.
L'obiettivo era creare un'architettura pulita, scalabile e con una UX curata, andando oltre il classico "CRUD scolastico".

## Stack Tecnologico

Ho selezionato questo stack per bilanciare velocità di sviluppo e robustezza.

* **Backend: Laravel 12**
  
  La scelta standard per API REST solide. Ho sfruttato le `FormRequest` per validare i dati fuori dai controller e gli `API Resources` per standardizzare le risposte JSON.

* **Database: PostgreSQL**
  
  Come da consegna.

* **Frontend: React 19 + Vite**
  
  Integrato nell'ecosistema Laravel.
  * **Axios:** Utilizzato come client HTTP per gestire le chiamate asincrone verso le API Backend in modo pulito e per intercettare gli errori.
  * **React Hooks:** Gestione dello stato e degli effetti collaterali (es. debounce per la ricerca).

* **UI/UX: Tailwind CSS V3**
  
  Design custom ispirato alle dashboard SaaS moderne (es. Stripe). Ho evitato librerie di componenti pesanti preferendo HTML.

* **DevOps: Docker (Sail)**
  
  Per avere un ambiente isolato che gira identico su qualsiasi macchina.

## Guida all'Avvio

Il progetto è configurato per girare interamente su Docker, ma ho predisposto una modalità "ibrida" per migliorare la velocità di sviluppo del frontend su Windows.

### Prerequisiti

* Docker Desktop (attivo)
* Node.js (opzionale, per sviluppo frontend locale veloce su Windows)

### 1. Setup Backend & Database

Clona la repository e avvia i container:

```bash
# Clona il repository
git clone <URL>
cd mini-catalogo
```

Crea il file di configurazione (già pronto per Docker):

```bash
cp .env.example .env
```

Avviare il Container:

```bash
docker compose up -d
```

Installa le dipendenze PHP:

```bash
docker compose exec laravel.test composer install
```

Genera la key dell'applicazione:

```bash
docker compose exec laravel.test php artisan key:generate
```

### 2. Database e dati di prova

Lanciare le migrazioni e il seeder (crea 50 prodotti finti per testare subito i filtri):

```bash
docker compose exec laravel.test php artisan migrate --seed
```

### 3. Avvio frontend (Nota per Windows)

Due modi per far girare il frontend (Vite).

#### Metodo A: Sviluppo Locale (Consigliato su Windows)

Docker su Windows (WSL2) può essere lento nel notificare le modifiche ai file (Hot Reload). Per sviluppare velocemente, consiglio di lanciare Node in locale:

```bash
npm install
npm run dev
```

#### Metodo B: Full Docker

Se non vuoi installare Node sul tuo PC:

```bash
docker compose exec laravel.test npm install
docker compose exec laravel.test npm run dev
```

Aprire il browser su: [http://localhost](http://localhost)

## Dettagli implementativi

### Performance & UX

* **Debounce**: Ho notato che la ricerca live appesantiva il server. Ho implementato un debounce di 500ms su tutti i filtri: la chiamata parte solo quando l'utente smette di scrivere.

* **Validazione Prezzi**: Il frontend impedisce chiamate API inutili se il prezzo Minimo è maggiore del Massimo, segnalandolo visivamente (bordo rosso) senza interrompere la digitazione.

* **Feedback**: Niente schermate bianche o bloccate. Ho usato indicatori di caricamento (Spinner) centrali per la tabella e integrati nei bottoni durante il salvataggio.

### Backend Logic

* **Query Scopes**: I filtri non sono "spaghetti code" nel controller, ma query dinamiche costruite passo passo.

* **Tags**: Salvati come array JSON puro. Più performante di una tabella pivot per semplici etichette di testo.

## Testing:

L'applicazione include test per verificare la corretta funzionalità delle API. Per lanciarli:
```bash
docker compose exec laravel.test php artisan test
```