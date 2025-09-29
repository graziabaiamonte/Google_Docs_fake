"use client";

// Importa i provider di Liveblocks per la collaborazione in tempo reale
// ClientSideSuspense gestisce il loading, RoomProvider fornisce il contesto della room
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
// Importa il componente Editor per l'editing collaborativo del documento
import { Editor } from "@/components/editor/Editor";
// Importa il componente Header per la barra superiore
import Header from "@/components/Header";
// Importa i componenti di Clerk per gestione autenticazione e UI utente
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
// Importa il componente per mostrare i collaboratori attivi
import ActiveCollaborators from "./ActiveCollaborators";
// Importa gli hooks React necessari per stato e side effects
import { useEffect, useRef, useState } from "react";
// Importa il componente Input per l'editing del titolo
import { Input } from "./ui/input";
// Importa il componente Image di Next.js
import Image from "next/image";
// Importa la server action per aggiornare i documenti
import { updateDocument } from "@/lib/actions/room.actions";
// Importa il componente Loader per stati di caricamento
import Loader from "./Loader";
// Importa il modale per condividere documenti
import ShareModal from "./ShareModal";

// Componente principale che gestisce una room collaborativa
// Riceve roomId, metadati, lista utenti e tipo di accesso dell'utente corrente
const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType,
}: CollaborativeRoomProps) => {
  // State per il titolo del documento, inizializzato con il titolo dai metadati
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  // State per controllare se siamo in modalità editing del titolo
  const [editing, setEditing] = useState(false);
  // State per mostrare lo stato di caricamento durante il salvataggio
  const [loading, setLoading] = useState(false);

  // Ref per il container del titolo, usato per rilevare click esterni
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref per l'input del titolo, usato per gestire il focus automatico
  const inputRef = useRef<HTMLDivElement>(null);

  // Funzione per gestire l'aggiornamento del titolo quando si preme Enter
  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Controlla se il tasto premuto è Enter
    if (e.key === "Enter") {
      // Avvia lo stato di caricamento
      setLoading(true);

      try {
        // Aggiorna solo se il titolo è effettivamente cambiato
        if (documentTitle !== roomMetadata.title) {
          // Chiama la server action per salvare il nuovo titolo
          const updatedDocument = await updateDocument(roomId, documentTitle);

          // Se l'aggiornamento è riuscito, esce dalla modalità editing
          if (updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        // Log degli errori di aggiornamento
        console.error(error);
      }

      // Ferma lo stato di caricamento
      setLoading(false);
    }
  };

  // Effect per gestire i click esterni al container del titolo
  useEffect(() => {
    // Funzione che controlla se il click è avvenuto fuori dal container
    const handleClickOutside = (e: MouseEvent) => {
      // Se esiste il containerRef e il click è esterno ad esso
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Esce dalla modalità editing
        setEditing(false);
        // Salva automaticamente le modifiche
        updateDocument(roomId, documentTitle);
      }
    };

    // Aggiunge il listener per i click del mouse
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: rimuove il listener quando il componente si smonta o le dipendenze cambiano
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roomId, documentTitle]); // Dipendenze: si riesegue se roomId o documentTitle cambiano

  // Effect per gestire il focus automatico sull'input quando si entra in modalità editing
  useEffect(() => {
    // Se siamo in editing e l'inputRef esiste, mette il focus sull'input
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]); // Dipendenza: si riesegue quando editing cambia

  return (
    // RoomProvider fornisce il contesto Liveblocks per tutta l'applicazione figlia
    // Collega questo componente alla room specifica tramite roomId
    <RoomProvider id={roomId}>
      {/* ClientSideSuspense gestisce gli stati di loading mentre Liveblocks si connette */}
      {/* fallback mostra il Loader durante il caricamento iniziale */}
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            {/* Container del titolo con ref per rilevare click esterni */}
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {/* Rendering condizionale: mostra input se in editing e non in loading */}
              {editing && !loading ? (
                <Input
                  type="text"
                  // Valore controllato dallo state
                  value={documentTitle}
                  // Ref per gestire il focus
                  ref={inputRef}
                  placeholder="Enter title"
                  // Aggiorna lo state ad ogni cambiamento
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  // Gestisce il salvataggio su Enter
                  onKeyDown={updateTitleHandler}
                  // Disabilita l'input se non siamo in modalità editing
                  disable={!editing}
                  className="document-title-input"
                />
              ) : (
                // Se non in editing, mostra il titolo come testo normale
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}

              {/* Icona di edit: visibile solo se l'utente è editor e non in modalità editing */}
              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  // Click per entrare in modalità editing
                  onClick={() => setEditing(true)}
                  className="pointer" // Cursore pointer per indicare interattività
                />
              )}

              {/* Tag "View only" per utenti senza permessi di modifica */}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}

              {/* Indicatore di salvataggio durante il loading */}
              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>

            {/* Sezione destra dell'header con collaboratori e controlli utente */}
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              {/* Componente che mostra gli avatar dei collaboratori attivi */}
              <ActiveCollaborators />

              {/* Modale per condividere il documento con altri utenti */}
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />

              {/* Controlli di autenticazione Clerk */}
              {/* Se l'utente non è autenticato, mostra il pulsante di login */}
              <SignedOut>
                <SignInButton />
              </SignedOut>
              {/* Se l'utente è autenticato, mostra il pulsante del profilo utente */}
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>

          {/* Componente Editor principale per l'editing collaborativo */}
          {/* Riceve roomId per la sincronizzazione e currentUserType per i permessi */}
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

// Esporta il componente come default
export default CollaborativeRoom;

// Questo è il componente principale per l'editing collaborativo in tempo reale. Ecco i concetti chiave:
// Concetti principali:

// Client Component: Usa 'use client' perché gestisce interazioni utente e stato
// Liveblocks Integration: RoomProvider connette alla room, ClientSideSuspense gestisce loading
// Real-time collaboration: Sincronizza automaticamente modifiche tra utenti
// Permission-based UI: Mostra controlli diversi basati sui permessi utente

// Gestione del titolo:

// Modalità viewing: Titolo mostrato come testo + icona edit (solo per editor)
// Modalità editing: Input controllato con salvataggio su Enter o click esterno
// Auto-save: Salva automaticamente quando si esce dall'editing
// Loading state: Mostra "saving..." durante l'aggiornamento

// Hooks utilizzati:

// useState: Gestisce titolo, modalità editing, stato loading
// useRef: Riferimenti per container (click esterni) e input (focus)
// useEffect:

// Click-outside detection per uscire dall'editing
// Auto-focus sull'input quando si entra in editing

// Struttura UI:

// Header:

// Sinistra: Titolo editabile + indicatori stato
// Destra: Collaboratori attivi + modale condivisione + controlli utente

// Editor: Componente principale per editing del contenuto

// Pattern di sicurezza:

// currentUserType: Controlla permessi (editor vs viewer)
// Conditional rendering: Mostra/nasconde controlli basato su permessi
// View-only tag: Indica chiaramente utenti senza permessi di modifica

// Real-time features:

// RoomProvider: Sincronizzazione automatica tra tutti i client
// ActiveCollaborators: Presenza utenti in tempo reale
// Editor: Editing sincronizzato del contenuto

// Questo componente è il cuore dell'esperienza collaborativa, gestendo sia l'interfaccia che la sincronizzazione real-time.
