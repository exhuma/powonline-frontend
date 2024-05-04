export interface QuestionnaireScores {
  // The team-name
  [key: string]: {
    // The station name
    [key: string]: {
      // The questionnaire name
      name: string
      score: number
    }
  }
}
