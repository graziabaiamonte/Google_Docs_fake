// Direttiva Next.js che indica che tutte le funzioni in questo file vengono eseguite sul server
"use server";

// Importa la funzione nanoid per generare ID univoci e casuali
import { nanoid } from "nanoid";
// Importa l'istanza configurata di Liveblocks per la gestione dei documenti collaborativi
import { liveblocks } from "../liveblocks";
// Importa revalidatePath per invalidare la cache di Next.js per percorsi specifici
import { revalidatePath } from "next/cache";
// Importa funzioni utility: getAccessType per convertire tipi di accesso, parseStringify per serializzare dati
import { getAccessType, parseStringify } from "../utils";
// Importa redirect per reindirizzare l'utente a una nuova pagina
import { redirect } from "next/navigation";

// Funzione asincrona per creare un nuovo documento
// Riceve userId (ID dell'utente) ed email come parametri
export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  // Genera un ID univoco per la nuova "room" (documento collaborativo)
  const roomId = nanoid();

  try {
    // Crea i metadati del documento con le informazioni del creatore
    const metadata = {
      creatorId: userId, // ID del creatore
      email, // Email del creatore
      title: "Untitled", // Titolo predefinito del documento
    };

    // Definisce i permessi di accesso: l'email del creatore ha accesso in scrittura
    // [email] usa la sintassi computed property per usare il valore della variabile email come chiave
    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"], // Permesso di scrittura per il creatore
    };

    // Crea la room su Liveblocks con i parametri specificati
    const room = await liveblocks.createRoom(roomId, {
      metadata, // Metadati del documento
      usersAccesses, // Permessi specifici per utenti
      defaultAccesses: [], // Nessun accesso predefinito per utenti non specificati
    });

    // Invalida la cache di Next.js per la homepage per aggiornare la lista dei documenti
    revalidatePath("/");

    // Converte l'oggetto room in una stringa JSON e poi lo riconverte in oggetto
    // Questo processo rimuove proprietà non serializzabili
    return parseStringify(room);
  } catch (error) {
    // Log dell'errore in caso di fallimento nella creazione del documento
    console.log(`Error happened while creating a room: ${error}`);
  }
};

// Funzione per recuperare un documento specifico
// Verifica che l'utente abbia accesso al documento richiesto
export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    // Recupera la room da Liveblocks usando l'ID della room
    const room = await liveblocks.getRoom(roomId);

    // Verifica se l'userId è presente tra le chiavi degli accessi utente
    // Object.keys() restituisce un array delle chiavi dell'oggetto usersAccesses
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // Se l'utente non ha accesso, lancia un errore
    if (!hasAccess) {
      throw new Error("You do not have access to this document");
    }

    // Serializza e restituisce i dati della room se l'accesso è valido
    return parseStringify(room);
  } catch (error) {
    // Log dell'errore in caso di problemi nel recupero del documento
    console.log(`Error happened while getting a room: ${error}`);
  }
};

// Funzione per aggiornare il titolo di un documento esistente
export const updateDocument = async (roomId: string, title: string) => {
  try {
    // Aggiorna la room modificando solo il titolo nei metadati
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title, // Nuovo titolo del documento
      },
    });

    // Invalida la cache per la pagina specifica del documento per riflettere le modifiche
    revalidatePath(`/documents/${roomId}`);

    // Restituisce la room aggiornata serializzata
    return parseStringify(updatedRoom);
  } catch (error) {
    // Log dell'errore in caso di problemi nell'aggiornamento
    console.log(`Error happened while updating a room: ${error}`);
  }
};

// Funzione per recuperare tutti i documenti accessibili a un utente
export const getDocuments = async (email: string) => {
  try {
    // Recupera tutte le room associate all'email dell'utente
    // Nota: qui si usa email come userId, suggerendo che l'email funge da identificatore utente
    const rooms = await liveblocks.getRooms({ userId: email });

    // Restituisce la lista serializzata dei documenti
    return parseStringify(rooms);
  } catch (error) {
    // Log dell'errore in caso di problemi nel recupero dei documenti
    console.log(`Error happened while getting rooms: ${error}`);
  }
};

// Funzione per aggiornare i permessi di accesso di un utente a un documento
export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    // Crea l'oggetto dei permessi utente convertendo userType in AccessType
    // getAccessType() probabilmente converte stringhe come "editor" in array come ["room:write"]
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    // Aggiorna la room con i nuovi permessi utente
    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    // Se l'aggiornamento è riuscito, invia una notifica all'utente
    if (room) {
      // Genera un ID univoco per la notifica
      const notificationId = nanoid();

      // Invia una notifica inbox all'utente informandolo dei nuovi permessi
      await liveblocks.triggerInboxNotification({
        userId: email, // Destinatario della notifica
        kind: "$documentAccess", // Tipo di notifica predefinito di Liveblocks
        subjectId: notificationId, // ID univoco della notifica
        activityData: {
          // Dati della notifica
          userType, // Tipo di accesso concesso
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name, // Nome di chi ha modificato i permessi
          avatar: updatedBy.avatar, // Avatar di chi ha modificato i permessi
          email: updatedBy.email, // Email di chi ha modificato i permessi
        },
        roomId, // ID del documento interessato
      });
    }

    // Invalida la cache per la pagina del documento per aggiornare l'interfaccia
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    // Log dell'errore in caso di problemi nell'aggiornamento dei permessi
    console.log(`Error happened while updating a room access: ${error}`);
  }
};

// Funzione per rimuovere un collaboratore da un documento
export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    // Recupera prima la room per verificare chi è il proprietario
    const room = await liveblocks.getRoom(roomId);

    // Impedisce all'utente di rimuovere se stesso dal documento
    // Controlla se l'email da rimuovere corrisponde a quella del creatore nei metadati
    if (room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document");
    }

    // Rimuove l'utente impostando i suoi permessi a null
    // Questo effettivamente elimina l'utente dalla lista degli accessi
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null, // null rimuove completamente l'accesso per questa email
      },
    });

    // Invalida la cache per aggiornare l'interfaccia del documento
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    // Log dell'errore in caso di problemi nella rimozione del collaboratore
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

// Funzione per eliminare completamente un documento
export const deleteDocument = async (roomId: string) => {
  try {
    // Elimina definitivamente la room da Liveblocks
    await liveblocks.deleteRoom(roomId);
    // Invalida la cache della homepage per aggiornare la lista dei documenti
    revalidatePath("/");
    // Reindirizza l'utente alla homepage dopo l'eliminazione
    redirect("/");
  } catch (error) {
    // Log dell'errore in caso di problemi nell'eliminazione del documento
    console.log(`Error happened while deleting a room: ${error}`);
  }
};

// Concetti principali:

// 'use server': Tutte le funzioni vengono eseguite sul server, non nel browser
// Room: In Liveblocks, una "room" rappresenta un documento collaborativo dove più utenti possono lavorare insieme
// usersAccesses: Oggetto che definisce quali utenti hanno accesso e con che permessi
// revalidatePath(): Invalida la cache di Next.js per aggiornare l'interfaccia utente
// parseStringify(): Serializza gli oggetti per renderli compatibili con Next.js

// Flusso tipico:

// Creazione: createDocument → genera ID univoco → crea room → invalida cache homepage
// Accesso: getDocument → verifica permessi → restituisce dati documento
// Modifica: updateDocument → aggiorna metadati → invalida cache specifica
// Condivisione: updateDocumentAccess → modifica permessi → invia notifica → invalida cache
// Rimozione: removeCollaborator → verifica proprietario → rimuove accesso → invalida cache
// Eliminazione: deleteDocument → elimina room → invalida cache → reindirizza
