import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import config from 'config'

import OutputCoverageStep from './OutputCoverageStep'

vi.mock('config')

describe('OutputCoverageStep', () => {
  function setup({ isSelfHosted = false } = {}) {
    const user = userEvent.setup()
    config.IS_SELF_HOSTED = isSelfHosted

    return {
      user,
    }
  }

  const framework = 'Vitest'
  const frameworkInstructions = {
    Vitest: {
      install: 'npm install --save-dev jest',
      run: 'npx jest --coverage',
    },
    Jest: {
      install: '',
      run: '',
    },
    Pytest: {
      install: '',
      run: '',
    },
    Go: {
      install: '',
      run: '',
    },
  }
  const setFramework = vi.fn()

  describe('step one', () => {
    it('renders header', async () => {
      setup({})
      render(
        <OutputCoverageStep
          framework={framework}
          frameworkInstructions={frameworkInstructions}
          owner="gh"
          setFramework={setFramework}
        />
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
        />
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
        />
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
        />
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
          />
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
            />
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

      describe('when Go is selected', () => {
        it('does not render install step', async () => {
          const { user } = setup({})
          render(
            <OutputCoverageStep
              framework={framework}
              frameworkInstructions={frameworkInstructions}
              owner="gh"
              setFramework={setFramework}
            />
          )

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const install = screen.queryByText(
            'Install requirements in your terminal:'
          )
          expect(install).not.toBeInTheDocument()
        })

        it('updates run step', async () => {
          const { user } = setup({})
          render(
            <OutputCoverageStep
              framework={framework}
              frameworkInstructions={frameworkInstructions}
              owner="gh"
              setFramework={setFramework}
            />
          )

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const run = await screen.findByText(
            'In a GitHub Action, run tests and generate a coverage report:'
          )
          expect(run).toBeInTheDocument()

          const command = await screen.findByText(
            'go test -coverprofile=coverage.txt'
          )
          expect(command).toBeInTheDocument()
        })

        it('updates example yaml', async () => {
          const { user } = setup({})
          render(
            <OutputCoverageStep
              framework={framework}
              frameworkInstructions={frameworkInstructions}
              owner="gh"
              setFramework={setFramework}
            />
          )

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const trigger = await screen.findByText((content) =>
            content.startsWith('Your final GitHub Actions workflow')
          )
          expect(trigger).toBeInTheDocument()

          await user.click(trigger)

          const yaml = await screen.findByText(/go mod download/)
          expect(yaml).toBeInTheDocument()
        })
      })
    })
  })
})
