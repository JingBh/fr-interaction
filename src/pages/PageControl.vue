<script setup lang="ts">
import { useStore } from '../store.ts'

const store = useStore()

const handleToggleActiveQuestion = (id: string) => {
  if (store.activeQuestion?.id === id) {
    store.setActiveQuestion(null)
  } else {
    store.setActiveQuestion(id)
  }
}

const handleStop = () => {
  store.setActiveQuestion(null)
}

const handleClear = () => {
  if (confirm('确定要清除数据吗？')) {
    store.clearData()
  }
}
</script>

<template>
  <div class="pb-inset pl-inset pr-inset">
    <main class="flex flex-col items-stretch gap-4 p-4">
      <button
        v-for="question of store.questions"
        :key="question.id"
        type="button"
        class="flex items-center gap-3 rounded-xl px-5 py-4 bg-white select-none"
        @click="handleToggleActiveQuestion(question.id)"
      >
        <span class="flex-1 flex flex-col items-stretch gap-2">
          <span class="block text-start text-sm text-gray-500 font-bold">
            问题 #{{ question.id }}
          </span>
          <span
            class="block text-start text-dark"
            v-text="question.title"
          />
        </span>
        <svg
          v-if="store.activeQuestion?.id === question.id"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="21"
          viewBox="0 0 20 21"
          class="w-4 h-4 flex-shrink-0 rounded-full fill-none"
        >
          <rect
            x="1"
            y="1.5"
            width="18"
            height="18"
            rx="9"
            class="fill-primary"
          />
          <rect
            x="1"
            y="1.5"
            width="18"
            height="18"
            rx="9"
            stroke-width="2"
            class="stroke-2 stroke-primary"
          />
          <path
            d="M18 10.5C18 14.9183 14.4183 18.5 10 18.5C5.58172 18.5 2 14.9183 2 10.5C2 6.08172 5.58172 2.5 10 2.5C14.4183 2.5 18 6.08172 18 10.5ZM14.0303 7.46967C13.7374 7.17678 13.2626 7.17678 12.9697 7.46967C12.9626 7.47674 12.9559 7.48424 12.9498 7.4921L9.4774 11.9167L7.38388 9.82322C7.09098 9.53033 6.61611 9.53033 6.32322 9.82322C6.03032 10.1161 6.03032 10.591 6.32322 10.8839L8.96966 13.5303C9.26256 13.8232 9.73743 13.8232 10.0303 13.5303C10.0368 13.5238 10.043 13.5169 10.0488 13.5097L14.041 8.51947C14.3232 8.22582 14.3196 7.75897 14.0303 7.46967Z"
            class="fill-white/80"
          />
        </svg>
        <span
          v-else
          class="block w-4 h-4 flex-shrink-0 rounded-full bg-gray-100 border-2 border-gray-300"
        />
      </button>
      <div class="flex items-stretch gap-4">
        <button
          type="button"
          class="bg-accent text-white font-bold rounded-xl p-4 flex-1 flex items-center justify-center"
          @click="handleStop"
        >
          停止答题
        </button>
        <button
          type="button"
          class="bg-primary text-white font-bold rounded-xl p-4 flex-1 flex items-center justify-center"
          @click="handleClear"
        >
          清除数据
        </button>
      </div>
    </main>
  </div>
</template>
