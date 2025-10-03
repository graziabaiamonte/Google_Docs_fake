import AddDocumentBtn from "@/components/AddDocumentBtn";
import { DeleteModal } from "@/components/DeleteModal";
import Header from "@/components/Header";
import Notifications from "@/components/Notifications";
import { Button } from "@/components/ui/button";

// Importa la server action per recuperare i documenti
import { getDocuments } from "@/lib/actions/room.actions";
import { dateConverter } from "@/lib/utils";
// Importa componenti di Clerk per l'autenticazione: SignedIn per controllare lo stato di login, UserButton per il pulsante utente
import { SignedIn, UserButton } from "@clerk/nextjs";

// Importa la funzione server-side di Clerk per ottenere l'utente corrente
import { currentUser } from "@clerk/nextjs/server";

import Image from "next/image";
import Link from "next/link";

// Importa la funzione redirect di Next.js per reindirizzamenti server-side
import { redirect } from "next/navigation";

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
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />

          {/* SignedIn è un wrapper che mostra il contenuto solo se l'utente è autenticato */}
          <SignedIn>
            {/* UserButton fornisce un dropdown con opzioni utente (profilo, logout, ecc.) */}
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {/* Se ci sono documenti (length > 0), mostra la lista, altrimenti mostra lo stato vuoto */}
      {roomDocuments.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All documents</h3>

            {/* Passa l'ID utente e l'email come props necessarie per la creazione */}
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>

          <ul className="document-ul">
            {/* Mappa attraverso tutti i documenti e crea un elemento lista per ognuno */}
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
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className="mx-auto"
          />

          {/* Stesso pulsante per aggiungere documenti, ma nello stato vuoto */}
          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

export default Home;
