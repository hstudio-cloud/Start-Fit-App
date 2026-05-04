import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PwaInstallButton() {
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    function onBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallEvent(event)
    }

    function onInstalled() {
      setInstalled(true)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  if (installed) {
    return <span className="hidden rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 sm:inline-flex">Instalado</span>
  }

  if (!installEvent) return null

  return (
    <button type="button" onClick={handleInstall} className="btn-secondary px-3 py-2 text-xs">
      <Download size={14} />
      Instalar app
    </button>
  )
}
