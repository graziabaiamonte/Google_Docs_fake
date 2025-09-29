// Direttiva che specifica che questo componente deve essere eseguito solo nel browser (client-side)
// Necessaria in Next.js 13+ quando il componente utilizza hook di React o funzionalità del browser
'use client';


import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
// Plugin che imposta automaticamente il focus sull'editor quando viene caricato
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
// Componente principale che avvolge l'intero editor Lexical
import { LexicalComposer } from '@lexical/react/LexicalComposer';
// Plugin che fornisce le funzionalità di rich text (grassetto, corsivo, etc.)
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// Plugin che gestisce la cronologia (undo/redo)
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
// Componente per gestire gli errori dell'editor
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React from 'react';

// Import dei componenti Liveblocks per la collaborazione in tempo reale
// FloatingComposer: per comporre commenti fluttuanti
// FloatingThreads: per visualizzare thread di discussione
// liveblocksConfig: configurazione per Liveblocks
// LiveblocksPlugin: plugin principale per l'integrazione
// useEditorStatus: hook per monitorare lo stato dell'editor
import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus } from '@liveblocks/react-lexical'

import Loader from '../Loader';

// Plugin per la toolbar fluttuante che appare quando si seleziona del testo
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin'
// Hook per gestire i thread di commenti
import { useThreads } from '@liveblocks/react/suspense';

import Comments from '../Comments';
// Componente modale per confermare l'eliminazione
import { DeleteModal } from '../DeleteModal';

// Commento esplicativo per la gestione degli errori di Lexical
// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

// Componente funzionale che mostra il placeholder quando l'editor è vuoto
function Placeholder() {
  // Restituisce un div con classe CSS e testo segnaposto
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

// Componente principale dell'editor che riceve roomId e tipo utente come props
// roomId: identificativo della stanza di collaborazione
// currentUserType: tipo di utente ('editor' o 'viewer')
export function Editor({ roomId, currentUserType }: { roomId: string, currentUserType: UserType }) {
  // Hook che restituisce lo stato di caricamento dell'editor Liveblocks
  const status = useEditorStatus();
  // Hook che restituisce tutti i thread di commenti della stanza
  const { threads } = useThreads();

  // Configurazione iniziale dell'editor Lexical con integrazione Liveblocks
  const initialConfig = liveblocksConfig({
    // Namespace per identificare univocamente questo editor
    namespace: 'Editor',
    // Array di nodi personalizzati supportati (in questo caso HeadingNode per i titoli)
    nodes: [HeadingNode],
    // Funzione di callback per gestire gli errori
    onError: (error: Error) => {
      // Log dell'errore nella console
      console.error(error);
      // Rilancia l'errore per interrompere l'esecuzione
      throw error;
    },
    // Tema personalizzato per lo styling
    theme: Theme,
    // L'editor è modificabile solo se l'utente è di tipo 'editor'
    editable: currentUserType === 'editor',
  });

  // Rendering del componente
  return (
    // Wrapper principale dell'editor Lexical con la configurazione iniziale
    <LexicalComposer initialConfig={initialConfig}>
      {/* Container principale dell'editor con classe per dimensioni complete */}
      <div className="editor-container size-full">
        {/* Wrapper della toolbar con layout flex per posizionamento */}
        <div className="toolbar-wrapper flex min-w-full justify-between">
          {/* Plugin della toolbar principale sempre visibile */}
          <ToolbarPlugin />
          {/* Modale di eliminazione visibile solo per gli editor */}
          {currentUserType === 'editor' && <DeleteModal roomId={roomId} />}
        </div>

        {/* Wrapper dell'area di editing con layout centrato */}
        <div className="editor-wrapper flex flex-col items-center justify-start">
          {/* Rendering condizionale basato sullo stato di caricamento */}
          {status === 'not-loaded' || status === 'loading' ? <Loader /> : (
            // Container interno dell'editor con dimensioni e styling specifici
            <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
              {/* Plugin principale per il rich text */}
              <RichTextPlugin
                // Area di contenuto editabile
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                // Componente placeholder mostrato quando l'editor è vuoto
                placeholder={<Placeholder />}
                // Boundary per catturare errori durante il rendering
                ErrorBoundary={LexicalErrorBoundary}
              />
              {/* Toolbar fluttuante visibile solo per gli editor */}
              {currentUserType === 'editor' && <FloatingToolbarPlugin />}
              {/* Plugin per gestire cronologia (undo/redo) */}
              <HistoryPlugin />
              {/* Plugin per impostare automaticamente il focus */}
              <AutoFocusPlugin />
            </div>
          )}

          {/* Plugin Liveblocks per funzionalità collaborative */}
          <LiveblocksPlugin>
            {/* Compositore fluttuante per nuovi commenti con larghezza fissa */}
            <FloatingComposer className="w-[350px]" />
            {/* Visualizzazione dei thread di commenti esistenti */}
            <FloatingThreads threads={threads} />
            {/* Componente per gestire e visualizzare tutti i commenti */}
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}