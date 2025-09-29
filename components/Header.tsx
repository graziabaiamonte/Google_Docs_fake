// Import della funzione utility per combinare classi CSS in modo condizionale
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

// Componente Header che accetta children e className come props
// className: classi CSS aggiuntive opzionali per customizzare lo stile
const Header = ({ children, className }: HeaderProps) => {
  return (
    // Container principale dell'header
    // cn() combina la classe base "header" con eventuali classi personalizzate passate tramite className
    <div className={cn("header", className)}>
      
      <Link href='/' className="md:flex-1">
        <Image 
          src="/assets/icons/logo.svg"
          alt="Logo with name"
          width={120}
          height={32}
          className="hidden md:block"
        />
        
        <Image 
          src="/assets/icons/logo-icon.svg"
          alt="Logo"
          width={32}
          height={32}
          className="mr-2 md:hidden"
        />
      </Link>
      
      {/* Rendering dei children passati al componente */}
      {/* Permette di inserire contenuto aggiuntivo nell'header (es: menu, pulsanti, etc.) */}
      {children}
    </div>
  )
}

export default Header