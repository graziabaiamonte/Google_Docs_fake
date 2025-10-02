// Import del componente Image di Next.js per l'ottimizzazione delle immagini
import Image from "next/image";

// Import di React e useState hook per gestire lo stato locale del componente
import React, { useState } from "react";

// Import del componente UserTypeSelector per cambiare i permessi del collaboratore
import UserTypeSelector from "./UserTypeSelector";

// Import del componente Button personalizzato
import { Button } from "./ui/button";

// Import delle server actions per rimuovere collaboratori e aggiornare i loro permessi
// removeCollaborator: rimuove completamente un collaboratore dal documento
// updateDocumentAccess: modifica i permessi di accesso di un collaboratore
import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/room.actions";

// Definizione del componente Collaborator che riceve props tipizzate con CollaboratorProps
// roomId: ID univoco della room/documento
// creatorId: ID del creatore del documento (per identificare l'owner)
// collaborator: oggetto con tutti i dati del collaboratore (id, nome, email, avatar, userType)
// email: email del collaboratore (ridondante ma usata nelle chiamate API)
// user: informazioni sull'utente corrente che sta visualizzando/modificando
const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
  email,
  user,
}: CollaboratorProps) => {
  // State per memorizzare il tipo di permesso del collaboratore
  // Inizializzato con il valore esistente o 'viewer' come default
  // || 'viewer' è un fallback nel caso collaborator.userType sia undefined o null
  const [userType, setUserType] = useState(collaborator.userType || "viewer");

  // State per tracciare lo stato di caricamento durante le operazioni async
  // Usato per disabilitare i controlli e mostrare feedback "updating..."
  const [loading, setLoading] = useState(false);

  // Funzione asincrona per gestire il cambio di permessi del collaboratore
  // type: il nuovo tipo di permesso selezionato ('viewer' o 'editor')
  const shareDocumentHandler = async (type: string) => {
    // Imposta loading a true per mostrare feedback visivo e prevenire azioni multiple
    setLoading(true);

    // Chiama la server action per aggiornare i permessi di accesso nel database
    await updateDocumentAccess({
      // ID della room dove modificare i permessi
      roomId,
      // Email del collaboratore da modificare
      email,
      // Nuovo tipo di permesso (cast esplicito al tipo UserType)
      userType: type as UserType,
      // Informazioni su chi sta effettuando la modifica (per audit/log)
      updatedBy: user,
    });

    // Reimposta loading a false dopo il completamento dell'operazione
    setLoading(false);
  };

  // Funzione asincrona per rimuovere completamente un collaboratore dal documento
  // email: email del collaboratore da rimuovere
  const removeCollaboratorHandler = async (email: string) => {
    // Imposta loading a true per disabilitare i controlli durante l'operazione
    setLoading(true);

    // Chiama la server action per rimuovere il collaboratore dal documento
    await removeCollaborator({ roomId, email });

    // Reimposta loading a false dopo il completamento della rimozione
    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      {/* Container per avatar e informazioni del collaboratore (parte sinistra) */}
      <div className="flex gap-2">
        {/* Avatar del collaboratore */}
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />

        {/* Container per nome ed email del collaboratore */}
        <div>
          {/* Nome del collaboratore con indicatore di caricamento */}
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {/* line-clamp-1: tronca il testo a una riga con ellipsis se troppo lungo */}
            {collaborator.name}

            {/* Span che mostra "updating..." solo durante il caricamento */}
            <span className="text-10-regular pl-2 text-blue-100">
              {loading && "updating..."}
            </span>
          </p>

          {/* Email collaboratore  */}
          <p className="text-sm font-light text-blue-100">
            {collaborator.email}
          </p>
        </div>
      </div>

      {/* Rendering condizionale basato su se il collaboratore è il creatore del documento */}
      {creatorId === collaborator.id ? (
        // ...mostra semplicemente l'etichetta "Owner" (il creatore non può essere modificato/rimosso)
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        // ...altrimenti mostra i controlli per modificare permessi e rimuovere il collaboratore
        <div className="flex items-center">
          {/* Componente per selezionare/modificare il tipo di permesso */}
          <UserTypeSelector
            // Tipo di permesso corrente (cast esplicito al tipo UserType)
            userType={userType as UserType}
            // Funzione per aggiornare lo state locale (nota: || 'viewer' qui non ha effetto pratico)
            setUserType={setUserType || "viewer"}
            // Callback eseguito quando l'utente cambia il tipo di permesso
            // Chiama la funzione che aggiorna i permessi nel database
            onClickHandler={shareDocumentHandler}
          />

          {/* Pulsante per rimuovere il collaboratore dal documento */}
          <Button
            type="button"
            // Al click chiama la funzione di rimozione passando l'email del collaboratore
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

// Esporta il componente come default per poterlo importare in altri file
export default Collaborator;

// Riassunto della logica del componente:

// Visualizzazione collaboratore: mostra avatar, nome ed email di ogni collaboratore in una riga
// Gestione permessi:

// Se è il creatore → mostra solo "Owner" (non modificabile)
// Se è un collaboratore normale → mostra controlli per modificare permessi o rimuovere

// Due operazioni principali:

// Cambio permessi: usa UserTypeSelector che chiama shareDocumentHandler quando cambia
// Rimozione: pulsante "Remove" che chiama removeCollaboratorHandler

// Feedback utente:

// Mostra "updating..." durante le operazioni
// Disabilita i controlli durante il caricamento (tramite loading state)

// Utilizzo: viene renderizzato nel ShareModal per ogni collaboratore nella lista
// RiprovaClaude non ha ancora la capacità di eseguire il codice che genera.
