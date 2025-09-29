/* eslint-disable no-unused-vars */
// Disabilita l'avviso ESLint per variabili non utilizzate
// Utile nei file di definizione tipi dove le dichiarazioni potrebbero non essere usate in tutti i file

// Tipo per le props delle pagine Next.js che utilizzano routing dinamico e query parameters
declare type SearchParamProps = {
  // Parametri dinamici dalla URL (es: /user/[id] → params: { id: "123" })
  params: { [key: string]: string };
  // Query parameters dalla URL (es: /page?search=hello&filter=active)
  // Può essere stringa, array di stringhe o undefined
  searchParams: { [key: string]: string | string[] | undefined };
};

// Definisce i tipi di accesso possibili per le stanze Liveblocks
// Tuple che specifica i permessi esatti disponibili
declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];
// ["room:write"]: accesso completo (lettura, scrittura, presenza)
// ["room:read", "room:presence:write"]: solo lettura del contenuto + scrittura della presenza (cursori, selezioni)

// Mappa che associa ogni roomId ai suoi tipi di accesso
// Esempio: { "room-123": ["room:write"], "room-456": ["room:read", "room:presence:write"] }
declare type RoomAccesses = Record<string, AccessType>;

// Enumera i ruoli disponibili per gli utenti nel sistema
declare type UserType = "creator" | "editor" | "viewer";
// "creator": creatore del documento (permessi completi)
// "editor": può modificare il contenuto
// "viewer": può solo visualizzare

// Metadati associati a ogni stanza/documento
declare type RoomMetadata = {
  // ID dell'utente che ha creato la stanza
  creatorId: string;
  // Email del creatore (per identificazione e notifiche)
  email: string;
  // Titolo/nome del documento
  title: string;
};

// Parametri necessari per creare un nuovo documento
declare type CreateDocumentParams = {
  // ID dell'utente che sta creando il documento
  userId: string;
  // Email dell'utente (per metadati e notifiche)
  email: string;
};

// Rappresentazione completa di un utente nel sistema
declare type User = {
  // Identificativo univoco dell'utente
  id: string;
  // Nome visualizzato dell'utente
  name: string;
  // Indirizzo email dell'utente
  email: string;
  // URL dell'immagine del profilo
  avatar: string;
  // Colore associato all'utente (per cursori, evidenziazioni, etc.)
  color: string;
  // Ruolo dell'utente (opzionale, potrebbe non essere sempre definito)
  userType?: UserType;
};

// Parametri per condividere un documento con un altro utente
declare type ShareDocumentParams = {
  // ID della stanza da condividere
  roomId: string;
  // Email dell'utente con cui condividere
  email: string;
  // Tipo di accesso da concedere al nuovo utente
  userType: UserType;
  // Informazioni dell'utente che sta effettuando la condivisione (per audit/log)
  updatedBy: User;
};

// Props per il componente di selezione del tipo utente
declare type UserTypeSelectorParams = {
  // Valore corrente del tipo utente selezionato
  userType: string;
  // Funzione per aggiornare lo stato del tipo utente
  // React.Dispatch è il tipo per le funzioni setter di useState
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  // Handler opzionale per eventi di click personalizzati
  onClickHandler?: (value: string) => void;
};

// Props per il dialog/modal di condivisione documento
declare type ShareDocumentDialogProps = {
  // ID della stanza da condividere
  roomId: string;
  // Lista di utenti che già collaborano al documento
  collaborators: User[];
  // ID del creatore originale del documento
  creatorId: string;
  // Tipo di utente corrente (per determinare permessi UI)
  currentUserType: UserType;
};

// Props per il componente Header (già visto nel file precedente)
declare type HeaderProps = {
  // Contenuto JSX da renderizzare all'interno dell'header
  children: React.ReactNode;
  // Classi CSS aggiuntive opzionali
  className?: string;
};

// Props per il componente che gestisce un singolo collaboratore
declare type CollaboratorProps = {
  // ID della stanza in cui avviene la collaborazione
  roomId: string;
  // Email del collaboratore
  email: string;
  // ID del creatore originale (per controlli di permessi)
  creatorId: string;
  // Dati completi del collaboratore da visualizzare
  collaborator: User;
  // Dati dell'utente corrente che visualizza il collaboratore
  user: User;
};

// Props per la stanza collaborativa principale
declare type CollaborativeRoomProps = {
  // ID univoco della stanza
  roomId: string;
  // Metadati del documento/stanza
  roomMetadata: RoomMetadata;
  // Lista di tutti gli utenti nella stanza
  users: User[];
  // Ruolo dell'utente corrente (determina cosa può fare)
  currentUserType: UserType;
};

// Props per il pulsante di aggiunta nuovo documento
declare type AddDocumentBtnProps = {
  // ID dell'utente che vuole creare il documento
  userId: string;
  // Email dell'utente (per metadati del nuovo documento)
  email: string;
};

// Props per il modal di conferma eliminazione
declare type DeleteModalProps = { 
  // ID della stanza da eliminare
  roomId: string 
};

// Props per il wrapper dei thread di commenti
// ThreadData e BaseMetadata sono tipi importati da Liveblocks
declare type ThreadWrapperProps = { 
  // Dati del thread di commenti da visualizzare
  thread: ThreadData<BaseMetadata> 
};