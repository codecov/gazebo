import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import PropTypes from 'prop-types'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import YAML from './YAML'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

// The ace-editor is currently not really testable so I'm mocking the whole component with something to respond to the onChange event
jest.mock('react-ace', () => (props) => <MockReactAce {...props} />)
jest.mock('ace-builds/src-noconflict/theme-github', () => {})
jest.mock('ace-builds/src-noconflict/mode-yaml', () => {})

const basicYamlConfig = { data: { owner: { yaml: '' } } }
const updateYamlConfig = (y) => ({
  data: { setYamlOnOwner: { owner: { yaml: y, username: 'doggo' } } },
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

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('YAMLTab', () => {
  function setup(dataReturned) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        if (req.body.query.includes('UpdateYamlConfig')) {
          return res(ctx.status(200), ctx.json(dataReturned.UpdateYamlConfig))
        }
        if (req.body.query.includes('YamlConfig')) {
          return res(ctx.status(200), ctx.json(dataReturned.YamlConfig))
        }
      })
    )

    render(<YAML owner="doggo" />, { wrapper })
  }
  describe('basic tests', () => {
    beforeEach(() => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })
    })

    it('renders the description text', () => {
      const tab = screen.getByText(
        /Changes made to the Global yml will override the default repo settings and is applied to all repositories in the org./
      )
      expect(tab).toBeInTheDocument()
    })

    it('The save button is disabled initially', () => {
      const save = screen.getByRole('button', { name: /Save Changes/ })
      expect(save).toBeDisabled()
    })

    it('The save button is enabled after editor input', async () => {
      const editor = screen.getByRole('textbox')
      userEvent.paste(editor, 'test: test')
      await waitFor(() => expect(editor).toHaveValue('test: test'))
      const save = screen.getByRole('button', { name: /Save Changes/ })
      expect(save).not.toBeDisabled()
    })
  })

  describe('saves a valid yaml file', () => {
    beforeEach(async () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfig(''),
      })

      const editor = screen.getByRole('textbox')
      userEvent.paste(editor, 'test: test')
      await waitFor(() => expect(editor).toHaveValue('test: test'))
      const save = screen.getByRole('button', { name: /Save Changes/ })
      userEvent.click(save)
      await screen.findByText(/Yaml configuration updated/)
    })

    it('You can close the modal by clicking done', async () => {
      userEvent.click(screen.getByRole('button', { text: /Done/ }))
      expect(
        screen.queryByText(/Yaml configuration updated/)
      ).not.toBeInTheDocument()
    })

    it('You can close the modal', async () => {
      userEvent.click(screen.getByText(/x.svg/))
      expect(
        screen.queryByText(/Yaml configuration updated/)
      ).not.toBeInTheDocument()
    })
  })

  describe('fails and displays linting error', () => {
    beforeEach(async () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfigError('bad config'),
      })

      const editor = screen.getByRole('textbox')
      userEvent.paste(editor, 'test: test')
      await waitFor(() => expect(editor).toHaveValue('test: test'))
    })

    it('The save button becomes unsaved changes and an error is displayed', async () => {
      const save = screen.getByRole('button', { name: /Save Changes/ })
      userEvent.click(save)
      await screen.findByText(/bad config/)
    })
  })

  describe('The api fails', () => {
    beforeEach(async () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: { errors: [{ message: 'something' }] },
      })

      const editor = screen.getByRole('textbox')
      userEvent.paste(editor, 'test: test')
      await waitFor(() => expect(editor).toHaveValue('test: test'))
    })

    it('The save button becomes unsaved changes and an error is displayed', async () => {
      const save = screen.getByRole('button', { name: /Save Changes/ })
      userEvent.click(save)

      await screen.findByText(/Something went wrong/)
    })
  })
})
