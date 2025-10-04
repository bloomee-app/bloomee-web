import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-md text-white border-white/20 w-80">
        <DialogHeader>
          <DialogTitle>About Bloome</DialogTitle>
          <DialogDescription>
            Next-generation, AI-assisted remote-sensing platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm space-y-2">
          <p>
            Bloome is a next-generation, AI-assisted remote-sensing platform that detects, visualizes, and
            predicts plant blooming events. It combines Landsat-9 time-series analysis with LLM-based interpretation to deliver actionable insights via interactive maps, time-series charts, and alerts.
          </p>
          <p>
            The platform addresses fragmented, inaccessible phenology data and enables faster, better decisions for agriculture, ecology, and public health.
          </p>
          <p className="text-xs text-blue-200">
            Powered by NASA Landsat & AI.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}