import { useStorage } from '@vueuse/core'

export default function useUserState() {
  const inputPreview = useStorage('inputPreview', true)
  const mixerPreview = useStorage('mixerPreview', true)
  const audioMeters = useStorage('audioMeters', true)

  return {
    inputPreview,
    mixerPreview,
    audioMeters,
  }
}
