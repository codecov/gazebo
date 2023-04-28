import Card from './Card'

export const NormalCard = {
  args: {
    children: 'hello everyone',
  },
}

export const CardWithExtraClass = {
  args: {
    children: 'hello everyone',
    className: 'p4 bg-blue',
  },
}

export default {
  title: 'old_ui/Components/Card',
  component: Card,
}
