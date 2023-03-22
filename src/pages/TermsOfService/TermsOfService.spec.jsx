import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import TermsOfService from './TermsOfService'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

jest.spyOn(global.console, 'log')

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('TermsOfService', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('the future query', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      })
    )

    return { user }
  }

  describe('page renders', () => {
    beforeEach(() => setup())

    it('renders welcome message', () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const welcome = screen.getByText(/Welcome to Codecov/i)
      expect(welcome).toBeInTheDocument()
    })

    it('submit button is disabled initially', () => {
      render(<TermsOfService />, { wrapper: wrapper() })

      const submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).toHaveAttribute('disabled')
    })
  })

  describe('form completion', () => {
    it('user selects an org and cant submit', async () => {
      const { user } = setup()
      render(<TermsOfService />, { wrapper: wrapper() })

      const select = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(select)

      const hades = screen.getByRole('option', { name: 'hades' })
      await user.click(hades)

      const selected = screen.getByText(/hades/i)
      expect(selected).toBeInTheDocument()

      const submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).toHaveAttribute('disabled')
    })

    it('user selects a default org and tos, they can submit', async () => {
      const { user } = setup()
      render(<TermsOfService />, { wrapper: wrapper() })

      const select = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(select)

      const hades = screen.getByRole('option', { name: 'hades' })
      await user.click(hades)

      const selected = screen.getByText(/hades/i)
      expect(selected).toBeInTheDocument()

      let submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).toHaveAttribute('disabled')

      const selectedTos = screen.getByRole('checkbox', {
        name: /I accept the terms of service and privacy policy/,
      })
      // useForm complaining about acts here
      await act(async () => {
        await user.click(selectedTos)
      })

      expect(selectedTos).toBeChecked()

      submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).not.toHaveAttribute('disabled')

      await user.click(submit)
      expect(console.log).toBeCalledWith({
        marketingEmail: false,
        select: 'hades',
        tos: true,
      })
    })

    it('user selects a default org, marketing and tos, they can submit', async () => {
      const { user } = setup()
      render(<TermsOfService />, { wrapper: wrapper() })

      const select = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(select)

      const hades = screen.getByRole('option', { name: 'hades' })
      await user.click(hades)

      const selected = screen.getByText(/hades/i)
      expect(selected).toBeInTheDocument()

      let submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).toHaveAttribute('disabled')

      const selectedMarketing = screen.getByRole('checkbox', {
        name: /I would like to receive updates via email/,
      })
      // useForm complaining about acts here
      await act(async () => {
        await user.click(selectedMarketing)
      })

      expect(selectedMarketing).toBeChecked()

      const selectedTos = screen.getByRole('checkbox', {
        name: /I accept the terms of service and privacy policy/,
      })
      // useForm complaining about acts here
      await act(async () => {
        await user.click(selectedTos)
      })

      expect(selectedTos).toBeChecked()

      submit = screen.getByRole('button', { name: /Continue/ })
      expect(submit).not.toHaveAttribute('disabled')

      await user.click(submit)
      expect(console.log).toBeCalledWith({
        marketingEmail: true,
        select: 'hades',
        tos: true,
      })
    })
  })
})
