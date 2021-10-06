export const TYPE_PROJECTS = Object.freeze({
  PERSONAL: 'PERSONAL',
  YOUR_ORG: 'YOUR_ORG',
  OPEN_SOURCE: 'OPEN_SOURCE',
  EDUCATIONAL: 'EDUCATIONAL',
})

export const GOALS = Object.freeze({
  STARTING_WITH_TESTS: 'STARTING_WITH_TESTS',
  IMPROVE_COVERAGE: 'IMPROVE_COVERAGE',
  MAINTAIN_COVERAGE: 'MAINTAIN_COVERAGE',
  TEAM_REQUIREMENTS: 'TEAM_REQUIREMENTS',
  OTHER: 'OTHER',
})

export function getInitialDataForm(currentUser) {
  return {
    email: currentUser.email,
    businessEmail: '',
    typeProjects: [],
    goals: [],
    otherGoal: '',
  }
}
