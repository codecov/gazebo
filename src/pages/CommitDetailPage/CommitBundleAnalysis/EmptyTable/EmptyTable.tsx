const EmptyTable: React.FC = () => {
  return (
    <div className="tableui">
      <table className="!border-t-0">
        <thead>
          <tr>
            <th>Bundle name</th>
            <th>
              <div className="flex flex-row-reverse">Previous Size</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">New Size</div>
            </th>
            <th>
              <div className="flex flex-row-reverse">Change</div>
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
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default EmptyTable
