import CodeRendererInfoRow from './CodeRendererInfoRow'

const Template = () => {
  return (
    <>
      <CodeRendererInfoRow>
        <p>
          This is the children of the new ui system code renderer info row.
          Lorem Ipsum blah bleh bluh.
        </p>
      </CodeRendererInfoRow>
    </>
  )
}

export const DefaultCodeRendererInfoRow = Template.bind({})

export default {
  title: 'Components/CodeRendererInfoRow',
  component: CodeRendererInfoRow,
}
