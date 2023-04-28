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

export const DefaultCodeRendererInfoRow = {
  render: Template,
}

export default {
  title: 'Components/CodeRenderer/CodeRendererInfoRow',
  component: CodeRendererInfoRow,
}
