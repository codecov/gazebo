import { render, screen, waitFor } from 'custom-testing-library'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import userEvent from '@testing-library/user-event'
import PropTypes from 'prop-types'

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
jest.mock('./YamlEditor', () => (props) => <MockEditor {...props} />)

const basicYamlConfig = { data: { owner: { yaml: 'hello' } } }
const updateYamlConfig = (y) => ({
  data: { owner: { yaml: y, username: 'doggo' } },
})
const updateYamlConfigError = (e) => ({
  errors: e,
})

function MockEditor({ onChange, annotations, value }) {
  function onInputChange(e) {
    onChange(e.target.value)
  }
  return (
    <>
      <ul>
        {annotations.map((err, i) => (
          <li key={i}>
            {err.type} {err.row} {err.column} {err.text}
          </li>
        ))}
      </ul>
      <input onChange={onInputChange} value={!value ? '' : value} />
    </>
  )
}
MockEditor.propTypes = {
  onChange: PropTypes.func,
  annotations: PropTypes.array,
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
      const save = screen.getByText(/Save Changes/)
      expect(save).toBeDisabled()
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
    })

    it('The save button is enabled after editor input', () => {
      const save = screen.getByText(/Save Changes/)
      expect(save).not.toBeDisabled()
    })

    it('Opens modal on save', async () => {
      const save = screen.getByText(/Save Changes/)
      userEvent.click(save)
      await screen.findByText(/Yaml configuration updated/)
    })

    it('You can close the modal by clicking done', async () => {
      const save = screen.getByText(/Save Changes/)
      userEvent.click(save)
      await screen.findByText(/Yaml configuration updated/)
      userEvent.click(screen.getByRole('button', { text: /Done/ }))
      expect(
        screen.queryByText(/Yaml configuration updated/)
      ).not.toBeInTheDocument()
    })

    it('You can close the modal', async () => {
      const save = screen.getByText(/Save Changes/)
      userEvent.click(save)
      await screen.findByText(/Yaml configuration updated/)
      userEvent.click(screen.getByText(/x.svg/))
      expect(
        screen.queryByText(/Yaml configuration updated/)
      ).not.toBeInTheDocument()
    })
  })

  describe('fails and annotates linting errors', () => {
    beforeEach(async () => {
      setup({
        YamlConfig: basicYamlConfig,
        UpdateYamlConfig: updateYamlConfigError([
          { message: 'bad config', locations: [{ column: 2, line: 20 }] },
          { message: 'some error', locations: [{ column: 6, line: 5 }] },
        ]),
      })

      const editor = screen.getByRole('textbox')
      userEvent.paste(editor, 'test: test')
      await waitFor(() => expect(editor).toHaveValue('test: test'))
    })

    it('The save bulled becomes unsaved changes and annotations are passed to the ace editor', async () => {
      const save = screen.getByText(/Save Changes/)
      userEvent.click(save)
      await screen.findByText(/Unsaved changes/)
      expect(screen.getByText(/bad config/)).toBeInTheDocument()
      expect(screen.getByText(/some error/)).toBeInTheDocument()
    })
  })
})
