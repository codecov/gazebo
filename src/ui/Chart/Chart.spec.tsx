import { render, screen, within } from '@testing-library/react'
import { Area, AreaChart } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
  getPayloadConfigFromPayload,
} from './Chart'

declare global {
  interface Window {
    ResizeObserver: unknown
  }
}

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  }
})

const chartData = [
  { month: new Date('01/01/2024').toISOString(), coverage: 100 },
  { month: new Date('02/01/2024').toISOString(), coverage: 200 },
  { month: new Date('03/01/2024').toISOString(), coverage: 450 },
  { month: new Date('04/01/2024').toISOString(), coverage: 400 },
  { month: new Date('05/01/2024').toISOString(), coverage: 500 },
  { month: new Date('06/01/2024').toISOString(), coverage: 900 },
]

const chartConfig = {
  coverage: {
    label: 'Coverage',
    color: 'hsl(var(--chart-area-bundle-tab))',
  },
} satisfies ChartConfig

describe('Chart', () => {
  let resizeObserverMock: jest.Mock<any, any>
  let oldConsoleWarn = console.warn

  beforeEach(() => {
    console.warn = () => null

    /**
     * ResizeObserver is not available, so we have to create a mock to avoid error coming
     * from `react-resize-detector`.
     * @see https://github.com/maslianok/react-resize-detector/issues/145
     *
     * This mock also allow us to use {@link notifyResizeObserverChange} to fire changes
     * from inside our test.
     */
    resizeObserverMock = jest.fn().mockImplementation((callback) => {
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }
    })

    // @ts-ignore
    delete window.ResizeObserver

    window.ResizeObserver = resizeObserverMock
  })

  afterEach(() => {
    console.warn = oldConsoleWarn
  })

  describe('ChartLegend', () => {
    describe('there is a payload', () => {
      it('renders the legend', () => {
        render(
          <ChartContainer config={chartConfig} className="size-[200px]">
            <AreaChart
              data={chartData}
              accessibilityLayer
              width={100}
              height={100}
            >
              <ChartLegend
                content={<ChartLegendContent nameKey="coverage" />}
              />
              <Area
                dataKey="coverage"
                type="linear"
                fillOpacity={0.4}
                fill="var(--color-coverage)"
                stroke="var(--color-coverage)"
              />
            </AreaChart>
          </ChartContainer>
        )

        const legend = screen.getByTestId('chart-legend-content')
        const coverage = within(legend).getByText('Coverage')

        expect(coverage).toBeInTheDocument()
      })
    })

    describe('there is no payload', () => {
      it('does not render the legend', () => {
        render(
          <ChartContainer config={{}} className="size-[200px]">
            <AreaChart data={[]} accessibilityLayer width={100} height={100}>
              <ChartLegend
                content={<ChartLegendContent nameKey="coverage" />}
              />
            </AreaChart>
          </ChartContainer>
        )

        const legend = screen.queryByTestId('chart-legend-content')
        expect(legend).not.toBeInTheDocument()
      })
    })
  })

  describe('ChartTooltipContent', () => {
    describe('there is a payload', () => {
      describe('tooltip is active', () => {
        it('renders tooltip', async () => {
          render(
            <ChartContainer config={chartConfig} className="size-[400px]">
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(date: string) => date}
                active={true}
                payload={[
                  {
                    stroke: 'var(--color-coverage)',
                    dataKey: 'coverage',
                    name: 'coverage',
                    color: 'var(--color-coverage)',
                    value: 45,
                    payload: {
                      month: '2024-03-01T04:00:00.000Z',
                      coverage: 45,
                    },
                    hide: false,
                  },
                ]}
              />
            </ChartContainer>
          )

          const datalist = screen.getByTestId('chart-tooltip-datalist')
          const coverage = within(datalist).getByText('Coverage')
          expect(coverage).toBeInTheDocument()
        })
      })

      describe('tooltip is not active', () => {
        it('does not render tooltip', () => {
          render(
            <ChartContainer config={chartConfig} className="size-[400px]">
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(date: string) => date}
                active={false}
                payload={[
                  {
                    stroke: 'var(--color-coverage)',
                    dataKey: 'coverage',
                    name: 'coverage',
                    color: 'var(--color-coverage)',
                    value: 45,
                    payload: {
                      month: '2024-03-01T04:00:00.000Z',
                      coverage: 45,
                    },
                    hide: false,
                  },
                ]}
              />
            </ChartContainer>
          )

          const datalist = screen.queryByTestId('chart-tooltip-datalist')
          expect(datalist).not.toBeInTheDocument()
        })
      })
    })

    describe('there is no payload', () => {
      describe('tooltip is not active', () => {
        it('does not render tooltip', () => {
          render(
            <ChartContainer config={chartConfig} className="size-[400px]">
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(date: string) => date}
                active={false}
                payload={[]}
              />
            </ChartContainer>
          )

          const datalist = screen.queryByTestId('chart-tooltip-datalist')
          expect(datalist).not.toBeInTheDocument()
        })
      })
    })

    describe('tooltip label', () => {
      describe('there is a label formatter', () => {
        it('renders the label using the formatter', () => {
          render(
            <ChartContainer config={chartConfig} className="size-[400px]">
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(date: string) => `Formatted ${date}`}
                active={true}
                payload={[
                  {
                    stroke: 'var(--color-coverage)',
                    dataKey: 'coverage',
                    name: 'coverage',
                    color: 'var(--color-coverage)',
                    value: 45,
                    payload: {
                      month: '2024-03-01T04:00:00.000Z',
                      coverage: 45,
                    },
                    hide: false,
                  },
                ]}
              />
            </ChartContainer>
          )

          const formatted = screen.getByText(/Formatted/)
          expect(formatted).toBeInTheDocument()
        })
      })

      describe('there is no label formatter', () => {
        it('just renders the config label', () => {
          render(
            <ChartContainer config={chartConfig} className="size-[400px]">
              <ChartTooltipContent
                indicator="dot"
                active={true}
                payload={[
                  {
                    stroke: 'var(--color-coverage)',
                    dataKey: 'coverage',
                    name: 'coverage',
                    color: 'var(--color-coverage)',
                    value: 45,
                    payload: {
                      month: '2024-03-01T04:00:00.000Z',
                      coverage: 45,
                    },
                    hide: false,
                  },
                ]}
              />
            </ChartContainer>
          )

          const label = screen.getByText(/45/)
          expect(label).toBeInTheDocument()
        })
      })

      describe('there is no value', () => {
        it('renders the config label key', () => {
          render(
            <ChartContainer
              config={{
                coverage: {
                  color: 'hsl(var(--chart-area-bundle-tab))',
                },
              }}
              className="size-[400px]"
            >
              <ChartTooltipContent
                indicator="dot"
                active={true}
                payload={[
                  {
                    stroke: 'var(--color-coverage)',
                    dataKey: 'coverage',
                    name: 'coverage',
                    color: 'var(--color-coverage)',
                    value: 45,
                    payload: {
                      month: '2024-03-01T04:00:00.000Z',
                      coverage: null,
                    },
                    hide: false,
                  },
                ]}
              />
            </ChartContainer>
          )

          const label = screen.getByText(/coverage/i)
          expect(label).toBeInTheDocument()
        })
      })
    })
  })

  describe('chart is not wrapped in a container', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws an error', () => {
      let error

      try {
        render(
          <AreaChart data={[]} accessibilityLayer width={100} height={100}>
            <ChartLegend content={<ChartLegendContent nameKey="coverage" />} />
          </AreaChart>
        )
        // @ts-expect-error - believe me ... it's an error
      } catch (e: Error) {
        error = e
      }

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(
        'useChart must be used within a <ChartContainer />'
      )
    })
  })

  describe('getPayloadConfigFromPayload', () => {
    describe('payload is not an object', () => {
      it('returns undefined', () => {
        const response = getPayloadConfigFromPayload({}, 'coverage', 'key')
        expect(response).toBeUndefined()
      })
    })

    describe('payload is null', () => {
      it('returns undefined', () => {
        const response = getPayloadConfigFromPayload({}, null, 'key')
        expect(response).toBeUndefined()
      })
    })

    describe('payload not in payload', () => {
      it('returns something', () => {
        const response = getPayloadConfigFromPayload(chartConfig, {}, 'key')

        expect(response).toBeUndefined()
      })
    })

    describe('key in payload', () => {
      it('returns something', () => {
        const response = getPayloadConfigFromPayload(
          chartConfig,
          { customKey: 'coverage' },
          'customKey'
        )

        expect(response).toEqual({
          color: 'hsl(var(--chart-area-bundle-tab))',
          label: 'Coverage',
        })
      })
    })

    describe('payload is in payload', () => {
      it('returns something', () => {
        const response = getPayloadConfigFromPayload(
          chartConfig,
          { payload: { customKey: 'coverage' } },
          'customKey'
        )

        expect(response).toEqual({
          color: 'hsl(var(--chart-area-bundle-tab))',
          label: 'Coverage',
        })
      })
    })
  })
})
