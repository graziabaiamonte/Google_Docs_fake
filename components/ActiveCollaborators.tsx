// Importa l'hook useOthers da Liveblocks per ottenere informazioni sugli altri utenti connessi
// La versione '/suspense' indica che questo hook supporta il Suspense pattern di React
import { useOthers } from "@liveblocks/react/suspense";
// Importa il componente Image di Next.js per ottimizzazione delle immagini
import Image from "next/image";

// Componente che mostra gli avatar degli utenti attualmente collegati al documento
const ActiveCollaborators = () => {
  // useOthers() restituisce un array di tutti gli altri utenti connessi alla stessa room
  // Esclude automaticamente l'utente corrente dalla lista
  // Ogni elemento contiene informazioni come presenza, cursore, e dati utente
  const others = useOthers();

  // Estrae solo le informazioni utente (info) da ogni collaboratore
  // other.info contiene i dati personalizzati dell'utente come id, nome, avatar, colore
  // Questo mapping trasforma l'array da oggetti complessi di presenza a semplici oggetti info
  const collaborators = others.map((other) => other.info);

  return (
    // Lista avatar dei collaboratori
    <ul className="collaborators-list">
      {/* Mappa attraverso ogni collaboratore per creare un elemento lista */}
      {/* Destructuring di id, avatar, name e color dalle informazioni del collaboratore */}
      {collaborators.map(({ id, avatar, name, color }) => (
        <li key={id}>
          <Image
            // URL dell'immagine avatar del collaboratore
            src={avatar}
            // Testo alternativo per accessibilità, usa il nome del collaboratore
            alt={name}
            // Dimensioni dell'immagine in pixel
            // Nota: queste sono le dimensioni originali, il CSS le ridimensiona
            width={100}
            height={100}
            // Classi CSS per lo styling dell'avatar:
            // - inline-block: permette dimensionamento mantenendo il comportamento inline
            // - size-8: imposta larghezza e altezza a 2rem (32px) con Tailwind
            // - rounded-full: rende l'immagine circolare
            // - ring-2 ring-dark-100: aggiunge un anello sottile attorno all'immagine
            className="inline-block size-8 rounded-full ring-2 ring-dark-100"
            style={{ border: `3px solid ${color}` }}
          />
        </li>
      ))}
    </ul>
  );
};

// Esporta il componente come default per l'importazione
export default ActiveCollaborators;
