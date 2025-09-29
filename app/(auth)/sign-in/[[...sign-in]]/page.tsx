// Import del componente SignIn predefinito dalla libreria Clerk
// Questo componente include form completo, validazione, UI e logica di autenticazione
import { SignIn } from '@clerk/nextjs'

// Componente pagina per il login degli utenti
const SignInPage = () => {
  return (
    <main className="auth-page">
      {/* Componente Clerk SignIn che renderizza:
          - Form di login con email/username e password
          - Link "Forgot password?" per reset password
          - Opzioni di login sociale (Google, GitHub, etc.) se configurate
          - Link per passare alla registrazione
          - Gestione automatica degli errori e validazione
          - Styling consistente con il tema configurato nel ClerkProvider (dark theme + colore primario)
          - Redirect automatico dopo login successful alla pagina appropriata
          - Gestione stati di caricamento durante l'autenticazione
      */}
      <SignIn />
    </main>
  )
}

// Export default del componente per permettere l'import come route page
export default SignInPage