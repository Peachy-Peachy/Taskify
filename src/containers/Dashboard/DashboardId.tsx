import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  DragStart,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';
import useRequest from '@/hooks/useRequest';
import { ColumnsAtom } from '@/store/columnsAtom';
import { openModal } from '@/store/modalAtom';
import { CardProps, ColumnProps, ColumnsProps } from '@/pages/api/mock';
import AddChip from '@/components/chips/AddChip';
import Form from '@/components/modal/Form';
import Modal from '@/components/modal/Modal';
import DashboardColumn from './components/DashboardColumn';

interface DashboardProps {
  id: string;
}

export const changedAtom = atom(false);

function DashboardId({ id }: DashboardProps) {
  const [enabled, setEnabled] = useState(false);
  const [columns, setColumns] = useState<ColumnProps[]>([]);
  const [droppableId, setDroppableId] = useState(0);
  const [movedInfo, setMovedInfo] = useState<[number, number]>([-1, -1]);
  const [cardId, setCardId] = useState('');
  const [changed, setChanged] = useAtom(changedAtom);
  const { columnTitle } = useAtomValue(ColumnsAtom);

  const { data: columnsResponse } = useRequest<ColumnsProps>({
    skip: !id,
    options: {
      url: `columns?dashboardId=${id}`,
      method: 'get',
    },
    deps: [id, columnTitle],
  });

  const { fetch: putCardData } = useRequest<CardProps>({
    skip: true,
    options: {
      url: `cards/${cardId}`,
      method: 'put',
    },
  });

  const onDragStart = ({ draggableId, type }: DragStart) => {
    if (type === 'card') {
      setCardId(draggableId);
    }
  };

  const onDragEnd = async ({ source, destination, type }: DropResult) => {
    if (!destination) return;

    if (type === 'column') {
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;
      const _items = JSON.parse(JSON.stringify(columns)) as typeof columns;
      const [targetItem] = _items.splice(source.index, 1);
      _items.splice(destination.index, 0, targetItem);
      setColumns(_items);
    }

    if (type === 'card') {
      if (destination.droppableId === source.droppableId) {
        setDroppableId(Number(destination.droppableId));
        setMovedInfo([source.index, destination.index]);
        return;
      }
      await putCardData({
        data: { columnId: Number(destination.droppableId) },
      });
      setChanged(!changed);
    }
  };

  useEffect(() => {
    if (!columnsResponse || !id) return;
    setColumns(columnsResponse.data);
  }, [columnsResponse]);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  if (columns.length === 0) return;

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable
        droppableId={'all-columns'}
        direction={window.innerWidth > 1200 ? 'horizontal' : 'vertical'}
        type='column'
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={
              'relative flex min-h-screen min-w-fit flex-col pc:flex-row'
            }
          >
            {columns.map((column, index) => (
              <DashboardColumn
                movedInfo={droppableId === column.id ? movedInfo : [-1, -1]}
                changed={changed}
                columnId={column.id}
                title={column.title}
                key={column.id}
                index={index}
              />
            ))}
            {provided.placeholder}
            <AddColumnButton />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default DashboardId;

function AddColumnButton() {
  const [, open] = useAtom(openModal);

  const handleEditModal = () => {
    open('addColumn');
  };
  return (
    <Modal>
      <>
        <Modal.Open opens='addColumn'>
          <button
            className='card flex-center m-12 max-w-full gap-10 p-20 tablet:m-20 tablet:h-70 pc:mt-67 pc:w-354 pc:border-r'
            onClick={handleEditModal}
          >
            <p className='subheading-bold'>새로운 컬럼 추가하기</p>
            <AddChip />
          </button>
        </Modal.Open>
        <Modal.Window name='addColumn'>
          <Form>
            <Form.ColumnForm />
          </Form>
        </Modal.Window>
      </>
    </Modal>
  );
}
