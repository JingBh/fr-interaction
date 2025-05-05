import { onMounted, onUnmounted } from 'vue'

export const useTransparentBackground = () => {
  onMounted(() => {
    document.body.classList.remove('bg-light')
    document.body.classList.add('bg-transparent')
  })

  onUnmounted(() => {
    document.body.classList.remove('bg-transparent')
    document.body.classList.add('bg-light')
  })
}
