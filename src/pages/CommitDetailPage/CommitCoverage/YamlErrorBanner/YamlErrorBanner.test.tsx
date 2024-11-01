import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import YamlErrorBanner from './YamlErrorBanner'

vi.mock('../YamlModal', () => ({ default: () => 'YamlModalComponent' }))

interface SetupArgs {
  shouldLinkToModal?: boolean
}

describe('YamlErrorBanner', () => {
  function setup({ shouldLinkToModal }: SetupArgs) {
    render(
      <MemoryRouter initialEntries={[`/gh/codecov`]}>
        <Route path="/:provider/:owner">
          <YamlErrorBanner shouldLinkToModal={shouldLinkToModal} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders heading of banner', () => {
      expect(screen.getByText(/YAML is invalid/)).toBeInTheDocument()
    })

    it('renders content', () => {
      expect(
        screen.getByText(
          /Coverage data is unable to be displayed, as the yaml appears to be invalid/
        )
      ).toBeInTheDocument()
    })
  })

  describe('handle shouldLinkToModal', () => {
    it('links to modal when true', async () => {
      setup({ shouldLinkToModal: true })
      const yamlModal = screen.queryByText(/YamlModalComponent/)
      expect(yamlModal).toBeInTheDocument()

      const yamlModalLink = await screen.findByTestId('open yaml modal')
      expect(yamlModalLink).toBeInTheDocument()

      const user = userEvent.setup()
      user.click(yamlModalLink)
    })

    it('does not link to modal when false', async () => {
      setup({})
      const yamlModal = screen.queryByText(/YamlModalComponent/)
      expect(yamlModal).not.toBeInTheDocument()

      const yamlIsInvalid = await screen.findByText('YAML is invalid')
      expect(yamlIsInvalid).toBeInTheDocument()
      expect(yamlIsInvalid).not.toHaveAttribute('href')

      const yamlModalLink = screen.queryByTestId('open yaml modal')
      expect(yamlModalLink).not.toBeInTheDocument()
    })
  })
})
