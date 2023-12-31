import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useRequest from '@/hooks/useRequest';
import { IconArrowDown, IconCheck } from '@/public/svgs';

interface Column {
  id: number;
  title: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  isDone: boolean;
}

function StateDropdown({
  handleSetState,
  stateId,
}: {
  handleSetState: (value: number) => void;
  stateId?: number;
}) {
  const router = useRouter();
  const { dashboardId } = router.query;

  const { data } = useRequest({
    skip: false,
    options: {
      url: 'columns',
      method: 'get',
      params: { dashboardId: dashboardId as string },
    },
  });

  const [columnList, setColumnList] = useState<Column[]>([]);
  const [isDrop, setIsDrip] = useState(false);
  const [columnName, setColumnName] = useState('');

  useEffect(() => {
    if (!data) return;

    const { data: columns } = data as { data: Column[] };
    const newColumns =
      columns.length > 0
        ? columns.map((column: Column) => {
            return column.id === stateId
              ? { ...column, isDone: true }
              : { ...column, isDone: false };
          })
        : [];

    setColumnList([...newColumns]);
    if (stateId) {
      const selectedColumn = newColumns.find((column) => column.id === stateId);

      setColumnName(selectedColumn ? selectedColumn.title : '');
    } else {
      setColumnName(newColumns[0].title);
      handleSetState(newColumns[0].id);
    }
  }, [data]);

  const handleClickBox = () => {
    setIsDrip(!isDrop);
  };

  const handleClickList = (e: React.MouseEvent<HTMLLIElement>, id: number) => {
    setIsDrip(!isDrop);

    const { textContent } = e.currentTarget;
    if (textContent) {
      setColumnName(textContent);
      handleSetState(id);
    }

    const newColumnList = columnList.map((column) => {
      return column.id === id
        ? { ...column, isDone: true }
        : { ...column, isDone: false };
    });

    setColumnList([...newColumnList]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsDrip(false);
    }, 200);
  };

  return (
    <div className='flex w-287 flex-col justify-start gap-10 tablet:w-217'>
      <h2 className='subheading-normal'>상태</h2>
      <div className='relative' onBlur={handleBlur} tabIndex={0}>
        <div
          className={` flex h-48 w-full items-center justify-between rounded-md bg-WHITE p-16 ${
            isDrop ? 'border-solid-primary' : 'border-solid-gray'
          } cursor-pointer`}
          onClick={handleClickBox}
        >
          <span>{columnName}</span>
          <IconArrowDown />
        </div>
        <ul
          className={`border-solid-gray absolute left-0 ${
            isDrop ? 'top-50' : 'top-46 z-[-1] opacity-0'
          } flex w-full flex-col items-start justify-between gap-13 rounded-md bg-white p-8 transition-all duration-100`}
        >
          {columnList.map((column) => {
            return (
              <li
                className='body1-normal flex w-full cursor-pointer items-start justify-start gap-6 rounded-sm hover:bg-gray-2'
                key={column.id}
                onClick={(e) => handleClickList(e, column.id)}
              >
                {column.isDone ? (
                  <IconCheck fill='black' />
                ) : (
                  <div className='w-22'></div>
                )}
                {column.title}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default StateDropdown;
