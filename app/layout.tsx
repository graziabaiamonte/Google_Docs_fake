import { Inter as FontSans } from "next/font/google"

// Import della utility function per combinare classi CSS
import { cn } from "@/lib/utils"

import './globals.css'
// Import del tipo Metadata per la tipizzazione dei metadati SEO
import { Metadata } from "next"
// Import del provider Clerk per gestire l'autenticazione nell'intera app
import { ClerkProvider } from "@clerk/nextjs"
// Import del tema scuro predefinito di Clerk
import { dark } from "@clerk/themes"
// Import del provider personalizzato per context aggiuntivi (probabilmente Liveblocks)
import Provider from "./Provider"

// Configurazione del font Inter
const fontSans = FontSans({
  // Sottoinsiemi di caratteri da caricare (latin = caratteri occidentali di base)
  // Riduce le dimensioni del font caricando solo i caratteri necessari
  subsets: ["latin"],
  // Nome della variabile CSS personalizzata che conterrà questo font
  // Sarà disponibile come --font-sans nelle classi CSS
  variable: "--font-sans",
})


// Questi vengono iniettati nel <head> di ogni pagina
export const metadata: Metadata = {
  title: 'LiveDocs',
  description: 'Your go-to collaborative editor',
}

// Root Layout component - avvolge tutte le pagine dell'applicazione
// Viene eseguito una sola volta e definisce la struttura HTML di base
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ClerkProvider fornisce il contesto di autenticazione a tutta l'app
    <ClerkProvider
      // Configurazione dell'aspetto visivo di Clerk
      appearance={{
        // Applica il tema scuro predefinito
        baseTheme: dark,
        // Variabili CSS personalizzate per sovrascrivere il tema
        variables: { 
          // Colore primario per pulsanti, link, elementi attivi (blu)
          colorPrimary: "#3371FF" ,
          // Dimensione del font di base per tutti i componenti Clerk
          fontSize: '16px'
        },
      }}
    >

      {/* suppressHydrationWarning: evita warning per differenze minori tra server e client rendering */}
      <html lang="en" suppressHydrationWarning>
        <body
          // Combina più classi usando la utility cn()
          className={cn(
            // Classi di base Tailwind:
            // min-h-screen: altezza minima del viewport (100vh)
            // font-sans: usa il font sans-serif del sistema
            // antialiased: migliora la resa dei font per schermi ad alta densità
            "min-h-screen font-sans antialiased",
            // Applica la variabile CSS del font Inter configurato sopra
            // Questo rende Inter disponibile come font-sans in tutta l'app
            fontSans.variable
          )}
        >
          {/* Provider personalizzato che probabilmente wrappa Liveblocks e altri context */}
          {/* Fornisce funzionalità collaborative e di stato globale */}
          <Provider>
            {/* Rendering di tutte le pagine dell'applicazione */}
            {/* children rappresenta il contenuto dinamico di ogni pagina/route */}
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  )
}