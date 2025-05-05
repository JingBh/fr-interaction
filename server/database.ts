import { readFile } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { JSONFilePreset } from 'lowdb/node'

import type { Database, UserAnswer } from '../types/database.ts'
import type { Question } from '../types/question.ts'

let questions: Question[] = []

const questionsPath = process.env.QUESTIONS_PATH ||
  join(dirname(dirname(fileURLToPath(import.meta.url))), 'data', 'questions.json')

readFile(questionsPath, 'utf-8', (err, data) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  try {
    questions = JSON.parse(data)
  } catch (err) {
    console.error('Error parsing JSON data:', err)
    process.exit(1)
  }
})

let db: Awaited<ReturnType<typeof JSONFilePreset<Database>>> | null = null

const dbPath = process.env.DB_PATH ||
  join(dirname(dirname(fileURLToPath(import.meta.url))), 'data', 'db.json')

JSONFilePreset<Database>(dbPath, {
  activeQuestion: null,
  answers: []
}).then((instance) => {
  db = instance
})

export default {
  getQuestions: () => {
    return questions
  },

  getQuestion: (id: string): Question | null => {
    return questions.find((question) => question.id === id) ?? null
  },

  getActiveQuestion: (): string | null => {
    return db?.data.activeQuestion ?? null
  },

  setActiveQuestion: async (id: string | null): Promise<void> => {
    await db?.update((data) => {
      if (id === null) {
        data.activeQuestion = null
      } else {
        const question = questions.find((question) => question.id === id)
        if (!question) {
          throw new Error(`Question with id ${id} not found`)
        }
        data.activeQuestion = question.id
      }
      return data
    })
  },

  getAnswerByUserAndQuestion: (userId: string, questionId: string): UserAnswer | null => {
    return db?.data.answers.find((answer) => {
      return answer.userId === userId && answer.questionId === questionId
    }) ?? null
  },

  getAnswersByUser: (userId: string): Record<string, string> => {
    const result: Record<string, string> = {}

    db?.data.answers.filter((answer) => {
      return answer.userId === userId
    }).forEach((answer) => {
      result[answer.questionId] = answer.answerKey
    })

    return result
  },

  getAnswersByQuestion: (questionId: string): Record<string, number> => {
    const result: Record<string, number> = {}

    // gather answer keys
    questions?.find((question) => {
      return question.id === questionId
    })?.options.forEach((option) => {
      result[option.key] = 0
    })

    // count answers
    db?.data.answers.filter((answer) => {
      return answer.questionId === questionId
    }).forEach((answer) => {
      result[answer.answerKey]++
    })

    return result
  },

  getAnswersByQuestionAndGroup: (questionId: string, groupId: string): Record<string, number> => {
    const result: Record<string, number> = {}

    // gather answer keys
    questions?.find((question) => {
      return question.id === questionId
    })?.options.forEach((option) => {
      result[option.key] = 0
    })

    // count answers
    db?.data.answers.filter((answer) => {
      return answer.questionId === questionId && answer.userGroup === groupId
    }).forEach((answer) => {
      result[answer.answerKey]++
    })

    return result
  },

  getValuesByGroup: (): Record<string, number> => {
    // this function should calculate the total value of each group
    // the value is calculated as the sum of each question's average value of each group
    const result: Record<string, number> = {}

    // gather group ids
    db?.data.answers.forEach((answer) => {
      if (!result[answer.userGroup]) {
        result[answer.userGroup] = 0
      }
    })

    // calculate by group
    Object.keys(result).forEach((groupId) => {
      // count by question
      result[groupId] = questions.reduce((acc, question) => {

        // find all answers by this group for this question
        // and calculate group average value
        const averageValue = db?.data.answers.filter((answer) => {
          return answer.questionId === question.id
            && answer.userGroup === groupId
        }).reduce((acc, answer, _, answers) => {

          const answerObj = question.options.find((option) => {
            return option.key === answer.answerKey
          })

          if (answerObj) {
            return acc + answerObj.value / answers.length
          } else {
            return acc
          }
        }, 0) ?? 0

        // add to group total
        return acc + averageValue
      }, 0)
    })

    return result
  },

  submitAnswer: async (answer: UserAnswer): Promise<void> => {
    await db?.update((data) => {
      const existingAnswerIndex = data.answers.findIndex((a) => {
        return a.userId === answer.userId && a.questionId === answer.questionId
      })

      // replace the user's old answer
      if (existingAnswerIndex !== -1) {
        data.answers[existingAnswerIndex] = answer
      } else {
        data.answers.push(answer)
      }

      return data
    })
  },

  getAnswersCount: (): Record<string, number> => {
    const result: Record<string, number> = {}

    // gather answer keys
    questions?.forEach((question) => {
      result[question.id] = 0
    })

    // count answers
    db?.data.answers.forEach((answer) => {
      result[answer.questionId]++
    })

    return result
  },

  updateUserGroup: async (userId: string, userGroup: string): Promise<void> => {
    await db?.update((data) => {
      data.answers.forEach((answer) => {
        if (answer.userId === userId) {
          answer.userGroup = userGroup
        }
      })
      return data
    })
  },

  clearData: async (): Promise<void> => {
    await db?.update((data) => {
      data.activeQuestion = null
      data.answers = []
      return data
    })
  }
}
