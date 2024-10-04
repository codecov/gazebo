import { Meta, StoryObj } from '@storybook/react'

import Sparkline, { SparklineProps } from './Sparkline'

export default {
  title: 'Components/Sparkline',
  component: Sparkline,
} as Meta

const renderTemplate = (args: SparklineProps) => (
  <div className="flex h-[50px] w-1/2">
    {/* Sparkline conforms to the width and height of it's parent.  */}
    <Sparkline {...args} />
  </div>
)

const renderManyTemplate = (args: SparklineProps) => {
  const range = 200
  const largeDataSetWithReusedData = Array(50)
    .fill(0)
    .map(() => Math.random() * range)
  return (
    <>
      {Array(50)
        .fill(0)
        .map((_, i) => {
          return (
            <div key={`short-${i}`} className="flex h-[20px] w-full">
              <Sparkline {...args} datum={largeDataSetWithReusedData} />
            </div>
          )
        })}
    </>
  )
}

type Story = StoryObj<typeof Sparkline>
const range = 200
const createTestData = Array(20)
  .fill(0)
  .map(() => Math.random() * range - range / 2)

export const NormalSparkline: Story = {
  args: {
    datum: createTestData,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

const createTestDataWithMissingValues = Array(30)
  .fill(0)
  .map(() => (Math.random() > 0.4 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingData: Story = {
  args: {
    datum: createTestDataWithMissingValues,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

const createTestDataWithMissingValuesBeginning = Array(7)
  .fill(0)
  .map((_, i) => (i > 2 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataBeginning: Story = {
  args: {
    datum: createTestDataWithMissingValuesBeginning,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

const createTestDataWithMissingValuesEnding = Array(20)
  .fill(0)
  .map((_, i) => (i < 18 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataEnding: Story = {
  args: {
    datum: createTestDataWithMissingValuesEnding,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

const createTestDataComplex = Array(10)
  .fill(0)
  .map((_) => ({ value: Math.random() * range - range / 2, foo: 'bar' }))

export const SparklineWithComplexData: Story = {
  args: {
    datum: createTestDataComplex,
    select: (d) => d?.value,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

export const SparklineCustomLineWidth: Story = {
  args: {
    datum: createTestData,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
    lineSize: 2,
  },
  render: (args) => {
    return renderTemplate(args)
  },
}

export const ManySparklines: Story = {
  args: {
    description: 'storybook sparkline',
    dataTemplate: (d) => `${d}%`,
  },
  render: (args) => {
    return renderManyTemplate(args)
  },
}
