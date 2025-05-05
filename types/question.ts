export interface ChooseOption {
  key: string
  title: string
  value: number
}

export interface ChooseQuestion {
  id: string
  title: string
  options: ChooseOption[]
  choose: number
}

export type Question = ChooseQuestion
