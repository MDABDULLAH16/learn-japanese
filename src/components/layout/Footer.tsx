import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30 py-6 mt-auto">
      <div className="container px-4 md:px-8 mx-auto flex flex-col items-center justify-center text-center gap-2">
        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
          Developed with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by
        </p>
        <p className="text-base font-bold tracking-widest text-primary">
          A R S ABDULLAH
        </p>
      </div>
    </footer>
  )
}
