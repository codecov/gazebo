import { render, screen } from '@testing-library/react'

import { Alert, AlertOptions } from './Alert'

describe('Alert', () => {
  it('renders arbitrary child', async () => {
    render(<Alert>hello</Alert>)
    const hello = await screen.findByText('hello')
    const icon = screen.getByText('information-circle.svg')
    expect(hello).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
  })

  describe('Alert.Description', () => {
    it('renders', async () => {
      render(
        <Alert>
          <Alert.Description>Description</Alert.Description>
        </Alert>
      )
      const description = await screen.findByText('Description')
      const icon = screen.getByText('information-circle.svg')
      expect(description).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Alert.Title', () => {
    it('renders', async () => {
      render(
        <Alert>
          <Alert.Title>Title</Alert.Title>
        </Alert>
      )
      const title = await screen.findByText('Title')
      const icon = screen.getByText('information-circle.svg')
      expect(title).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Both', () => {
    it('renders', async () => {
      render(
        <Alert>
          <Alert.Title>Title</Alert.Title>
          <Alert.Description>Description</Alert.Description>
        </Alert>
      )
      const title = await screen.findByText('Title')
      const description = await screen.findByText('Description')
      const icon = screen.getByText('information-circle.svg')
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Variant Icons', () => {
    it('renders default', async () => {
      render(<Alert>Blah</Alert>)
      const icon = screen.getByText('information-circle.svg')
      expect(icon).toBeInTheDocument()
    })
    it('renders warning', async () => {
      render(<Alert variant={AlertOptions.WARNING}>Blah</Alert>)
      const icon = screen.getByText('exclamation-triangle.svg')
      expect(icon).toBeInTheDocument()
    })
    it('renders info', async () => {
      render(<Alert variant={AlertOptions.INFO}>Blah</Alert>)
      const icon = screen.getByText('information-circle.svg')
      expect(icon).toBeInTheDocument()
    })
    it('renders error', async () => {
      render(<Alert variant={AlertOptions.ERROR}>Blah</Alert>)
      const icon = screen.getByText('x-circle.svg')
      expect(icon).toBeInTheDocument()
    })
    it('renders success', async () => {
      render(<Alert variant={AlertOptions.SUCCESS}>Blah</Alert>)
      const icon = screen.getByText('check-circle.svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Icons', () => {
    const alert = (
      <Alert variant={AlertOptions.INFO} customIconName="speakerphone">
        Some alert here
      </Alert>
    )
    it('renders the custom icon', async () => {
      render(alert)
      const icon = screen.queryByText('speakerphone.svg')
      expect(icon).toBeInTheDocument()
    })

    it('does not render the default icon', async () => {
      render(alert)
      const icon = screen.queryByText('information-circle.svg')
      expect(icon).not.toBeInTheDocument()
    })
  })
})
