import * as yup from 'yup'

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

export function shouldGoToEmailStep({ email, typeProjects }) {
  // no personal email, we need to collect
  if (email.length === 0) {
    return true
  }
  // if the user picked "YOUR ORG" we can collect business email
  if (typeProjects.includes(TYPE_PROJECTS.YOUR_ORG)) return true

  // no need to go to email steps, we can
  return false
}

export function getSchema() {
  return yup.object().shape({
    email: yup.string().email('Not a valid email'),
    businessEmail: yup.string().email('Not a valid email'),
  })
}
