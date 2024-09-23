import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import PropTypes from 'prop-types'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'

import YAML from './YAML'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

// The ace-editor is currently not really testable so I'm mocking the whole component with something to respond to the onChange event
vi.mock('react-ace', () => ({
  default: (props) => <MockReactAce {...props} />,
}))
vi.mock('ace-builds/src-noconflict/theme-github', () => ({ default: () => {} }))
vi.mock('ace-builds/src-noconflict/mode-yaml', () => ({ default: () => {} }))
vi.mock('services/user')

const basicYamlConfig = { owner: { yaml: '' } }
const updateYamlConfig = (y) => ({
  setYamlOnOwner: { owner: { yaml: y, username: 'doggo' } },
})
const updateYamlConfigError = (e) => ({
  data: { setYamlOnOwner: { error: { message: e } } },
})

function MockReactAce({ onChange, value }) {
  function onInputChange(e) {
    onChange(e.target.value)
  }
  return <input onChange={onInputChange} value={!value ? '' : value} />
}
MockReactAce.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.any,
}

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('YAMLTab', () => {
  afterEach(() => vi.clearAllMocks())

  function setup(dataReturned) {
    const user = userEvent.setup()
    useIsCurrentUserAnAdmin.mockReturnValue(true)

    server.use(
      graphql.query('YamlConfig', (info) => {
        return HttpResponse.json({ data: dataReturned.YamlConfig })
      }),
      graphql.mutation('UpdateYamlConfig', (info) => {
        return HttpResponse.json(dataReturned.UpdateYamlConfig)
      })
    )

    return { user }
  }
  describe('basic tests for admin users', () => {
    afterEach(() => vi.clearAllMocks())

    it('renders the description text', () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
      render(<YAML owner="doggo" />, { wrapper })

      const tab = screen.getByText(
        /Changes made to the Global YAML are applied to all repositories in the org if they do not have a repo level YAML./
      )
      expect(tab).toBeInTheDocument()
    })

    it('The save button is disabled initially', () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
      render(<YAML owner="doggo" />, { wrapper })
      const save = screen.getByRole('button', { name: /Save Changes/ })
      expect(save).toBeDisabled()
    })

    it('The save button is enabled after editor input', async () => {
      const { user } = setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
      render(<YAML owner="doggo" />, { wrapper })

      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.paste('test: test')
      expect(editor).toHaveValue('test: test')
      const save = screen.getByRole('button', { name: /Save Changes/ })
      expect(save).not.toBeDisabled()
    })
  })

  describe('saves a valid yaml file', () => {
    afterEach(() => vi.clearAllMocks())

    it('You can close the modal by clicking done', async () => {
      const { user } = setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
      render(<YAML owner="doggo" />, { wrapper })

      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.paste('test: test')
      expect(editor).toHaveValue('test: test')

      const save = screen.getByRole('button', { name: /Save Changes/ })
      await user.click(save)
      expect(
        await screen.findByText(/YAML configuration updated/)
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { text: /Done/ }))
      expect(
        screen.queryByText(/YAML configuration updated/)
      ).not.toBeInTheDocument()
    })

    it('You can close the modal', async () => {
      const { user } = setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
      render(<YAML owner="doggo" />, { wrapper })

      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.paste('test: test')
      expect(editor).toHaveValue('test: test')

      const save = screen.getByRole('button', { name: /Save Changes/ })
      await user.click(save)

      let yamlConfigurationUpdated = await screen.findByText(
        /YAML configuration updated/
      )
      expect(yamlConfigurationUpdated).toBeInTheDocument()

      const xSvg = screen.getByTestId('modal-close-icon')
      await user.click(xSvg)

      yamlConfigurationUpdated = screen.queryByText(
        /YAML configuration updated/
      )
      expect(yamlConfigurationUpdated).not.toBeInTheDocument()
    })
  })

  describe('fails and displays linting error', () => {
    afterEach(() => vi.clearAllMocks())

    it('The save button becomes unsaved changes and an error is displayed', async () => {
      const { user } = setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfigError('bad config'),
      })
      render(<YAML owner="doggo" />, { wrapper })

      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.paste('test: test')
      expect(editor).toHaveValue('test: test')

      const save = screen.getByRole('button', { name: /Save Changes/ })
      await user.click(save)

      const badConfig = await screen.findByText(/bad config/)
      expect(badConfig).toBeInTheDocument()
    })
  })

  describe('The api fails', () => {
    afterEach(() => vi.clearAllMocks())

    it('The save button becomes unsaved changes and an error is displayed', async () => {
      const { user } = setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: { errors: [{ message: 'something' }] },
      })
      render(<YAML owner="doggo" />, { wrapper })

      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.paste('test: test')
      expect(editor).toHaveValue('test: test')

      const save = screen.getByRole('button', { name: /Save Changes/ })
      await user.click(save)

      const somethingWentWrong = await screen.findByText(/Something went wrong/)
      expect(somethingWentWrong).toBeInTheDocument()
    })
  })
})
