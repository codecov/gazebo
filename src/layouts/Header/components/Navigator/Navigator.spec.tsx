import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider } from 'pages/RepoPage/context'

import Navigator from './Navigator'

jest.mock('ui/Breadcrumb', () => () => 'Breadcrumb')
jest.mock('./MyContextSwitcher', () => () => 'MyContextSwitcher')

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <RepoBreadcrumbProvider>
          <Route path="/:provider/:owner" exact>
            {children}
          </Route>
          <Route path="/:provider/:owner/:repo" exact>
            {children}
          </Route>
        </RepoBreadcrumbProvider>
      </MemoryRouter>
    )

const mockUser = {
  owner: {
    defaultOrgUsername: 'codecov',
  },
  email: 'jane.doe@codecov.io',
  privateAccess: true,
  onboardingCompleted: true,
  businessEmail: 'jane.doe@codecov.io',
  termsAgreement: true,
  user: {
    name: 'Jane Doe',
    username: 'janedoe',
    avatarUrl: 'http://127.0.0.1/avatar-url',
    avatar: 'http://127.0.0.1/avatar-url',
    student: false,
    studentCreatedAt: null,
    studentUpdatedAt: null,
    customerIntent: 'PERSONAL',
  },
  trackingMetadata: {
    service: 'github',
    ownerid: 123,
    serviceId: '123',
    plan: 'users-basic',
    staff: false,
    hasYaml: false,
    bot: null,
    delinquent: null,
    didTrial: null,
    planProvider: null,
    planUserCount: 1,
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    profile: {
      createdAt: 'timestamp',
      otherGoal: null,
      typeProjects: [],
      goals: [],
    },
  },
}

describe('Header Navigator', () => {
  describe('when on repo page', () => {
    it('should render repo breadcrumb', async () => {
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/gh/codecov/test-repo'),
      })

      const breadcrumb = await screen.findByText('Breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
    })
  })

  describe('temp: when not on repo page', () => {
    it('should render MyContextSwitcher', async () => {
      render(<Navigator currentUser={mockUser} />, { wrapper: wrapper() })

      const switcher = await screen.findByText('MyContextSwitcher')
      expect(switcher).toBeInTheDocument()
    })
  })
})
