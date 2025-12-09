'use client';

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  isEnumeratedTable: boolean;
};

export default function Table<T>({
  columns,
  data,
  isEnumeratedTable = false,
}: TableProps<T>) {
  return (
    <div className='w-full overflow-x-auto rounded-box border border-base-content/5 bg-base-100'>
      <table className='table'>
        <thead>
          <tr>
            {isEnumeratedTable && <th />}
            {columns.map(({ key, label }) => (
              <th key={key.toString()}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {isEnumeratedTable && <th>{index++}</th>}
              {columns.map(({ key, render }) => (
                <td key={key.toString()} className='max-w-5 truncate'>
                  {render ? render(item) : (item as any)[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
