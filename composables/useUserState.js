import { useStorage } from '@vueuse/core'

export default function useUserState() {
  const inputPreview = useStorage('inputPreview', true)
  const audioMeters = useStorage('audioMeters', true)
  // The slots' areas drawn on the scene previews
  const slotOverlay = useStorage('slotOverlay', false)

  return {
    inputPreview,
    audioMeters,
    slotOverlay,
  }
}
