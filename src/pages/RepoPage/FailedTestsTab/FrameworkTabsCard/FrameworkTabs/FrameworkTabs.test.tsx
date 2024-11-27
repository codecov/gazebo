import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FrameworkTabs } from './FrameworkTabs'

describe('FrameworkTabs', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  it('renders Pytest by default', () => {
    setup()
    render(<FrameworkTabs />)

    const pytestButton = screen.getByText('Pytest')
    expect(pytestButton).toBeInTheDocument()

    const codeSnippet = screen.getByText(
      'pytest --cov --junitxml=junit.xml -o junit_family=legacy'
    )
    expect(codeSnippet).toBeInTheDocument()
  })

  it('renders Vitest when clicked', async () => {
    const { user } = setup()
    render(<FrameworkTabs />)

    const vitestButton = screen.getByText('Vitest')
    await user.click(vitestButton)

    expect(vitestButton).toHaveClass('border-b-2 border-ds-gray-octonary')

    const codeSnippet = screen.getByText('vitest --reporter=junit --outputFile=test-report.junit.xml')
    expect(codeSnippet).toBeInTheDocument()
  })

  it('renders Jest when clicked', async () => {
    const { user } = setup()
    render(<FrameworkTabs />)

    const jestButton = screen.getByText('Jest')
    await user.click(jestButton)

    expect(jestButton).toHaveClass('border-b-2 border-ds-gray-octonary')

    const codeSnippet = await screen.findByTestId('jest-framework-copy')
    expect(codeSnippet).toBeInTheDocument()
  })

  it('renders PHPunit when clicked', async () => {
    const { user } = setup()
    render(<FrameworkTabs />)

    const phpunitButton = screen.getByText('PHPunit')
    await user.click(phpunitButton)

    expect(phpunitButton).toHaveClass('border-b-2 border-ds-gray-octonary')

    const codeSnippet = screen.getByText(
      './vendor/bin/phpunit --log-junit junit.xml'
    )
    expect(codeSnippet).toBeInTheDocument()
  })
})
