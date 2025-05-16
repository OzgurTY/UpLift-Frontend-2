'use client';

import clsx from 'clsx';

type Column = {
  header:   string;
  accessor: string;
  className?: string;
};

type Props<T> = {
  columns:   Column[];
  data:      T[];
  renderRow: (item: T) => React.ReactNode;
};

export default function Table<T>({ columns, data, renderRow }: Props<T>) {
  if (!Array.isArray(data)) {
    // güvenlik: yanlış tip gelirse boş tablo
    data = [];
  }

  return (
    <table className="w-full text-left text-sm border">
      <thead className="bg-gray-50 text-xs uppercase text-gray-600">
        <tr>
          {columns.map(col => (
            <th
              key={col.accessor}
              className={clsx('px-4 py-3 font-medium', col.className)}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>{data.map(item => renderRow(item))}</tbody>
    </table>
  );
}
