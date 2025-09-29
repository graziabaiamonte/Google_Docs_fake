"use server";

// Importa l'istanza del client Clerk per interazioni server-side con l'API Clerk
import { clerkClient } from "@clerk/nextjs/server";
// Importa la funzione utility per serializzare/deserializzare oggetti
import { parseStringify } from "../utils";
// Importa l'istanza configurata di Liveblocks per gestire i documenti collaborativi
import { liveblocks } from "../liveblocks";

// Funzione per recuperare informazioni dettagliate degli utenti da Clerk
// Utilizzata principalmente per risolvere userIds in dati utente completi
export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    // Chiama l'API Clerk per recuperare la lista degli utenti
    // emailAddress: userIds assume che gli userIds siano effettivamente indirizzi email
    // Questo è un pattern comune dove l'email funge da identificatore utente univoco
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });

    // Trasforma i dati grezzi di Clerk in un formato più semplice e consistente
    // Mappa ogni utente Clerk in un oggetto con solo le proprietà necessarie
    const users = data.map((user) => ({
      id: user.id, // ID univoco Clerk dell'utente
      name: `${user.firstName} ${user.lastName}`, // Nome completo concatenando nome e cognome
      email: user.emailAddresses[0].emailAddress, // Prima email dell'utente (primaria)
      avatar: user.imageUrl, // URL dell'immagine profilo
    }));

    // Riordina gli utenti nell'ordine degli userIds originali
    // Questo mantiene l'ordine specificato nella richiesta invece dell'ordine casuale dalla query
    // userIds.map cerca per ogni email il corrispondente utente nell'array users
    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    // Serializza il risultato per renderlo compatibile con Next.js e il trasferimento client-server
    return parseStringify(sortedUsers);
  } catch (error) {
    // Log dell'errore in caso di problemi nella chiamata API Clerk
    console.log(`Error fetching users: ${error}`);
  }
};

// Funzione per recuperare gli utenti che hanno accesso a un documento specifico
// Utilizzata per i suggerimenti di @mention nell'editor collaborativo
export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    // Recupera i dettagli della room da Liveblocks per accedere alla lista degli utenti
    const room = await liveblocks.getRoom(roomId);

    // Estrae tutte le email degli utenti che hanno accesso al documento
    // Object.keys(room.usersAccesses) restituisce un array di tutte le chiavi (email) dell'oggetto usersAccesses
    // filter() rimuove l'utente corrente dalla lista per evitare auto-mention
    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );

    // Se è stato fornito del testo per filtrare, applica il filtro
    if (text.length) {
      // Converte il testo di ricerca in minuscolo per confronto case-insensitive
      const lowerCaseText = text.toLowerCase();

      // Filtra gli utenti che contengono il testo di ricerca nella loro email
      // Questo permette di cercare utenti digitando parte della loro email dopo @
      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );

      // Restituisce solo gli utenti filtrati
      return parseStringify(filteredUsers);
    }

    // Se non c'è testo di filtro, restituisce tutti gli utenti del documento (eccetto l'utente corrente)
    return parseStringify(users);
  } catch (error) {
    // Log dell'errore in caso di problemi nel recupero dei dati della room
    console.log(`Error fetching document users: ${error}`);
  }
};
