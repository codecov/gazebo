import { render, screen } from '@testing-library/react'

import { Card } from './Card'

describe('Card', () => {
  it('renders arbitrary child', async () => {
    render(<Card>hello</Card>)
    const hello = await screen.findByText('hello')
    expect(hello).toBeInTheDocument()
  })

  describe('Card.Header', () => {
    it('renders', async () => {
      render(
        <Card>
          <Card.Header>Header</Card.Header>
        </Card>
      )
      const header = await screen.findByText('Header')
      expect(header).toBeInTheDocument()
    })
  })

  describe('Card.Title', () => {
    it('renders', async () => {
      render(
        <Card>
          <Card.Header>
            <Card.Title>Title</Card.Title>
          </Card.Header>
        </Card>
      )
      const title = await screen.findByText('Title')
      expect(title).toBeInTheDocument()
    })
  })

  describe('Card.Description', () => {
    it('renders', async () => {
      render(
        <Card>
          <Card.Header>
            <Card.Description>Description</Card.Description>
          </Card.Header>
        </Card>
      )
      const description = await screen.findByText('Description')
      expect(description).toBeInTheDocument()
    })
  })

  describe('Card.Content', () => {
    it('renders', async () => {
      render(
        <Card>
          <Card.Content>Content</Card.Content>
        </Card>
      )
      const content = await screen.findByText('Content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Card.Footer', () => {
    it('renders', async () => {
      render(
        <Card>
          <Card.Footer>Footer</Card.Footer>
        </Card>
      )
      const footer = await screen.findByText('Footer')
      expect(footer).toBeInTheDocument()
    })
  })
})
