<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useStore } from '../store.ts'

import CardA from 'cardsJS/cards/AS.svg?inline'
import Card2 from 'cardsJS/cards/2S.svg?inline'
import Card3 from 'cardsJS/cards/3H.svg?inline'
import Card4 from 'cardsJS/cards/4C.svg?inline'
import Card5 from 'cardsJS/cards/5D.svg?inline'
import Card6 from 'cardsJS/cards/6S.svg?inline'
import Card7 from 'cardsJS/cards/7H.svg?inline'
import Card8 from 'cardsJS/cards/8C.svg?inline'
import Card9 from 'cardsJS/cards/9D.svg?inline'
import Card10 from 'cardsJS/cards/10S.svg?inline'
import CardJ from 'cardsJS/cards/JH.svg?inline'
import CardQ from 'cardsJS/cards/QC.svg?inline'
import CardK from 'cardsJS/cards/KD.svg?inline'

const store = useStore()

const router = useRouter()

const groupCardMap = computed<Record<string, string>>(() => ({
  '2': Card2,
  '3': Card3,
  '4': Card4,
  '5': Card5,
  '6': Card6,
  '7': Card7,
  '8': Card8,
  '9': Card9,
  '10': Card10,
  J: CardJ,
  Q: CardQ,
  K: CardK,
  A: CardA
}))

const handleSelectGroup = (group: string) => {
  store.userGroup = group
  router.replace('/join')
}
</script>

<template>
  <div class="pb-inset pl-inset pr-inset">
    <div class="max-w-screen-sm mx-auto p-4">
      <main class="flex flex-col items-stretch gap-4">
        <h1 class="text-2xl font-bold text-center my-2">
          请选择你的小组
        </h1>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="(card, group) in groupCardMap"
            :key="group"
            type="button"
            class="w-full bg-white rounded select-none"
            @click="handleSelectGroup(group)"
          >
            <img
              :alt="`Card ${group}`"
              :src="card"
              class="w-full h-auto"
            />
          </button>
          <button
            type="button"
            class="col-span-3 flex items-center justify-center border-[0.5px] border-black bg-white rounded text-lg select-none"
            @click="handleSelectGroup('旁听')"
          >
            旁听
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
