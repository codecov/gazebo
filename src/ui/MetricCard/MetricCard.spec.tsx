import { render, screen } from '@testing-library/react'

import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
  it('renders arbitrary child content', () => {
    render(<MetricCard>Test Content</MetricCard>)
    const content = screen.getByText('Test Content')
    expect(content).toBeInTheDocument()
  })

  describe('MetricCard.Header', () => {
    it('renders the header', () => {
      render(
        <MetricCard>
          <MetricCard.Header>Header Content</MetricCard.Header>
        </MetricCard>
      )
      const header = screen.getByText('Header Content')
      expect(header).toBeInTheDocument()
    })
  })

  describe('MetricCard.Title', () => {
    it('renders the title', () => {
      render(
        <MetricCard>
          <MetricCard.Header>
            <MetricCard.Title>Title Content</MetricCard.Title>
          </MetricCard.Header>
        </MetricCard>
      )
      const title = screen.getByText('Title Content')
      expect(title).toBeInTheDocument()
    })
  })

  describe('MetricCard.Content', () => {
    it('renders the content', () => {
      render(
        <MetricCard>
          <MetricCard.Content>1000</MetricCard.Content>
        </MetricCard>
      )
      const content = screen.getByText('1000')
      expect(content).toBeInTheDocument()
    })

    it('renders content with badge', () => {
      render(
        <MetricCard>
          <MetricCard.Content>
            1000 <span>+10%</span>
          </MetricCard.Content>
        </MetricCard>
      )
      const content = screen.getByText('1000')
      const badge = screen.getByText('+10%')
      expect(content).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
    })
  })

  describe('MetricCard.Description', () => {
    it('renders the description', () => {
      render(
        <MetricCard>
          <MetricCard.Description>Description Content</MetricCard.Description>
        </MetricCard>
      )
      const description = screen.getByText('Description Content')
      expect(description).toBeInTheDocument()
    })
  })
})
