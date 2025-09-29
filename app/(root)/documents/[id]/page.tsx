import CollaborativeRoom from "@/components/CollaborativeRoom";
// Import della funzione server action per recuperare i dati del documento
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Componente server asincrono che rappresenta la pagina del documento
// Riceve i parametri URL tramite destructuring: { params: { id } }
// L'id viene estratto dai parametri dinamici della route (es: /documents/[id])
const Document = async ({ params: { id } }: SearchParamProps) => {
  // Recupera i dati dell'utente attualmente autenticato tramite Clerk
  // Questa è una chiamata asincrona che restituisce null se l'utente non è loggato
  const clerkUser = await currentUser();

  // Controllo di autenticazione: se non c'è un utente loggato, reindirizza alla pagina di login
  if (!clerkUser) redirect("/sign-in");

  // Recupera i dati del documento/stanza dal database
  const room = await getDocument({
    // ID della stanza passato come parametro URL
    roomId: id,
    // Email dell'utente corrente (primo indirizzo email del profilo Clerk)
    // Usata per verificare i permessi di accesso alla stanza
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  // Controllo di esistenza: se la stanza non esiste o l'utente non ha accesso,
  // reindirizza alla homepage
  if (!room) redirect("/");

  // Estrae tutti gli ID utente che hanno accesso alla stanza
  // Object.keys() restituisce un array delle chiavi dell'oggetto usersAccesses
  const userIds = Object.keys(room.usersAccesses);

  // Recupera i dati completi degli utenti da Clerk usando gli ID estratti
  const users = await getClerkUsers({ userIds });

  // Trasforma i dati utenti aggiungendo il tipo di utente basato sui permessi
  const usersData = users.map((user: User) => ({
    // Spread dell'oggetto user originale (mantiene tutte le proprietà esistenti)
    ...user,
    // Determina il tipo di utente controllando i permessi nella stanza
    // Se l'utente ha il permesso 'room:write', è un 'editor', altrimenti è un 'viewer'
    userType: room.usersAccesses[user.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  // Determina il tipo di utente corrente usando la stessa logica
  // Controlla se l'email dell'utente corrente ha il permesso di scrittura
  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";

  // Rendering del componente
  return (
    // Container principale con layout centrato e full width
    <main className="flex w-full flex-col items-center">
      {/* Componente della stanza collaborativa con tutte le props necessarie */}
      <CollaborativeRoom
        // ID della stanza per la connessione Liveblocks
        roomId={id}
        // Metadati del documento (titolo, creatore, email)
        roomMetadata={room.metadata}
        // Array di tutti gli utenti con i loro tipi determinati
        users={usersData}
        // Tipo dell'utente corrente per controlli UI e permessi
        currentUserType={currentUserType}
      />
    </main>
  );
};

// Export default del componente pagina
export default Document;
