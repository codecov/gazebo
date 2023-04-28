import CheckList from './CheckList'

export const NormalCheckList = {
  args: {
    list: [
      `Fifth Element quotes:`,
      `Listen lady, I only speak two languages: English and bad English.`,
      `Korben, I don't like GUNS, Korben. This ain't me, man.`,
    ],
  },
}

export default {
  title: 'Components/CheckList',
  component: CheckList,
  argTypes: {
    list: { control: 'array' },
  },
}
