// Direttiva che indica che questo componente deve essere eseguito nel browser (client-side)
"use client";

// Importa il componente Loader per mostrare stati di caricamento
import Loader from "@/components/Loader";
// Importa le server actions per recuperare dati utente da Clerk e documenti
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";
// Importa l'hook useUser di Clerk per accedere ai dati dell'utente corrente
import { useUser } from "@clerk/nextjs";
// Importa i provider di Liveblocks per la collaborazione real-time
// ClientSideSuspense gestisce gli stati di loading, LiveblocksProvider fornisce il contesto globale
import {
  ClientSideSuspense,
  LiveblocksProvider,
} from "@liveblocks/react/suspense";
// Importa il tipo ReactNode per tipizzare i children components
import { ReactNode } from "react";

// Componente Provider che wrappa l'intera applicazione con i provider necessari
// Riceve children (tutti i componenti figli) come prop
const Provider = ({ children }: { children: ReactNode }) => {
  // Estrae i dati dell'utente corrente usando l'hook useUser di Clerk
  // Destructuring per ottenere direttamente l'oggetto user e rinominarlo in clerkUser per chiarezza
  const { user: clerkUser } = useUser();

  return (
    // LiveblocksProvider è il provider principale che configura Liveblocks per tutta l'app
    <LiveblocksProvider
      // Endpoint per l'autenticazione Liveblocks - punta a una API route di Next.js
      // Questo endpoint gestisce la generazione dei token JWT per autenticare gli utenti con Liveblocks
      authEndpoint="/api/liveblocks-auth"
      // Funzione per risolvere informazioni utente quando Liveblocks ha solo gli userIds
      // Viene chiamata automaticamente da Liveblocks quando ha bisogno di dettagli utente completi
      resolveUsers={async ({ userIds }) => {
        // Chiama la server action per recuperare i dati completi degli utenti da Clerk
        // userIds è un array di ID utente che Liveblocks vuole risolvere
        const users = await getClerkUsers({ userIds });

        // Restituisce i dati utente completi (nome, avatar, email, etc.)
        return users;
      }}
      // Funzione per fornire suggerimenti di mention (@username) nell'editor
      // Viene chiamata quando un utente digita @ nell'editor per mostrare una lista di utenti
      resolveMentionSuggestions={async ({ text, roomId }) => {
        // Recupera gli utenti del documento corrente che potrebbero essere menzionati
        const roomUsers = await getDocumentUsers({
          roomId, // ID del documento corrente
          currentUser: clerkUser?.emailAddresses[0].emailAddress!, // Email dell'utente corrente
          text, // Testo digitato dopo @ per filtrare i suggerimenti
        });

        // Restituisce la lista filtrata di utenti che possono essere menzionati
        return roomUsers;
      }}
    >
      {/* ClientSideSuspense gestisce gli stati di loading durante l'inizializzazione di Liveblocks */}
      {/* fallback specifica cosa mostrare durante il caricamento */}
      <ClientSideSuspense fallback={<Loader />}>
        {/* Renderizza tutti i componenti figli dell'applicazione */}
        {/* Tutti questi componenti avranno accesso al contesto Liveblocks */}
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
};

// Esporta il componente come default per essere usato nel layout principale
export default Provider;
