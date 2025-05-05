import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { v4 as uuid } from 'uuid'

import { socket } from './socket.ts'
import type { Question } from '../types/question.ts'

export const useStore = defineStore('app', () => {
  const route = useRoute()

  // --- control ---
  const questions = ref<Question[]>([])

  const activeQuestionId = ref<string | null>(null)

  const activeQuestion = computed<Question | null>(() => {
    if (activeQuestionId.value) {
      return questions.value.find((question) => {
        return question.id === activeQuestionId.value
      }) ?? null
    }
    return null
  })

  const setActiveQuestion = (id: string | null) => {
    socket.emit('setActiveQuestion', id)
  }

  const clearData = () => {
    socket.emit('clearData')
  }

  // --- game ---

  const isGame = computed<boolean>(() => {
    return route.path.startsWith('/join')
  })

  const userId = useLocalStorage('userId', uuid())

  const userGroup = useLocalStorage('userGroup', '')

  watchEffect(() => {
    if (userId.value && userGroup.value && isGame.value) {
      socket.emit('setUser', userId.value, userGroup.value)
    }
  })

  const answers = ref<Record<string, string | null>>({})

  const activeQuestionAnswer = computed<string | null>(() => {
    if (activeQuestionId.value) {
      return answers.value[activeQuestionId.value] ?? null
    }
    return null
  })

  const submitAnswer = (questionId: string, answer: string) => {
    socket.emit('submitAnswer', questionId, answer)
  }

  const groupAnswers = ref<Record<string, number>>({})

  // --- presentation ---

  const isPresentation = computed<boolean>(() => {
    return route.path.startsWith('/presentation')
  })

  watch(isPresentation, (v) => {
    socket.emit('setPresentation', v)
  })

  const answersByQuestion = ref<Record<string, Record<string, number>>>({})

  const refreshAnswersOf = (questionId: string) => {
    socket.emit('getAnswersByQuestion', questionId)
  }

  const groupValues = ref<Record<string, number>>({})

  const refreshGroupValues = () => {
    socket.emit('getValuesByGroup')
  }

  // --- socket events ---

  const bindEvents = () => {
    socket.on('connect', () => {
      if (userId.value && userGroup.value && isGame.value) {
        socket.emit('setUser', userId.value, userGroup.value)
      }

      socket.emit('setPresentation', isPresentation.value)
    })

    socket.on('questions', (value) => {
      questions.value = value
    })

    socket.on('activeQuestion', (value) => {
      activeQuestionId.value = value
    })

    socket.on('userAnswers', (value) => {
      answers.value = value
    })

    socket.on('groupAnswersByQuestion', (questionId, value) => {
      if (activeQuestionId.value === questionId) {
        groupAnswers.value = value
      } else {
        groupAnswers.value = {}
      }
    })

    socket.on('answersByQuestion', (questionId, value) => {
      answersByQuestion.value[questionId] = value
    })

    socket.on('valuesByGroup', (value) => {
      groupValues.value = value
    })
  }

  return {
    activeQuestion,
    activeQuestionAnswer,
    answersByQuestion,
    bindEvents,
    clearData,
    groupAnswers,
    groupValues,
    questions,
    refreshAnswersOf,
    refreshGroupValues,
    setActiveQuestion,
    submitAnswer,
    userId,
    userGroup
  }
})
