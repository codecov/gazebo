import { render, screen } from '@testing-library/react'

import { useYamlConfig, useUpdateYaml } from 'services/yaml'
import YAML from './YAML'

jest.mock('services/yaml')
jest.mock('./YamlEditor', () => () => <input test-id="fake-ace" />)

describe('YAMLTab', () => {
  function setup(props = {}) {
    useYamlConfig.mockReturnValue({ data: 'hello' })
    useUpdateYaml.mockReturnValue({})
    render(<YAML {...props} />)
  }

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
