import 'ui/Table/Table.css'

const EmptyTable: React.FC = () => {
  return (
    <div className="tableui">
      <table className="!border-t-0">
        <colgroup>
          <col className="w-full @sm/table:w-8/12" />
          <col className="@sm/table:w-2/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <thead>
          <tr>
            <th>Bundle name</th>
            <th>
              <div className="flex flex-row-reverse justify-end">
                Current size
              </div>
            </th>
            <th>
              <div className="flex flex-row-reverse justify-end">
                Estimated load time (3G)
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>-</td>
            <td>
              <div className="flex flex-row-reverse">-</div>
            </td>
            <td>
              <div className="flex flex-row-reverse">-</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default EmptyTable
