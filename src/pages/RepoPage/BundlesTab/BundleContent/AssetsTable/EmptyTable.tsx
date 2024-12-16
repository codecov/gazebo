export const EmptyTable: React.FC = () => {
  return (
    <div className="tableui">
      <table className="!border-t-0">
        <colgroup>
          <col className="w-full @sm/table:w-8/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <thead>
          <tr>
            <th>Asset</th>
            <th>
              <div className="flex flex-row-reverse">Type</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Size</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Est. load time (3G)</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Change over time</div>
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

export const EmptyTableWithFilePath: React.FC = () => {
  return (
    <div className="tableui">
      <table className="!border-t-0">
        <colgroup>
          <col className="w-full @sm/table:w-7/24" />
          <col className="@sm/table:w-3/24" />
          <col className="@sm/table:w-2/24" />
          <col className="@sm/table:w-4/24" />
          <col className="@sm/table:w-4/24" />
          <col className="@sm/table:w-4/24" />
        </colgroup>
        <thead>
          <tr>
            <th>Asset</th>
            <th>
              <div className="flex flex-row-reverse">File path</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Type</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Size</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Est. load time (3G)</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Change over time</div>
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
            <td>
              <div className="flex flex-row-reverse">-</div>
            </td>
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
