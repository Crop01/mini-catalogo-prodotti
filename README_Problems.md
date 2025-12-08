# Diario di Sviluppo: 

Questo file non è la solita documentazione tecnica. È il racconto di come ho costruito questo progetto, dalle decisioni architetturali ai problemi che ho dovuto risolvere lungo il percorso.

---

## Fase 1: La scelta dello Stack Tecnologico

La consegna lasciava libertà di scelta. Ho puntato su **Laravel (Backend)** e **React (Frontend)**. Ecco perché:

1.  **Backend: Laravel 12**
    Per un progetto che richiede API, Database e Validazioni in tempi stretti, Laravel è un'ottima scelta, oltre ad essere il framework backend che conosco meglio.
    * *Validazione:* Invece di riempire il Controller di `if`, ho spostato tutte le regole in una `FormRequest`. È più pulito e separa le responsabilità.
    * *Risposte API:* Ho usato le `API Resources` per avere un controllo totale sul JSON che arriva al frontend.

2.  **Database: PostgreSQL**

3.  **Frontend: React + Vite**
    Volevo un'interfaccia reattiva immediata, senza i ricaricamenti di pagina tipici di Blade.

---

## Fase 2: Il problema "Windows vs Docker"

All'inizio ho configurato tutto per girare al 100% dentro Docker. Sulla carta è la soluzione perfetta. Nella pratica, su Windows (usando WSL2), il caricamento delle pagine con Vite era lentissimo. Ogni modifica al codice impiegava secondi per riflettersi nel browser.

**La Soluzione Ibrida:**
Non ho voluto sacrificare la mia velocità di sviluppo. Ho configurato l'ambiente in modo ibrido:
* **Backend & DB:** Girano isolati dentro i container Docker.
* **Frontend:** Gira in locale sul mio computer via Node.js, collegandosi alle API di Docker.

Questo mi ha permesso di avere il meglio dei due mondi: un ambiente server pulito e un frontend istantaneo.

---

## Fase 3: L'evoluzione del Design (Da "Foglio Excel" a SaaS)

La prima versione della tabella era funzionale, ma brutta. Sembrava un foglio Excel grigio. Ho deciso di ispirarmi alle dashboard moderne (stile Stripe).

**Le sfide estetiche:**
* **Tailwind CSS v4:** Ho provato a installare l'ultima versione (v4). Ha iniziato a dare conflitti con il plugin di Vite. Ho fatto un passo indietro e sono tornato alla **v3 stabile**. 
* **Le Select di Windows:** Le tendine native del browser rovinavano tutto il design. Ho creato un componente `CustomSelect` che nasconde la grafica nativa e sovrappone delle icone SVG personalizzate, mantenendo però l'accessibilità del sistema operativo.
* **Mancanza di Immagini:** Non avendo immagini reali dei prodotti, la lista era triste. Ho scritto una piccola utility che genera un "Avatar" colorato basato sulle iniziali del prodotto. Ogni prodotto ha il suo colore unico, generato matematicamente dal nome. Dà vita all'interfaccia senza bisogno di salvare nulla nel DB.

---

## 🧠 Fase 4: UX e Logica (I dettagli che contano)

Qui è dove ho speso più tempo. Non volevo solo che "funzionasse", volevo che fosse piacevole da usare.

### 1. Il problema della Ricerca (Debounce)
Inizialmente, appena scrivevo una lettera nella barra di ricerca, partiva una chiamata al server. Scrivendo "iPhone", partivano 6 chiamate inutili.
Ho scritto un custom hook `useDebounce` che aspetta **500ms** dopo che l'utente smette di scrivere prima di lanciare la ricerca.

### 2. Il problema del Prezzo Min/Max
Implementare il range di prezzo ha portato a un bug logico: cosa succede se l'utente scrive un prezzo Minimo (es. 100) che è temporaneamente più alto del Massimo (es. 50)?
* Il mio approccio: Lasciar scrivere l'utente, ma **colorare i bordi di rosso** per segnalare l'errore logico e **bloccare silenziosamente la chiamata API** finché i numeri non hanno senso.

### 3. Feedback di Caricamento
Ho aggiunto degli stati di caricamento ovunque:
* Mentre la tabella si aggiorna, appare uno spinner centrale.
* Quando salvi un prodotto, il bottone "Salva" mostra un'icona di caricamento e si disabilita per evitare doppi click.