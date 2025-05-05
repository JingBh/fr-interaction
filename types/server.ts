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
  getAnswersCount: () => void
  clearData: () => void
}

export interface ServerToClientEvents {
  questions: (value: Question[]) => void
  question: (value: Question | null) => void
  activeQuestion: (value: string | null) => void
  userAnswerByQuestion: (questionId: string, value: UserAnswer | null) => void
  userAnswers: (value: Record<string, string | null>) => void
  answersByQuestion: (questionId: string, value: Record<string, number>) => void
  groupAnswersByQuestion: (questionId: string, value: Record<string, number>) => void
  valuesByGroup: (value: Record<string, number>) => void
  answersCount: (value: Record<string, number>) => void
}

export interface SocketData {
  userId: string | null
  userGroup: string | null
}
