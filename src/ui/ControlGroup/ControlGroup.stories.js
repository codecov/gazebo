import ControlGroup from './ControlGroup'
import TextInput from 'ui/TextInput'
import Select from 'ui/Select'
import Button from 'ui/Button'

export const EampleControlGroup = () => (
  <ControlGroup>
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
    <TextInput placeholder="Text" />
  </ControlGroup>
)

export const EampleControlGroup2 = () => (
  <ControlGroup>
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
  </ControlGroup>
)

export const EampleControlGroup3 = () => (
  <ControlGroup>
    <Button>Button A</Button>
    <Button color="gray">Button B</Button>
    <Select items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]} />
  </ControlGroup>
)

export const EampleControlGroup4 = () => (
  <ControlGroup>
    <TextInput placeholder="First" />
    <TextInput placeholder="Second" />
  </ControlGroup>
)

export default {
  title: 'Components/ControlGroup',
  component: ControlGroup,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '4rem' }}>
        <Story />
      </div>
    ),
  ],
}
