import { render, screen } from '@testing-library/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

describe('Card', () => {
  it('renders arbitrary child', async () => {
    render(<Card>hello</Card>)
    const hello = await screen.findByText('hello')
    expect(hello).toBeInTheDocument()
  })

  describe('CardHeader', () => {
    it('renders', async () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      )
      const header = await screen.findByText('Header')
      expect(header).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('renders', async () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = await screen.findByText('Title')
      expect(title).toBeInTheDocument()
    })
  })

  describe('CardDescription', () => {
    it('renders', async () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = await screen.findByText('Description')
      expect(description).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('renders', async () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const content = await screen.findByText('Content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders', async () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      const footer = await screen.findByText('Footer')
      expect(footer).toBeInTheDocument()
    })
  })
})
