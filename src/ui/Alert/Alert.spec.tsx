import { render, screen } from '@testing-library/react'

import { Alert } from './Alert'

describe('Alert', () => {
  it('renders arbitrary child', async () => {
    render(<Alert>hello</Alert>)
    const hello = await screen.findByText('hello')
    const icon = await screen.findByRole('img')
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
      const icon = await screen.findByRole('img')
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
      const icon = await screen.findByRole('img')
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
      const icon = await screen.findByRole('img')
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(icon).toBeInTheDocument()
    })
  })
})
