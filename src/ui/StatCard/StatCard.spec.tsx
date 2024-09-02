import { render, screen } from '@testing-library/react'

import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders arbitrary child content', () => {
    render(<StatCard>Test Content</StatCard>)
    const content = screen.getByText('Test Content')
    expect(content).toBeInTheDocument()
  })

  describe('StatCard.Header', () => {
    it('renders the header', () => {
      render(
        <StatCard>
          <StatCard.Header>Header Content</StatCard.Header>
        </StatCard>
      )
      const header = screen.getByText('Header Content')
      expect(header).toBeInTheDocument()
    })
  })

  describe('StatCard.Title', () => {
    it('renders the title', () => {
      render(
        <StatCard>
          <StatCard.Header>
            <StatCard.Title>Title Content</StatCard.Title>
          </StatCard.Header>
        </StatCard>
      )
      const title = screen.getByText('Title Content')
      expect(title).toBeInTheDocument()
    })
  })

  describe('StatCard.Content', () => {
    it('renders the content', () => {
      render(
        <StatCard>
          <StatCard.Content>1000</StatCard.Content>
        </StatCard>
      )
      const content = screen.getByText('1000')
      expect(content).toBeInTheDocument()
    })

    it('renders content with badge', () => {
      render(
        <StatCard>
          <StatCard.Content>
            1000 <span>+10%</span>
          </StatCard.Content>
        </StatCard>
      )
      const content = screen.getByText('1000')
      const badge = screen.getByText('+10%')
      expect(content).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
    })
  })

  describe('StatCard.Description', () => {
    it('renders the description', () => {
      render(
        <StatCard>
          <StatCard.Description>Description Content</StatCard.Description>
        </StatCard>
      )
      const description = screen.getByText('Description Content')
      expect(description).toBeInTheDocument()
    })
  })
})
