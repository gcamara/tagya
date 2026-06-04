import { useEffect, useState } from 'react'
import { ensureLib, isLibLoaded, onLibLoaded } from '../lib/icons/index.js'

// Garante o carregamento (lazy) dos dados da biblioteca e re-renderiza quando prontos.
export function useIconLib(libId) {
  const [ready, setReady] = useState(() => isLibLoaded(libId))
  useEffect(() => {
    let live = true
    setReady(isLibLoaded(libId))
    if (!isLibLoaded(libId)) ensureLib(libId)
    const off = onLibLoaded((id) => { if (id === libId && live) setReady(true) })
    return () => { live = false; off() }
  }, [libId])
  return ready
}
