import type { Meta, StoryObj } from '@storybook/react'

import './Table.css'

function ExampleColumnWidth() {
  return (
    <div className="tableui">
      <table>
        <caption>A basic html example.</caption>
        <colgroup>
          <col className="w-full @sm/table:w-8/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
        </colgroup>
        <thead>
          <tr>
            <th>Filename</th>
            <th data-type="numeric">Lines Missed</th>
            <th data-type="numeric">HEAD %</th>
            <th data-type="numeric">Patch %</th>
            <th data-type="numeric">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>/src/components/Select/Select.tsx</td>
            <td data-type="numeric">789</td>
            <td data-type="numeric">23.5%</td>
            <td data-type="numeric">34%</td>
            <td data-type="numeric">-2.5%</td>
          </tr>
          <tr>
            <td>/src/components/Modal/Modal.tsx</td>
            <td data-type="numeric">789</td>
            <td data-type="numeric">23.5%</td>
            <td data-type="numeric">34%</td>
            <td data-type="numeric">-2.5%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const meta: Meta<typeof ExampleColumnWidth> = {
  title: 'Components/Table',
  component: ExampleColumnWidth,
}

export default meta
type Story = StoryObj<typeof ExampleColumnWidth>

export const ColumnWidthExample: Story = {
  render: () => <ExampleColumnWidth />,
}
