<script setup lang="ts">
import { socket } from './socket.ts'
import { useStore } from './store.ts'

const store = useStore()

socket.off()
store.bindEvents()
</script>

<template>
  <router-view />
</template>
