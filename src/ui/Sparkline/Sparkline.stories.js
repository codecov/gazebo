import Sparkline from './Sparkline'

const Template = (args) => (
  <div className="w-[50%] h-[50px] flex">
    <Sparkline {...args} />
  </div>
)

const range = 200
const createTestData = Array(20)
  .fill()
  .map(() => Math.random() * range - range / 2)

export const NormalSparkline = Template.bind({})
NormalSparkline.args = {
  datum: createTestData,
  description: 'storybook sparkline',
  datumDescriptor: 'Foo',
}

const createTestDataWMissing = Array(20)
  .fill()
  .map(() => (Math.random() > 0.4 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingData = Template.bind({})
SparklineWithMissingData.args = {
  datum: createTestDataWMissing,
  description: 'storybook sparkline',
  datumDescriptor: 'Foo',
}

const createTestDataWMissingBeginning = Array(20)
  .fill()
  .map((_, i) => (i > 2 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataBeginning = Template.bind({})
SparklineWithMissingDataBeginning.args = {
  datum: createTestDataWMissingBeginning,
  description: 'storybook sparkline',
  datumDescriptor: 'Foo',
}

const createTestDataWMissingEnding = Array(20)
  .fill()
  .map((_, i) => (i < 18 ? Math.random() * range - range / 2 : null))

export const SparklineWithMissingDataEnding = Template.bind({})
SparklineWithMissingDataEnding.args = {
  datum: createTestDataWMissingEnding,
  description: 'storybook sparkline',
  datumDescriptor: 'Foo',
}

const createTestDataComplex = Array(20)
  .fill()
  .map((_, i) => ({ value: Math.random() * range - range / 2, foo: 'bar' }))

export const SparklineWithComplexData = Template.bind({})
SparklineWithComplexData.args = {
  datum: createTestDataComplex,
  select: (d) => d?.value,
  description: 'storybook sparkline',
  datumDescriptor: 'Foo',
}

export default {
  title: 'Components/Sparkline',
  component: Sparkline,
  parameters: {},
}
