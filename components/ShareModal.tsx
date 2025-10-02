// Direttiva che indica a Next.js che questo è un Client Component (eseguito nel browser)
// Necessaria perché il componente usa hooks React e interazioni utente
"use client";

// Dialog: contenitore principale del modale
// DialogContent: contenuto interno del modale
// DialogDescription: descrizione testuale del modale
// DialogHeader: sezione header del modale
// DialogTitle: titolo del modale
// DialogTrigger: elemento che apre il modale quando cliccato
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Hook di Liveblocks per ottenere informazioni sull'utente corrente
// useSelf restituisce i dati dell'utente attualmente connesso alla sessione Liveblocks
import { useSelf } from "@liveblocks/react/suspense";

// Import di React e useState hook per gestire lo stato locale del componente
import React, { useState } from "react";

// Import del componente Button personalizzato
import { Button } from "./ui/button";

// Import del componente Image di Next.js per l'ottimizzazione delle immagini
import Image from "next/image";

// Import del componente Label per etichette di form accessibili
import { Label } from "./ui/label";

// Import del componente Input per campi di input personalizzati
import { Input } from "./ui/input";

// Import del componente per selezionare il tipo di utente (viewer/editor)
import UserTypeSelector from "./UserTypeSelector";

// Import del componente per visualizzare ogni collaboratore nella lista
import Collaborator from "./Collaborator";

// Import della funzione server action per aggiornare i permessi di accesso al documento
import { updateDocumentAccess } from "@/lib/actions/room.actions";

// Definizione del componente ShareModal che riceve props tipizzate con ShareDocumentDialogProps
// roomId: ID univoco della room/documento
// collaborators: array degli utenti che già hanno accesso
// creatorId: ID del creatore del documento
// currentUserType: tipo di permesso dell'utente corrente ('viewer' o 'editor')
const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  // Ottiene le informazioni dell'utente corrente dalla sessione Liveblocks
  const user = useSelf();

  // State per controllare se il modale è aperto (true) o chiuso (false)
  const [open, setOpen] = useState(false);

  // State per mostrare lo stato di caricamento durante l'invio dell'invito
  const [loading, setLoading] = useState(false);

  // State per memorizzare l'email inserita dall'utente
  const [email, setEmail] = useState("");

  // State per memorizzare il tipo di permesso selezionato (default: 'viewer')
  // UserType è un tipo TypeScript che può essere 'viewer' o 'editor'
  const [userType, setUserType] = useState<UserType>("viewer");

  // Funzione asincrona per gestire la condivisione del documento
  const shareDocumentHandler = async () => {
    // Imposta loading a true per disabilitare il pulsante e mostrare feedback visivo
    setLoading(true);

    // Chiama la server action per aggiornare i permessi di accesso al documento
    await updateDocumentAccess({
      // ID della room da condividere
      roomId,
      // Email dell'utente da invitare
      email,
      // Tipo di permesso da assegnare (cast esplicito al tipo UserType)
      userType: userType as UserType,
      // Informazioni sull'utente che sta effettuando la condivisione
      updatedBy: user.info,
    });

    // Reimposta loading a false dopo il completamento dell'operazione
    setLoading(false);
  };

  // Inizio del JSX restituito dal componente
  return (
    // Dialog principale controllato dallo state 'open'
    // onOpenChange viene chiamato quando il modale si apre/chiude
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Elemento trigger che apre il modale quando cliccato */}
      <DialogTrigger>
        {/* Pulsante condividi con stile gradient blu */}
        {/* disabled se l'utente corrente non è un editor (solo gli editor possono condividere) */}
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          {/* Icona di condivisione ottimizzata con Next.js Image */}
          <Image
            src="/assets/icons/share.svg"
            alt="share"
            width={20}
            height={20}
            // Classi per dimensioni responsive (minimo 4, medio/grande 5)
            className="min-w-4 md:size-5"
          />
          {/* Testo "Share" nascosto su schermi piccoli (hidden su sm, visibile su sm e oltre) */}
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>

      {/* Contenuto del modale con classe di stile personalizzata */}
      <DialogContent className="shad-dialog">
        {/* Header del modale contenente titolo e descrizione */}
        <DialogHeader>
          {/* Titolo principale del modale */}
          <DialogTitle>Manage who can view this project</DialogTitle>
          {/* Descrizione che spiega la funzionalità */}
          <DialogDescription>
            Select which users can view and edit this document
          </DialogDescription>
        </DialogHeader>

        {/* Label per il campo email con margine superiore e colore blu chiaro */}
        <Label htmlFor="email" className="mt-6 text-blue-100">
          Email address
        </Label>

        {/* Container flex per input email, selettore tipo utente e pulsante invita */}
        <div className="flex items-center gap-3">
          {/* Container flex che occupa tutto lo spazio disponibile (flex-1) */}
          <div className="flex flex-1 rounded-md bg-dark-400">
            {/* Campo input per inserire l'email dell'utente da invitare */}
            <Input
              // ID collegato alla label sopra per accessibilità
              id="email"
              placeholder="Enter email address"
              // Value controllato dallo state
              value={email}
              // Aggiorna lo state quando l'utente digita
              onChange={(e) => setEmail(e.target.value)}
              className="share-input"
            />
            {/* Componente per selezionare il tipo di permesso (viewer/editor) */}
            <UserTypeSelector
              // Passa il tipo utente corrente
              userType={userType}
              // Funzione per aggiornare il tipo utente selezionato
              setUserType={setUserType}
            />
          </div>

          {/* Pulsante per inviare l'invito */}
          <Button
            type="submit"
            // Al click chiama la funzione per condividere il documento
            onClick={shareDocumentHandler}
            className="gradient-blue flex h-full gap-1 px-5"
            // Disabilitato durante il caricamento per evitare invii multipli
            disabled={loading}
          >
            {/* Testo condizionale: mostra "Sending..." durante il caricamento, altrimenti "Invite" */}
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>

        {/* Sezione che mostra la lista dei collaboratori attuali */}
        <div className="my-2 space-y-2">
          {/* Lista non ordinata per contenere i collaboratori */}
          <ul className="flex flex-col">
            {/* Itera sull'array collaborators e crea un componente Collaborator per ciascuno */}
            {collaborators.map((collaborator) => (
              // Componente che visualizza un singolo collaboratore con opzioni di gestione
              <Collaborator
                key={collaborator.id}
                roomId={roomId}
                creatorId={creatorId}
                // Email del collaboratore
                email={collaborator.email}
                // Oggetto collaboratore completo
                collaborator={collaborator}
                // Informazioni sull'utente corrente
                user={user.info}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Esporta il componente come default per poterlo importare in altri file
export default ShareModal;
