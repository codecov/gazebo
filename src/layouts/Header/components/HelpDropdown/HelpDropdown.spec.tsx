import Sentry from '@sentry/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import HelpDropdown from './HelpDropdown'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Switch>
      <Route path="/:provider/:repo" exact>
        {children}
      </Route>
    </Switch>
  </MemoryRouter>
)

describe('HelpDropdown', () => {
  function setup() {
    return {
      user: userEvent.setup(),
    }
  }

  it('renders dropdown button', async () => {
    setup()
    render(<HelpDropdown />, { wrapper })

    const dropdown = await screen.findByTestId('help-dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  describe('when not clicked', () => {
    it('does not render dropdown contents', async () => {
      setup()
      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown')
      expect(dropdown).toBeInTheDocument()

      const docs = screen.queryByText('Developer docs')
      expect(docs).not.toBeInTheDocument()
    })
  })

  describe('when clicked', () => {
    it('renders dropdown', async () => {
      const { user } = setup()
      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()

      await user.click(dropdown)

      const docs = await screen.findByText('Developer docs')
      expect(docs).toBeInTheDocument()

      const support = await screen.findByText('Support center')
      expect(support).toBeInTheDocument()

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()

      const discussions = await screen.findByText('Join GitHub discussions')
      expect(discussions).toBeInTheDocument()
    })
  })

  describe('when Share feedback item is selected', () => {
    it('opens the sentry user feedback modal', async () => {
      console.error = () => {}
      const { user } = setup()
      const open = jest.fn()
      const appendToDom = jest.fn()
      const removeFromDom = jest.fn()
      const createForm = jest.fn().mockReturnValue({
        open,
        appendToDom,
        removeFromDom,
      })

      const mockedFeedbackIntegration = jest
        .spyOn(Sentry, 'feedbackIntegration')
        .mockImplementation(() => ({
          createForm,
          name: 'asdf',
          attachTo: jest.fn(),
          createWidget: jest.fn(),
          remove: jest.fn(),
        }))

      render(<HelpDropdown />, { wrapper })

      const dropdown = await screen.findByTestId('help-dropdown-trigger')
      expect(dropdown).toBeInTheDocument()

      await user.click(dropdown)

      const feedback = await screen.findByText('Share feedback')
      expect(feedback).toBeInTheDocument()

      await user.click(feedback)

      expect(mockedFeedbackIntegration).toHaveBeenCalled()
      expect(createForm).toHaveBeenCalled()
      expect(appendToDom).toHaveBeenCalled()
      expect(open).toHaveBeenCalled()
    })
  })

  describe('if Sentry form has been loaded', () => {
    describe('and component unmounts', () => {
      it('calls removeSentryForm cleanup function', async () => {
        console.error = () => {}
        const { user } = setup()
        const open = jest.fn()
        const appendToDom = jest.fn()
        const createForm = jest.fn().mockReturnValue({
          open,
          appendToDom,
        })

        const mockedFeedbackIntegration = jest
          .spyOn(Sentry, 'feedbackIntegration')
          .mockImplementation(() => ({
            createForm,
            name: 'asdf',
            attachTo: jest.fn(),
            createWidget: jest.fn(),
            remove: jest.fn(),
          }))

        const { unmount } = render(<HelpDropdown />, { wrapper })

        const dropdown = await screen.findByTestId('help-dropdown-trigger')
        expect(dropdown).toBeInTheDocument()

        await user.click(dropdown)

        const feedback = await screen.findByText('Share feedback')
        expect(feedback).toBeInTheDocument()

        await user.click(feedback)
        document.body.style.overflow = 'hidden'

        expect(mockedFeedbackIntegration).toHaveBeenCalled()
        expect(createForm).toHaveBeenCalled()
        expect(appendToDom).toHaveBeenCalled()
        expect(open).toHaveBeenCalled()

        unmount()

        expect(document.body.style.overflow).toEqual('')
      })
    })
  })
})
