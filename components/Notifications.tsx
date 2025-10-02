// Direttiva che indica a Next.js che questo è un Client Component (eseguito nel browser)
// Necessaria perché il componente usa hooks di Liveblocks e interazioni utente
"use client";

// Import dei componenti Popover da shadcn/ui per creare il menu a comparsa delle notifiche
// Popover: contenitore principale del popover
// PopoverContent: contenuto che appare quando si clicca il trigger
// PopoverTrigger: elemento cliccabile che apre/chiude il popover
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import dei componenti UI di Liveblocks per gestire le notifiche
// InboxNotification: componente per visualizzare una singola notifica
// InboxNotificationList: contenitore per la lista di notifiche
// LiveblocksUIConfig: componente per configurare/personalizzare l'UI di Liveblocks
import {
  InboxNotification,
  InboxNotificationList,
  LiveblocksUIConfig,
} from "@liveblocks/react-ui";

// Import degli hooks di Liveblocks per accedere ai dati delle notifiche
// useInboxNotifications: recupera tutte le notifiche dell'inbox
// useUnreadInboxNotificationsCount: recupera il conteggio delle notifiche non lette
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";

// Import del componente Image di Next.js per l'ottimizzazione delle immagini
import Image from "next/image";

// Import del tipo ReactNode per la tipizzazione TypeScript
// ReactNode rappresenta qualsiasi cosa che React può renderizzare
import { ReactNode } from "react";

// Definizione del componente Notifications (nessuna prop richiesta)
const Notifications = () => {
  // Hook che recupera tutte le notifiche dell'inbox dell'utente
  // inboxNotifications è un array di oggetti notifica
  const { inboxNotifications } = useInboxNotifications();

  // Hook che recupera il numero totale di notifiche non lette
  // count è un numero che rappresenta quante notifiche non sono state ancora lette
  const { count } = useUnreadInboxNotificationsCount();

  // Filtra le notifiche per ottenere solo quelle non ancora lette
  // notification.readAt è una data quando la notifica è stata letta, o null/undefined se non letta

  // !notification.readAt è true se la notifica NON è stata letta
  const unreadNotifications = inboxNotifications.filter(
    (notification) => !notification.readAt
  );

  // Inizio del JSX restituito dal componente
  return (
    // Popover principale che contiene l'icona e il menu delle notifiche
    <Popover>
      {/* Trigger che apre il popover quando cliccato */}
      {/* relative: posizionamento relativo per permettere il posizionamento assoluto del badge */}
      {/* flex size-10: contenitore flex di dimensione 10x10 (40x40px) */}
      {/* items-center justify-center: centra l'icona verticalmente e orizzontalmente */}
      {/* rounded-lg: bordi arrotondati */}
      <PopoverTrigger className="relative flex size-10 items-center justify-center rounded-lg">
        {/* Icona della campanella per le notifiche */}
        <Image
          src="/assets/icons/bell.svg"
          alt="inbox"
          width={24}
          height={24}
        />

        {/* Badge circolare rosso che appare solo se ci sono notifiche non lette */}
        {/* Rendering condizionale: mostra il badge solo se count > 0 */}
        {count > 0 && (
          <div className="absolute right-2 top-2 z-20 size-2 rounded-full bg-blue-500" />
        )}
      </PopoverTrigger>

      {/* Contenuto del popover che appare quando si clicca la campanella */}
      {/* align="end": allinea il popover al lato destro del trigger */}
      {/* shad-popover: classe di stile personalizzata */}
      <PopoverContent align="end" className="shad-popover">
        {/* Componente di configurazione UI di Liveblocks per personalizzare i messaggi */}
        <LiveblocksUIConfig
          // overrides: oggetto per sovrascrivere i testi predefiniti di Liveblocks
          overrides={{
            // Personalizza il testo mostrato quando qualcuno menziona l'utente
            // user: ReactNode rappresenta il nome/avatar dell'utente che ha fatto la menzione
            INBOX_NOTIFICATION_TEXT_MENTION: (user: ReactNode) => (
              // Fragment per restituire JSX"
              <>{user} mentioned you.</>
            ),
          }}
        >
          {/* Lista delle notifiche fornita da Liveblocks */}
          <InboxNotificationList>
            {/* Rendering condizionale: se non ci sono notifiche non lette, mostra un messaggio */}
            {unreadNotifications.length <= 0 && (
              // Paragrafo centrato che informa l'utente che non ci sono nuove notifiche
              <p className="py-2 text-center text-dark-500">
                No new notifications
              </p>
            )}

            {/* Rendering condizionale: se ci sono notifiche non lette, le mappa e le visualizza */}
            {unreadNotifications.length > 0 &&
              unreadNotifications.map((notification) => (
                // Componente per visualizzare una singola notifica
                <InboxNotification
                  // Key univoca per React (ottimizzazione rendering)
                  key={notification.id}
                  // Oggetto notifica da visualizzare
                  inboxNotification={notification}
                  // Stili personalizzati: sfondo scuro e testo bianco
                  className="bg-dark-200 text-white"
                  href={`/documents/${notification.roomId}`}
                  // Nasconde i pulsanti di azione predefiniti di Liveblocks (es. mark as read)
                  showActions={false}
                  // kinds: personalizza come vengono visualizzati diversi tipi di notifiche
                  kinds={{
                    // Personalizzazione per notifiche di tipo "thread" (discussioni/commenti)
                    thread: (props) => (
                      // Componente Thread di InboxNotification con props personalizzate
                      <InboxNotification.Thread
                        {...props}
                        // Nasconde i pulsanti di azione per questo tipo
                        showActions={false}
                        // Nasconde il nome della room/documento
                        showRoomName={false}
                      />
                    ),
                    // Personalizzazione per notifiche di tipo "textMention" (quando sei menzionato)
                    textMention: (props) => (
                      // Componente TextMention di InboxNotification
                      <InboxNotification.TextMention
                        {...props}
                        // Nasconde il nome della room/documento
                        showRoomName={false}
                      />
                    ),
                    // Personalizzazione per notifiche custom di tipo "$documentAccess" (accesso ai documenti)
                    // Il prefisso $ indica un tipo di notifica personalizzato dell'applicazione
                    $documentAccess: (props) => (
                      // Componente Custom per notifiche personalizzate
                      <InboxNotification.Custom
                        {...props}
                        // Titolo estratto dai dati della prima attività nella notifica
                        title={props.inboxNotification.activities[0].data.title}
                        // contenuto laterale
                        aside={
                          // Componente Icon per contenere l'avatar
                          <InboxNotification.Icon className="bg-transparent">
                            {/* Avatar dell'utente che ha generato la notifica */}
                            <Image
                              // URL dell'avatar estratto dai dati, con fallback a stringa vuota
                              src={
                                (props.inboxNotification.activities[0].data
                                  .avatar as string) || ""
                              }
                              width={36}
                              height={36}
                              alt="avatar"
                              className="rounded-full"
                            />
                          </InboxNotification.Icon>
                        }
                      >
                        {/* Contenuto principale della notifica (testo/messaggio) */}
                        {props.children}
                      </InboxNotification.Custom>
                    ),
                  }}
                />
              ))}
          </InboxNotificationList>
        </LiveblocksUIConfig>
      </PopoverContent>
    </Popover>
  );
};

// Esporta il componente come default per poterlo importare in altri file
export default Notifications;

// Riassunto della logica del componente:

// Sistema di notifiche: integrato con Liveblocks per gestire notifiche in tempo reale
// Badge visivo: mostra un punto blu quando ci sono notifiche non lette
// Popover al click: apre un menu a comparsa con tutte le notifiche non lette
// Tre tipi di notifiche personalizzate:

// Thread: discussioni/commenti sui documenti
// Text Mention: quando qualcuno menziona l'utente
// Document Access: notifiche personalizzate per accesso/condivisione documenti

// Navigazione: cliccando una notifica si viene portati al documento correlato
// Stato vuoto: mostra "No new notifications" quando non ci sono notifiche
// Personalizzazione UI: override dei testi predefiniti di Liveblocks per adattarli all'app
// Design: stile scuro coerente con il resto dell'applicazione
