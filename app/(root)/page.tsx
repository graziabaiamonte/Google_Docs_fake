// Importa il componente per aggiungere nuovi documenti
import AddDocumentBtn from "@/components/AddDocumentBtn";
// Importa il modale per la conferma dell'eliminazione documenti
import { DeleteModal } from "@/components/DeleteModal";
// Importa il componente header della pagina
import Header from "@/components/Header";
// Importa il componente per visualizzare le notifiche
import Notifications from "@/components/Notifications";
// Importa il componente Button dalla libreria UI
import { Button } from "@/components/ui/button";
// Importa la server action per recuperare i documenti
import { getDocuments } from "@/lib/actions/room.actions";
// Importa la funzione utility per convertire le date in formato leggibile
import { dateConverter } from "@/lib/utils";
// Importa componenti di Clerk per l'autenticazione: SignedIn per controllare lo stato di login, UserButton per il pulsante utente
import { SignedIn, UserButton } from "@clerk/nextjs";
// Importa la funzione server-side di Clerk per ottenere l'utente corrente
import { currentUser } from "@clerk/nextjs/server";
// Importa il componente Image di Next.js per ottimizzazione delle immagini
import Image from "next/image";
// Importa il componente Link di Next.js per navigazione client-side
import Link from "next/link";
// Importa la funzione redirect di Next.js per reindirizzamenti server-side
import { redirect } from "next/navigation";

// Definisce il componente Home come funzione asincrona (server component)
const Home = async () => {
  // Recupera i dati dell'utente corrente dal server usando Clerk
  // currentUser() è una funzione server-side che restituisce null se l'utente non è autenticato
  const clerkUser = await currentUser();

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  // Questo controllo avviene lato server prima del rendering
  if (!clerkUser) redirect("/sign-in");

  // Recupera tutti i documenti accessibili all'utente
  // Usa il primo indirizzo email dell'utente (gli utenti possono avere più email)
  // clerkUser.emailAddresses è un array, prendiamo il primo elemento [0]
  const roomDocuments = await getDocuments(
    clerkUser.emailAddresses[0].emailAddress
  );

  return (
    <main className="home-container">
      {/* Header con positioning sticky per rimanere fisso durante lo scroll */}
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Componente per visualizzare le notifiche dell'utente */}
          <Notifications />
          {/* SignedIn è un wrapper che mostra il contenuto solo se l'utente è autenticato */}
          <SignedIn>
            {/* UserButton fornisce un dropdown con opzioni utente (profilo, logout, ecc.) */}
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {/* Rendering condizionale basato sulla presenza di documenti */}
      {/* Se ci sono documenti (length > 0), mostra la lista, altrimenti mostra lo stato vuoto */}
      {roomDocuments.data.length > 0 ? (
        // Container per la lista dei documenti quando ci sono documenti
        <div className="document-list-container">
          <div className="document-list-title">
            {/* Titolo della sezione documenti */}
            <h3 className="text-28-semibold">All documents</h3>
            {/* Pulsante per aggiungere un nuovo documento */}
            {/* Passa l'ID utente e l'email come props necessarie per la creazione */}
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>

          <ul className="document-ul">
            {/* Mappa attraverso tutti i documenti e crea un elemento lista per ognuno */}
            {/* Destructuring di id, metadata e createdAt da ogni documento */}
            {/* any type viene usato qui per semplicità, idealmente si dovrebbe avere un tipo definito */}
            {roomDocuments.data.map(({ id, metadata, createdAt }: any) => (
              <li key={id} className="document-list-item">
                <Link
                  href={`/documents/${id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>

                  {/* Informazioni del documento */}
                  <div className="space-y-1">
                    {/* Titolo del documento con line-clamp-1 per troncare il testo se troppo lungo */}
                    <p className="line-clamp-1 text-lg">{metadata.title}</p>
                    {/* Data di creazione convertita in formato leggibile (es: "2 days ago") */}
                    <p className="text-sm font-light text-blue-100">
                      Created about {dateConverter(createdAt)}
                    </p>
                  </div>
                </Link>

                {/* Componente modale per eliminare il documento */}
                {/* Viene renderizzato per ogni documento con il suo roomId specifico */}
                <DeleteModal roomId={id} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Stato vuoto quando non ci sono documenti
        <div className="document-list-empty">
          {/* Icona centrata per lo stato vuoto */}
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className="mx-auto" // mx-auto centra orizzontalmente l'immagine
          />

          {/* Stesso pulsante per aggiungere documenti, ma nello stato vuoto */}
          {/* Incoraggia l'utente a creare il suo primo documento */}
          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

// Esporta il componente come export default per essere usato come pagina
export default Home;
