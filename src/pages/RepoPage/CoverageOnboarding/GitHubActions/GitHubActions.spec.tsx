import { render, screen } from '@testing-library/react'

import { useFlags } from 'shared/featureFlags'

import GitHubActions from './GitHubActions'

jest.mock('./GitHubActionsRepoToken', () => () => 'GitHubActionsRepoToken')
jest.mock('./GitHubActionsOrgToken', () => () => 'GitHubActionsOrgToken')
jest.mock('shared/featureFlags')

const mockedNewRepoFlag = useFlags as jest.Mock<{ newRepoFlag: boolean }>

describe('GitHubActions', () => {
  function setup(show: boolean) {
    mockedNewRepoFlag.mockReturnValue({ newRepoFlag: show })
  }

  describe('when org upload token is available', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders GitHubActionsOrgToken', async () => {
      render(<GitHubActions />)

      const GitHubActionsOrgToken = await screen.findByText(
        'GitHubActionsOrgToken'
      )
      expect(GitHubActionsOrgToken).toBeInTheDocument()
    })
  })

  describe('when org upload token is not available', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders GitHubActionsRepoToken', async () => {
      render(<GitHubActions />)

      const GitHubActionsRepoToken = await screen.findByText(
        'GitHubActionsRepoToken'
      )
      expect(GitHubActionsRepoToken).toBeInTheDocument()
    })
  })
})
