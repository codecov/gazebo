import { render, screen } from '@testing-library/react'

import { Alert, AlertOptions } from './Alert'

describe('Alert', () => {
  it('renders arbitrary child', async () => {
    render(<Alert>hello</Alert>)

    const hello = await screen.findByText('hello')
    expect(hello).toBeInTheDocument()

    const icon = screen.getByTestId('informationCircle')
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
      expect(description).toBeInTheDocument()

      const icon = screen.getByTestId('informationCircle')
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
      expect(title).toBeInTheDocument()

      const icon = screen.getByTestId('informationCircle')
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
      expect(title).toBeInTheDocument()

      const description = await screen.findByText('Description')
      expect(description).toBeInTheDocument()

      const icon = screen.getByTestId('informationCircle')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Variant Icons', () => {
    it('renders default', async () => {
      render(<Alert>Blah</Alert>)

      const icon = screen.getByTestId('informationCircle')
      expect(icon).toBeInTheDocument()
    })

    it('renders warning', async () => {
      render(<Alert variant={AlertOptions.WARNING}>Blah</Alert>)

      const icon = screen.getByTestId('exclamationTriangle')
      expect(icon).toBeInTheDocument()
    })

    it('renders info', async () => {
      render(<Alert variant={AlertOptions.INFO}>Blah</Alert>)

      const icon = screen.getByTestId('informationCircle')
      expect(icon).toBeInTheDocument()
    })

    it('renders error', async () => {
      render(<Alert variant={AlertOptions.ERROR}>Blah</Alert>)

      const icon = screen.getByTestId('xCircle')
      expect(icon).toBeInTheDocument()
    })

    it('renders success', async () => {
      render(<Alert variant={AlertOptions.SUCCESS}>Blah</Alert>)

      const icon = screen.getByTestId('checkCircle')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Icons', () => {
    it('renders the custom icon', async () => {
      render(
        <Alert variant={AlertOptions.INFO} customIconName="speakerphone">
          Some alert here
        </Alert>
      )

      const icon = screen.getByTestId('speakerphone')
      expect(icon).toBeInTheDocument()
    })

    it('does not render the default icon', async () => {
      render(
        <Alert variant={AlertOptions.INFO} customIconName="speakerphone">
          Some alert here
        </Alert>
      )

      const icon = screen.queryByTestId('informationCircle')
      expect(icon).not.toBeInTheDocument()
    })
  })
})
