import { render, screen } from '@testing-library/react'

import UserCount from './UserCount'

/*
 * Something weird is going on with the coverage uploads with this file where
 * the coverage is not coming back as fully covered on Codecov even though all
 * the test cases are explicitly tests and coming up as fully covered locally
 */

describe('UserCount', () => {
  describe('it is not a sentry plan', () => {
    it('renders user information', () => {
      render(
        <UserCount
          activatedUserCount={10}
          inactiveUserCount={10}
          isSentryUpgrade={false}
        />
      )

      const message = screen.getByText(
        /Currently 10 users activated out of 20 users./i
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('it is a sentry plan', () => {
    it('renders 5 users included in plan', () => {
      render(
        <UserCount
          activatedUserCount={10}
          inactiveUserCount={10}
          isSentryUpgrade={true}
        />
      )

      const message = screen.getByText(/5 seats already included in this plan/i)
      expect(message).toBeInTheDocument()
    })
  })

  describe('activatedUserCount is undefined', () => {
    it('returns empty container', () => {
      const { container } = render(
        <UserCount activatedUserCount={undefined} isSentryUpgrade={false} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('inactiveUserCount is undefined', () => {
    it('returns empty container', () => {
      const { container } = render(
        <UserCount inactiveUserCount={undefined} isSentryUpgrade={false} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('there are no students', () => {
    it('returns empty container', () => {
      render(
        <UserCount
          activatedUserCount={10}
          inactiveUserCount={10}
          activatedStudentCount={0}
          isSentryUpgrade={false}
        />
      )

      const studentText = screen.queryByText(/student/i)
      expect(studentText).not.toBeInTheDocument()
    })
  })

  describe('there is one student', () => {
    render(
      <UserCount
        activatedUserCount={25}
        inactiveUserCount={30}
        activatedStudentCount={1}
        isSentryUpgrade={false}
      />
    )

    const message = screen.getByText(/1 active student/i)
    expect(message).toBeInTheDocument()
  })

  describe('there is more then one student', () => {
    render(
      <UserCount
        activatedUserCount={25}
        inactiveUserCount={30}
        activatedStudentCount={2}
        isSentryUpgrade={false}
      />
    )

    const message = screen.getByText(/2 active students/i)
    expect(message).toBeInTheDocument()
  })
})
