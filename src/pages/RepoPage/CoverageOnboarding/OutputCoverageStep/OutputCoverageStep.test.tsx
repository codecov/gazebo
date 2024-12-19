import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { ThemeContextProvider } from 'shared/ThemeContext'

import OutputCoverageStep from './OutputCoverageStep'

import { Framework, FrameworkInstructions } from '../UseFrameworkInstructions'

vi.mock('config')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new']}>
      <ThemeContextProvider>
        <Route
          path={[
            '/:provider/:owner/:repo/new',
            '/:provider/:owner/:repo/new/other-ci',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </ThemeContextProvider>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('OutputCoverageStep', () => {
  function setup({ isSelfHosted = false } = {}) {
    const user = userEvent.setup()
    config.IS_SELF_HOSTED = isSelfHosted

    const mockMetricMutationVariables = vi.fn()
    server.use(
      graphql.mutation('storeEventMetric', (info) => {
        mockMetricMutationVariables(info?.variables)
        return HttpResponse.json({ data: { storeEventMetric: null } })
      })
    )

    return {
      user,
    }
  }

  const framework: Framework = 'Jest'
  const frameworkInstructions: FrameworkInstructions = {
    Jest: {
      install: 'npm install --save-dev jest',
      run: 'npx jest --coverage',
      githubActionsWorkflow: '',
    },
    Vitest: {
      install: '',
      run: '',
      githubActionsWorkflow: '',
    },
    Pytest: {
      install: '',
      run: '',
      githubActionsWorkflow: '',
    },
    Go: {
      install: undefined,
      run: 'go test -coverprofile=coverage.txt',
      githubActionsWorkflow: '',
    },
  }
  const setFramework = vi.fn()

  it('renders header', async () => {
    setup({})
    render(
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner="gh"
        setFramework={setFramework}
      />,
      { wrapper }
    )

    const header = await screen.findByRole('heading', {
      name: /Step 1: Output a Coverage report file/,
    })
    expect(header).toBeInTheDocument()
  })

  it('renders framework blurb', async () => {
    setup({})
    render(
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner="gh"
        setFramework={setFramework}
      />,
      { wrapper }
    )

    const blurb = await screen.findByText(/Select your language below/)
    expect(blurb).toBeInTheDocument()
  })

  it('renders install step', async () => {
    setup({})
    render(
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner="gh"
        setFramework={setFramework}
      />,
      { wrapper }
    )

    const text = await screen.findByText(
      'Install requirements in your terminal:'
    )
    expect(text).toBeInTheDocument()

    const command = await screen.findByText('npm install --save-dev jest')
    expect(command).toBeInTheDocument()
  })

  it('renders run step', async () => {
    setup({})
    render(
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner="gh"
        setFramework={setFramework}
      />,
      { wrapper }
    )

    const text = await screen.findByText(
      'In a GitHub Action, run tests and generate a coverage report:'
    )
    expect(text).toBeInTheDocument()

    const command = await screen.findByText('npx jest --coverage')
    expect(command).toBeInTheDocument()
  })

  describe('framework selector', () => {
    it('renders', async () => {
      setup({})
      render(
        <OutputCoverageStep
          framework={framework}
          frameworkInstructions={frameworkInstructions}
          owner="gh"
          setFramework={setFramework}
        />,
        { wrapper }
      )

      const selector = await screen.findByRole('combobox')
      expect(selector).toBeInTheDocument()
    })

    describe('when clicked', () => {
      it('renders dropdown', async () => {
        const { user } = setup({})
        render(
          <OutputCoverageStep
            framework={framework}
            frameworkInstructions={frameworkInstructions}
            owner="gh"
            setFramework={setFramework}
          />,
          { wrapper }
        )

        const selector = await screen.findByRole('combobox')
        expect(selector).toBeInTheDocument()

        let vitest = screen.queryByText('Vitest')
        let pytest = screen.queryByText('Pytest')
        let go = screen.queryByText('Go')
        expect(vitest).not.toBeInTheDocument()
        expect(pytest).not.toBeInTheDocument()
        expect(go).not.toBeInTheDocument()

        await user.click(selector)

        vitest = await screen.findByText('Vitest')
        pytest = await screen.findByText('Pytest')
        go = await screen.findByText('Go')
        expect(vitest).toBeInTheDocument()
        expect(pytest).toBeInTheDocument()
        expect(go).toBeInTheDocument()
      })
    })

    describe('when another framework is selected', () => {
      it('calls setFramework when new framework is selected', async () => {
        const { user } = setup({})
        render(
          <OutputCoverageStep
            framework={framework}
            frameworkInstructions={frameworkInstructions}
            owner="gh"
            setFramework={setFramework}
          />,
          { wrapper }
        )

        const selector = await screen.findByRole('combobox')
        await user.click(selector)

        const goOption = await screen.findByText('Go')
        await user.click(goOption)

        expect(setFramework).toHaveBeenCalledWith('Go')
      })
      it('renders different content when framework changes', async () => {
        setup({})
        const { rerender } = render(
          <OutputCoverageStep
            framework={framework}
            frameworkInstructions={frameworkInstructions}
            owner="gh"
            setFramework={setFramework}
          />,
          { wrapper }
        )

        const installText = await screen.findByText(
          'Install requirements in your terminal:'
        )
        expect(installText).toBeInTheDocument()

        rerender(
          <OutputCoverageStep
            framework="Go"
            frameworkInstructions={frameworkInstructions}
            owner="gh"
            setFramework={setFramework}
          />
        )

        const install = screen.queryByText(
          'Install requirements in your terminal:'
        )
        expect(install).not.toBeInTheDocument()
        const run = await screen.findByText(
          'In a GitHub Action, run tests and generate a coverage report:'
        )
        expect(run).toBeInTheDocument()

        const command = await screen.findByText(
          'go test -coverprofile=coverage.txt'
        )
        expect(command).toBeInTheDocument()
      })
    })
  })
})
