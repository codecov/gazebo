import ControlGroup from './ControlGroup'
import TextInput from 'old_ui/TextInput'
import Select from 'old_ui/Select'
import Button from 'old_ui/Button'

// Due to responsive issues and class name priority items are left to set their own flex property.
const className = 'flex-1'

export const EampleControlGroup = () => (
  <ControlGroup>
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
    <TextInput className={className} placeholder="Text" />
  </ControlGroup>
)

export const EampleControlGroup2 = () => (
  <ControlGroup>
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
  </ControlGroup>
)

export const EampleControlGroup3 = () => (
  <ControlGroup>
    <Button className={className}>Button A</Button>
    <Button className={className} color="gray">
      Button B
    </Button>
    <Select
      className={className}
      items={[`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]}
    />
  </ControlGroup>
)

export const EampleControlGroup4 = () => (
  <ControlGroup>
    <TextInput className={className} placeholder="First" />
    <TextInput className={className} placeholder="Second" />
  </ControlGroup>
)

export default {
  title: 'old_ui/Components/ControlGroup',
  component: ControlGroup,
  decorators: [
    (Story) => (
      <div style={{ background: '#eee', padding: '4rem' }}>
        <Story />
      </div>
    ),
  ],
}
