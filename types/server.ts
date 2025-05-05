import type { Question } from './question.ts'
import type { UserAnswer } from './database.ts'

export interface ClientToServerEvents {
  setUser: (userId: string, userGroup: string) => void
  setPresentation: (isPresentation: boolean) => void
  getQuestions: () => void
  getQuestion: (id: string) => void
  getActiveQuestion: () => void
  setActiveQuestion: (id: string | null) => void
  getUserAnswerByQuestion: (questionId: string) => void
  getUserAnswers: () => void
  getAnswersByQuestion: (questionId: string) => void
  getGroupAnswersByQuestion: (questionId: string) => void
  getValuesByGroup: () => void
  submitAnswer: (questionId: string, answerKey: string) => void
  clearData: () => void
}

export interface ServerToClientEvents {
  questions: (questions: Question[]) => void
  question: (question: Question | null) => void
  activeQuestion: (question: string | null) => void
  userAnswerByQuestion: (questionId: string, answer: UserAnswer | null) => void
  userAnswers: (answers: Record<string, string | null>) => void
  answersByQuestion: (questionId: string, answers: Record<string, number>) => void
  groupAnswersByQuestion: (questionId: string, answers: Record<string, number>) => void
  valuesByGroup: (values: Record<string, number>) => void
}

export interface SocketData {
  userId: string | null
  userGroup: string | null
}
