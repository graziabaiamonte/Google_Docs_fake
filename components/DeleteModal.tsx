// Direttiva che indica a Next.js che questo è un Client Component (eseguito nel browser)
// Necessaria perché il componente usa hooks React (useState) e interazioni utente
"use client";

// Import del componente Image di Next.js per l'ottimizzazione delle immagini
import Image from "next/image";

// Import di useState hook per gestire lo stato locale del componente
import { useState } from "react";

// Import della server action per eliminare un documento dal database
import { deleteDocument } from "@/lib/actions/room.actions";

// Import dei componenti Dialog da shadcn/ui per creare il modale di conferma
// Dialog: contenitore principale del modale
// DialogClose: pulsante per chiudere il modale senza azioni
// DialogContent: contenuto interno del modale
// DialogDescription: descrizione/messaggio di avviso
// DialogFooter: sezione footer con i pulsanti di azione
// DialogHeader: sezione header del modale
// DialogTitle: titolo del modale
// DialogTrigger: elemento che apre il modale quando cliccato
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import del componente Button personalizzato
import { Button } from "./ui/button";

// Export named del componente DeleteModal che riceve props tipizzate con DeleteModalProps
// roomId: ID univoco della room/documento da eliminare
export const DeleteModal = ({ roomId }: DeleteModalProps) => {
  // State per controllare se il modale è aperto (true) o chiuso (false)
  const [open, setOpen] = useState(false);

  // State per tracciare lo stato di caricamento durante l'eliminazione
  // Usato per disabilitare il pulsante e mostrare feedback "Deleting..."
  const [loading, setLoading] = useState(false);

  // Funzione asincrona che gestisce l'eliminazione del documento
  const deleteDocumentHandler = async () => {
    // Imposta loading a true per disabilitare il pulsante ed evitare click multipli
    setLoading(true);

    // Blocco try-catch per gestire eventuali errori durante l'eliminazione
    try {
      // Chiama la server action per eliminare il documento dal database
      // Passa il roomId come parametro per identificare quale documento eliminare
      await deleteDocument(roomId);

      // Se l'eliminazione ha successo, chiude il modale
      setOpen(false);
    } catch (error) {
      // Se si verifica un errore, lo registra nella console per debug
      // "Error notif:" è un prefisso per identificare questo tipo di errore nei log
      console.log("Error notif:", error);
    }

    // Reimposta loading a false dopo il completamento dell'operazione
    // Questo avviene sia in caso di successo che di errore
    setLoading(false);
  };

  // Inizio del JSX restituito dal componente
  return (
    // Dialog principale controllato dallo state 'open'
    // onOpenChange viene chiamato automaticamente quando il modale si apre/chiude
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Elemento trigger che apre il modale quando cliccato */}
      {/* asChild: passa le props al child invece di wrapparlo in un button predefinito */}
      <DialogTrigger asChild>
        {/* Pulsante per aprire il modale di eliminazione */}
        {/* min-w-9: larghezza minima, rounded-xl: bordi arrotondati */}
        {/* bg-transparent: sfondo trasparente, p-2: padding */}
        {/* transition-all: animazione fluida su tutti i cambiamenti CSS */}
        <Button className="min-w-9 rounded-xl bg-transparent p-2 transition-all">
          {/* Icona del cestino */}
          <Image
            src="/assets/icons/delete.svg"
            alt="delete"
            width={20}
            height={20}
            // mt-1: margine superiore per allineamento verticale
            className="mt-1"
          />
        </Button>
      </DialogTrigger>

      {/* Contenuto del modale con classe di stile personalizzata */}
      <DialogContent className="shad-dialog">
        {/* Header del modale contenente icona, titolo e descrizione */}
        <DialogHeader>
          {/* Icona grande del modale (diversa dall'icona del pulsante) */}
          <Image
            src="/assets/icons/delete-modal.svg"
            alt="delete"
            width={48}
            height={48}
            // mb-4: margine inferiore per spaziare dall'elemento successivo
            className="mb-4"
          />

          {/* Titolo del modale */}
          <DialogTitle>Delete document</DialogTitle>

          {/* Messaggio di avviso che spiega le conseguenze dell'azione */}
          {/* Informa l'utente che l'eliminazione è permanente e irreversibile */}
          <DialogDescription>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {/* Footer del modale contenente i pulsanti di azione */}
        {/* mt-5: margine superiore per separare dal contenuto sopra */}
        <DialogFooter className="mt-5">
          {/* Pulsante per annullare e chiudere il modale senza eliminare */}
          {/* DialogClose chiude automaticamente il modale quando cliccato */}
          {/* asChild: usa il contenuto come trigger invece di un wrapper */}
          {/* w-full: larghezza 100%, bg-dark-400: sfondo scuro, text-white: testo bianco */}
          <DialogClose asChild className="w-full bg-dark-400 text-white">
            Cancel
          </DialogClose>

          {/* Pulsante per confermare ed eseguire l'eliminazione */}
          <Button
            // variant="destructive": stile per azioni distruttive/pericolose (solitamente rosso)
            variant="destructive"
            // Al click esegue la funzione che elimina il documento
            onClick={deleteDocumentHandler}
            // gradient-red: gradiente rosso personalizzato, w-full: larghezza 100%
            className="gradient-red w-full"
          >
            {/* Testo condizionale del pulsante */}
            {/* Se loading è true mostra "Deleting...", altrimenti "Delete" */}
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Riassunto della logica del componente:

// Modale di conferma: chiede conferma prima di eliminare un documento (pattern UX importante per azioni distruttive)
// Due pulsanti:

// Cancel: chiude il modale senza fare nulla
// Delete: esegue l'eliminazione effettiva del documento

// Gestione errori: usa try-catch per catturare e loggare eventuali errori durante l'eliminazione
// Feedback utente:

// Mostra "Deleting..." durante l'operazione
// Disabilita implicitamente il pulsante durante il caricamento

// Messaggio chiaro: avvisa esplicitamente che l'azione è irreversibile ("cannot be undone")
// Chiusura automatica: il modale si chiude automaticamente dopo un'eliminazione riuscita
// Export named: usa export const invece di export default (pattern alternativo per l'export)
