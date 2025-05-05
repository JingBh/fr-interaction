<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '../store.ts'
import { useTransparentBackground } from '../utils.ts'

const store = useStore()

store.refreshGroupValues()

const data = computed<[string, number][]>(() => {
  return Object.entries(store.groupValues).sort((a, b) => {
    return b[1] - a[1]
  }).map(([group, value]) => {
    return [group, Math.max(Math.round(value), 2)]
  })
})

useTransparentBackground()
</script>

<template>
  <div class="flex flex-col items-stretch gap-6 p-4">
    <div
      v-for="[group, value] of data"
      :key="group"
      class="flex items-center"
    >
      <h2
        class="w-32 flex-shrink-0 text-3xl font-bold text-center"
        v-text="group"
      />
      <div class="flex-1 flex -space-x-6">
        <div
          v-for="i in Array(value)"
          :key="i"
          class="w-16 h-16 rounded-full bg-yellow-400 border-double border-4 border-yellow-600 shadow-xl"
        />
      </div>
    </div>
  </div>
</template>
