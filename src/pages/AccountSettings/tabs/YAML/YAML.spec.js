import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
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
      <input onChange={onInputChange} value={value} />
    </>
  )
}
MockEditor.propTypes = {
  onChange: PropTypes.func,
  annotations: PropTypes.array,
  value: PropTypes.string,
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

xdescribe('YAMLTab', () => {
  function setup(props = {}) {
    server.use(
      graphql.query('YamlConfig', (req, res, ctx) => {
        return res(
          ctx.data({
            me: {},
          })
        )
      }),
      graphql.mutation('UpdateYamlConfig', (req, res, ctx) => {
        return res(
          ctx.data({
            setYamlOnOwner: {
              error: null,
              owner: {
                username: 'doggo',
                yaml: 'hello',
              },
            },
          })
        )
      })
    )

    render(<YAML {...props} owner="doggo" />, wrapper)
  }
  describe('basic tests', () => {
    beforeEach(() => {
      setup({ owner: 'doggo' })
    })

    it('renders the description text', () => {
      const tab = screen.getByText(
        /Changes made to the Global yml will override the default repo settings and is applied to all repositories in the org./
      )
      expect(tab).toBeInTheDocument()
    })

    it('The save button is disabled initially', () => {
      const save = screen.getByText(/Save Changes/)
      expect(save.getAttribute('disabled')).toBe('')
    })
  })

  describe('make a valid change', () => {
    beforeEach(() => {
      setup({ owner: 'doggo' })
      const editor = screen.getByRole('textbox')
      userEvent.type(editor, 'test: test')
      expect(editor).toHaveValue('test: test')
    })

    it('The save button is enabled after editor input', () => {
      const save = screen.getByText(/Save Changes/)
      expect(save.getAttribute('disabled')).toBe(null)
    })

    it('On save', async () => {
      const save = screen.getByText(/Save Changes/)
      userEvent.click(save)
      await screen.findByText(/Unsaved changes/)
    })
  })
})
