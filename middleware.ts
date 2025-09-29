// Import del middleware di autenticazione fornito da Clerk
// clerkMiddleware è una funzione che crea un middleware Next.js per gestire l'autenticazione
import { clerkMiddleware } from "@clerk/nextjs/server";

// Export del middleware configurato come default export
// clerkMiddleware() crea e restituisce una funzione middleware che:
// 1. Intercetta tutte le richieste HTTP in arrivo
// 2. Verifica lo stato di autenticazione dell'utente
// 3. Inietta informazioni di sessione nel contesto della richiesta
// 4. Gestisce automaticamente token JWT, cookies di sessione, e refresh dei token
// 5. Rende disponibili le informazioni utente ai Server Components e API routes
export default clerkMiddleware();

// Configurazione che specifica su quali route il middleware deve essere eseguito
export const config = {
  // Array di pattern che definiscono quali percorsi devono passare attraverso il middleware
  matcher: [
    // Pattern 1: "/((?!.*\\..*|_next).*)"
    // Regex complessa che matcha tutte le route ECCETTO:
    // - File statici con estensioni (.*\\..* = qualsiasi cosa con un punto, es: .js, .css, .png)
    // - Cartella _next (file interni di Next.js per build e ottimizzazioni)
    // Questo significa che il middleware si applica a tutte le pagine dell'app ma non ai file statici
    "/((?!.*\\..*|_next).*)",
    
    // Pattern 2: "/"
    // Matcha esplicitamente la homepage
    // Necessario perché potrebbe non essere catturato dal pattern precedente in alcuni edge cases
    "/",
    
    // Pattern 3: "/(api|trpc)(.*)"
    // Matcha tutte le route che iniziano con /api o /trpc
    // (.*) cattura qualsiasi cosa dopo /api o /trpc
    // Questo assicura che anche le API routes abbiano accesso alle informazioni di autenticazione
    // Utile per proteggere endpoint API e per accedere ai dati utente nelle server actions
    "/(api|trpc)(.*)"
  ],
};

// Questo middleware è essenziale per il funzionamento del sistema di autenticazione e permette a tutti i componenti dell'app di accedere facilmente alle informazioni utente.