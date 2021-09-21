import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import GithubIntegrationCard from './GithubIntegrationCard'
import { useAccountDetails } from 'services/account'
import config from 'config'

jest.mock('services/account')

describe('GithubIntegrationCard', () => {
  let wrapper

  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup(accountDetails = {}, over = {}, isEnterprise = false) {
    useAccountDetails.mockReturnValue({ data: accountDetails })
    config.IS_ENTERPRISE = isEnterprise
    const props = {
      ...defaultProps,
      ...over,
    }
    wrapper = render(<GithubIntegrationCard {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered for not a github user', () => {
    beforeEach(() => {
      setup(null, {
        provider: 'gl',
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when github user but enterprise', () => {
    beforeEach(() => {
      setup(null, {}, true)
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user doesnt have the integration installed', () => {
    beforeEach(() => {
      setup({
        integrationId: null,
      })
    })

    it('renders the copy to explain the integration', () => {
      expect(
        screen.getByText(
          /integrate with codecov through the github app to strengthen codecov’s integration with your team\.this will replace the team bot account and post pull request comments on behalf of codecov\./i
        )
      ).toBeInTheDocument()
    })

    it('has a link to the github marketplace', () => {
      expect(
        screen.getByRole('link', {
          name: /View in GitHub Marketplace/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when the user has the integration installed', () => {
    beforeEach(() => {
      setup({
        integrationId: 123,
      })
    })

    it('renders the copy to tell the user that the account is using the integration', () => {
      expect(
        screen.getByText(
          /this account is configured via the github app\. you can manage the app on github\./i
        )
      ).toBeInTheDocument()
    })

    it('has a link to the github integration setting page', () => {
      expect(
        screen.getByRole('link', {
          name: /continue to github to manage repository integration/i,
        })
      ).toBeInTheDocument()
    })
  })
})
