<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

import router from '../router.ts'
import { useStore } from '../store.ts'

const store = useStore()

const windowSize = useWindowSize({
  type: 'inner'
})

const windowHeight = computed(() => {
  return windowSize.height.value
})

const hasGroupAnswers = computed<boolean>(() => {
  return Object.keys(store.groupAnswers).length > 0
})

const groupAnswers = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  for (const key in store.groupAnswers) {
    if (store.activeQuestionAnswer === key) {
      result[key] = Math.max(store.groupAnswers[key] - 1, 0)
    } else {
      result[key] = store.groupAnswers[key]
    }
  }
  return result
})

const handleSelectGroup = () => {
  router.push('/join/group')
}

const handleChooseAnswer = (key: string) => {
  if (store.activeQuestion) {
    store.submitAnswer(store.activeQuestion.id, key)
  }
}
</script>

<template>
  <div
    class="flex flex-col items-stretch overflow-hidden"
    :style="{ height: `${windowHeight}px` }"
  >
    <main class="max-w-screen-sm w-full flex-1 mx-auto flex flex-col items-stretch justify-center p-4 overflow-y-auto">
      <div
        v-if="store.activeQuestion"
        class="h-full flex flex-col items-stretch gap-4"
      >
        <h1 class="text-2xl font-bold text-center my-2">
          当前题目
        </h1>
        <p
          class="text-lg"
          v-text="store.activeQuestion.title"
        />
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="option of store.activeQuestion.options"
            :key="option.key"
            type="button"
            class="flex flex-col items-center gap-2 p-4 rounded-lg select-none"
            :class="store.activeQuestionAnswer === option.key ? 'bg-accent text-light' : 'border border-primary hover:bg-dark/10'"
            @click="handleChooseAnswer(option.key)"
          >
            <span class="block text-3xl font-bold">
              {{ option.key }}
            </span>
            <span
              class="block text-lg"
              v-text="option.title"
            />
            <span
              v-if="hasGroupAnswers"
              class="block text-xs opacity-50"
            >
              {{ groupAnswers[option.key] ?? 0 }} 位队友已选择
            </span>
          </button>
        </div>
      </div>
      <p
        v-else
        class="text-lg text-center my-2"
      >
        当前暂无题目
      </p>
    </main>
    <footer class="w-full bg-white pb-inset pl-inset pr-inset">
      <div class="px-4 py-2 flex justify-between items-center gap-2 text-sm">
      <span class="text-gray-700">
        所在小组：{{ store.userGroup }}
      </span>
        <span class="text-gray-400">
        ID：{{ store.userId.substring(0, 8) }}
      </span>
        <button
          class="text-primary hover:underline underline-offset-2"
          @click="handleSelectGroup"
        >
          切换小组 >
        </button>
      </div>
    </footer>
  </div>
</template>
