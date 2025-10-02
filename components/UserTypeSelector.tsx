// Import dei componenti Select da shadcn/ui per creare un menu a tendina
// Select: contenitore principale del componente select
// SelectContent: contenitore del menu dropdown che appare quando si clicca
// SelectItem: singola opzione selezionabile nel menu
// SelectTrigger: elemento cliccabile che apre/chiude il menu
// SelectValue: mostra il valore attualmente selezionato
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definizione del componente UserTypeSelector che riceve props tipizzate con UserTypeSelectorParams
// userType: valore corrente del tipo utente ('viewer' o 'editor')
// setUserType: funzione per aggiornare il tipo utente nello state del componente genitore
// onClickHandler: funzione opzionale da eseguire quando il tipo utente cambia (può essere undefined)
const UserTypeSelector = ({
  userType,
  setUserType,
  onClickHandler,
}: UserTypeSelectorParams) => {
  // Funzione che gestisce il cambio di tipo di accesso dell'utente
  // Viene chiamata quando l'utente seleziona una nuova opzione dal menu
  const accessChangeHandler = (type: UserType) => {
    // Aggiorna lo state del tipo utente nel componente genitore
    setUserType(type);

    // Se esiste una funzione onClickHandler opzionale, la esegue passando il nuovo tipo
    // L'operatore && assicura che la funzione venga chiamata solo se esiste (non è undefined)
    // Questo permette di eseguire logica aggiuntiva quando il tipo cambia
    onClickHandler && onClickHandler(type);
  };

  // Inizio del JSX restituito dal componente
  return (
    // Componente Select principale controllato
    // value: valore attualmente selezionato (controllato dallo state del genitore)
    // onValueChange: callback chiamato quando l'utente seleziona un nuovo valore
    // (type: UserType) => accessChangeHandler(type) è una funzione arrow che passa il nuovo tipo selezionato
    <Select
      value={userType}
      onValueChange={(type: UserType) => accessChangeHandler(type)}
    >
      {/* Elemento trigger che l'utente clicca per aprire il menu */}
      {/* Mostra il valore corrente e l'icona freccia */}
      <SelectTrigger className="shad-select">
        {/* Mostra automaticamente il valore selezionato (il testo della SelectItem corrispondente) */}
        <SelectValue />
      </SelectTrigger>

      {/* Contenuto del menu dropdown che appare quando si clicca il trigger */}
      {/* border-none rimuove il bordo, bg-dark-200 imposta lo sfondo scuro */}
      <SelectContent className="border-none bg-dark-200">
        {/* Prima opzione: permesso di sola visualizzazione */}
        {/* value="viewer": quando selezionato, userType diventa 'viewer' */}
        {/* shad-select-item: classe di stile personalizzata per le opzioni */}
        <SelectItem value="viewer" className="shad-select-item">
          can view
        </SelectItem>

        {/* Seconda opzione: permesso di modifica */}
        {/* value="editor": quando selezionato, userType diventa 'editor' */}
        <SelectItem value="editor" className="shad-select-item">
          can edit
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

// Esporta il componente come default per poterlo importare in altri file
export default UserTypeSelector;

// Riassunto della logica del componente:

// Componente controllato: il valore è gestito dallo state del componente genitore tramite userType e setUserType
// Due livelli di permessi:

// viewer → "can view" (solo visualizzazione)
// editor → "can edit" (può modificare)

// Gestione del cambio: quando l'utente seleziona un'opzione:

// Aggiorna lo state nel componente genitore
// Opzionalmente esegue una funzione callback aggiuntiva (onClickHandler)

// Utilizzo: nel ShareModal viene usato per permettere all'utente di scegliere che tipo di permesso dare a un nuovo collaboratore
// UI: menu a tendina pulito con stile personalizzato (dark theme)
