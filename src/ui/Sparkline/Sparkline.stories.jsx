import Sparkline from './Sparkline'

const Template = (args) => (
  <div className="flex h-[50px] w-[50%]">
    {/* Sparkline conforms to the width and height of it's parent.  */}
    <Sparkline {...args} />
  </div>
)
const ManyTemplate = (args) => {
  const range = 200
  const largeDataSetWithReusedData = Array(50)
    .fill()
    .map(() => Math.random() * range)
  return (
    <>
      {Array(50)
        .fill()
        .map((_, i) => {
          return (
            <div key={`short-${i}`} className="flex h-[20px] w-[100%]">
              <Sparkline {...args} datum={largeDataSetWithReusedData} />
            </div>
          )
        })}
    </>
  )
}

const range = 200
const createTestData = Array(20)
  .fill()
  .map(() => Math.random() * range - range / 2)

export const NormalSparkline = {
  render: Template,

  args: {
    datum: createTestData,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
}

const createTestDataWMissing = Array(30)
  .fill()
  .map(() => (Math.random() > 0.4 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingData = {
  render: Template,

  args: {
    datum: createTestDataWMissing,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
}

const createTestDataWMissingBeginning = Array(7)
  .fill()
  .map((_, i) => (i > 2 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataBeginning = {
  render: Template,

  args: {
    datum: createTestDataWMissingBeginning,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
}

const createTestDataWMissingEnding = Array(20)
  .fill()
  .map((_, i) => (i < 18 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataEnding = {
  render: Template,

  args: {
    datum: createTestDataWMissingEnding,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
}

const createTestDataComplex = Array(10)
  .fill()
  .map((_) => ({ value: Math.random() * range - range / 2, foo: 'bar' }))

export const SparklineWithComplexData = {
  render: Template,

  args: {
    datum: createTestDataComplex,
    select: (d) => d?.value,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
  },
}

export const SparklineCustomLineWidth = {
  render: Template,

  args: {
    datum: createTestData,
    description: 'storybook sparkline',
    dataTemplate: (d) => `Foo ${d}%`,
    lineSize: 2,
  },
}

export const ManySparklines = {
  render: ManyTemplate,

  args: {
    description: 'storybook sparkline',
    dataTemplate: (d) => `${d}%`,
  },
}

export default {
  title: 'Components/Sparkline',
  component: Sparkline,
  parameters: {},
}
