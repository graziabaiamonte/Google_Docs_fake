// Importa la funzione di utilità per concatenare classi CSS in modo condizionale
// cn è probabilmente una funzione che combina più classi CSS e rimuove quelle vuote/false
import { cn } from "@/lib/utils";

// Hook di Liveblocks che determina se un thread di commenti è attualmente attivo
// Restituisce true se l'utente sta interagendo con questo specifico thread
import { useIsThreadActive } from "@liveblocks/react-lexical";

// Componenti UI di Liveblocks per la gestione dei commenti
// Composer: componente per scrivere nuovi commenti
// Thread: componente che visualizza una conversazione/thread di commenti
import { Composer, Thread } from "@liveblocks/react-ui";

// Hook di Liveblocks che recupera tutti i thread di commenti
// La versione /suspense significa che usa React Suspense per il caricamento asincrono
import { useThreads } from "@liveblocks/react/suspense";

// Import di React (necessario per JSX)
import React from "react";

// Definizione del componente ThreadWrapper che wrappa ogni singolo thread
// Riceve come prop un oggetto thread di tipo ThreadWrapperProps
const ThreadWrapper = ({ thread }: ThreadWrapperProps) => {
  // Usa l'hook per controllare se questo specifico thread è attivo
  // isActive sarà true se l'utente sta correntemente interagendo con questo thread
  const isActive = useIsThreadActive(thread.id);

  return (
    // Componente Thread di Liveblocks che renderizza il thread di commenti
    <Thread
      // Passa l'oggetto thread come prop al componente
      thread={thread}
      // Attributo HTML data-state che indica lo stato del thread
      // Se attivo mostra 'active', altrimenti null (non viene renderizzato)
      data-state={isActive ? "active" : null}
      // Applica le classi CSS usando la funzione cn per concatenarle condizionalmente
      className={cn(
        "comment-thread border",
        // Se il thread è attivo, aggiunge bordo blu e ombra
        isActive && "!border-blue-500 shadow-md",
        // Se il thread è risolto, riduce l'opacità al 40%
        thread.resolved && "opacity-40"
      )}
    />
  );
};

// Componente principale Comments che gestisce l'interfaccia dei commenti
const Comments = () => {
  // Utilizza l'hook useThreads per ottenere tutti i thread di commenti
  // threads è un array contenente tutti i thread disponibili
  const { threads } = useThreads();

  return (
    // Container principale per tutti i commenti
    <div className="comments-container">
      {/* Composer è il componente per scrivere nuovi commenti
          Permette agli utenti di iniziare nuove conversazioni */}
      <Composer className="comment-composer" />

      {/* Mappa attraverso tutti i thread e crea un ThreadWrapper per ognuno
          key={thread.id} è necessario per React per tracciare ogni elemento della lista */}
      {threads.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  );
};

// Esporta il componente Comments come export di default
// Può essere importato in altri file con import Comments from './Comments'
export default Comments;

// Struttura generale:

// Il file definisce due componenti: ThreadWrapper e Comments
// Utilizza Liveblocks, una libreria per la collaborazione in tempo reale, specificamente per gestire commenti/annotazioni

// Flusso dei dati:

// Comments recupera tutti i thread usando useThreads()
// Per ogni thread, crea un ThreadWrapper
// ThreadWrapper controlla se il thread è attivo e applica gli stili appropriati
// Il Thread di Liveblocks renderizza effettivamente l'interfaccia del commento

// Funzionalità chiave:

// Stati visivi: I thread attivi hanno bordo blu e ombra, quelli risolti sono semi-trasparenti
// Composer: Permette di creare nuovi thread di commenti
// Reattività: Usa hooks per aggiornamenti in tempo reale dello stato dei thread

// Il tipo ThreadWrapperProps non è definito in questo file, probabilmente si trova in un file di tipi separato.
