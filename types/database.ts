export interface UserAnswer {
  userId: string
  userGroup: string
  questionId: string
  answerKey: string
}

export interface Database {
  activeQuestion: string | null
  answers: UserAnswer[]
}
