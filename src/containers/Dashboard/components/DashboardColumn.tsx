import { useAtom, useAtomValue } from 'jotai';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { CardProps, CardsProps } from 'src/types';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useRequest from '@/hooks/useRequest';
import { CardStateAtom } from '@/store/createCardAtom';
import { closeAllModals, openModal } from '@/store/modalAtom';
import Card from '@/components/Card';
import DashboardColorDot from '@/components/DashboardColorDot';
import AddChip from '@/components/chips/AddChip';
import NumberChip from '@/components/chips/NumberChip';
import Confirm from '@/components/modal/Confirm';
import Form from '@/components/modal/Form';
import { EditCardButton } from '@/components/modal/FormComponents/CardViewDetail';
import Modal from '@/components/modal/Modal';
import { IconSettings } from '@/public/svgs';

interface Props {
  movedInfo: [number, number];
  changed: boolean;
  title: string;
  columnId: number;
  index: number;
}

function DashboardColumn({
  movedInfo,
  changed,
  title,
  columnId,
  index,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [currentCursorId, setCurrentCursorId] = useState(0);
  const [list, setList] = useState<CardProps[]>([]);
  const isCreateCard = useAtomValue(CardStateAtom);
  const INITIAL_SIZE = 10;
  const SIZE = 5;

  const { data: initialCardList, fetch } = useRequest<CardsProps>({
    deps: [columnId, changed, isCreateCard.isCreateCard],
    skip: !columnId,
    options: {
      url: `cards`,
      params: { columnId: columnId, size: INITIAL_SIZE },
      method: 'get',
    },
  });

  const { data: cardList } = useRequest<CardsProps>({
    deps: [columnId, currentCursorId],
    skip: !currentCursorId,
    options: {
      url: `cards`,
      params: { columnId: columnId, size: SIZE, cursorId: currentCursorId },
      method: 'get',
    },
  });

  const handleClick = () => {
    if (!cardList || !cardList.cards) return;
    setCurrentCursorId(cardList.cursorId);
    setList((prev) => [...prev, ...cardList.cards]);
    if (cardList.cursorId === currentCursorId || cardList.cards.length < SIZE) {
      setVisible(false);
      return;
    }
  };

  const containerRef = useInfiniteScroll({
    handleScroll: handleClick,
    deps: [initialCardList, cardList],
  });

  useEffect(() => {
    if (movedInfo[0] === -1) {
      fetch();
      return;
    }
    const _items = JSON.parse(JSON.stringify(list)) as typeof list;
    const [targetItem] = _items.splice(movedInfo[0], 1);
    _items.splice(movedInfo[1], 0, targetItem);
    setList(_items);
  }, [movedInfo]);

  useEffect(() => {
    if (!initialCardList) return;
    setList(initialCardList.cards);
    setCurrentCursorId(initialCardList.cursorId);
    initialCardList.totalCount < INITIAL_SIZE
      ? setVisible(false)
      : setVisible(true);
  }, [initialCardList]);

  if (!initialCardList || initialCardList.cards === undefined) return;

  return (
    <Draggable key={columnId} draggableId={String(columnId)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={
            snapshot.isDragging ? 'bg-opacity-60 shadow-2xl shadow-gray-4' : ''
          }
        >
          <div
            {...provided.dragHandleProps}
            className='flex min-h-full w-full flex-col border-gray-2 pc:w-354 pc:border-r'
          >
            <ColumnInfo
              title={title}
              totalCount={initialCardList.totalCount}
              columnId={columnId}
            />
            <AddCardButton columnId={columnId} list={list} setList={setList} />
            <Droppable droppableId={String(columnId)} type='card'>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className='flex grow flex-col gap-10 border-b border-gray-2 px-12 pb-12 tablet:gap-16 tablet:px-20 tablet:pb-20 pc:border-b-0'
                >
                  {initialCardList.totalCount !== 0 &&
                    list.map((card: CardProps, index: number) => {
                      return (
                        <Card
                          data={card}
                          key={index}
                          title={title}
                          index={index}
                        />
                      );
                    })}
                  {provided.placeholder}
                  {visible && <SeeMore handleClick={handleClick} />}
                  {visible && (
                    <div ref={containerRef} className='hidden h-10 pc:inline' />
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default DashboardColumn;

function ColumnInfo({
  title,
  totalCount,
  columnId,
}: {
  title: string;
  totalCount: number;
  columnId: number;
}) {
  return (
    <>
      <div className='flex w-full items-center justify-between py-5 pr-12 tablet:py-20 tablet:pl-8 tablet:pr-20'>
        <div className='flex items-center'>
          <DashboardColorDot color='#5534DA' />
          <p className='subheading-bold pr-12 tablet:pr-20'>{title}</p>
          <NumberChip num={totalCount} />
        </div>
        <ManageButton title={title} columnId={columnId} />
      </div>
      <div className='absolute'>
        <DeleteCardButton columnId={columnId} isHidden={true} />
        <EditCardButton columnId={columnId} isHidden={false} />
      </div>
    </>
  );
}

function AddCardButton({
  columnId,
}: {
  columnId: number;
  list: CardProps[];
  setList: Dispatch<SetStateAction<CardProps[]>>;
}) {
  const [, open] = useAtom(openModal);
  const handleCreateModal = () => {
    open(`addCard${columnId}`);
  };
  return (
    <Modal>
      <>
        <Modal.Open opens={`addCard${columnId}`}>
          <button
            className='card flex-center mx-12 mb-10 py-6 tablet:mx-20 tablet:mb-16 tablet:py-9'
            onClick={handleCreateModal}
          >
            <AddChip />
          </button>
        </Modal.Open>
        <Modal.Window name={`addCard${columnId}`}>
          <Form>
            <Form.TodoForm type='create' columnId={columnId} />
          </Form>
        </Modal.Window>
      </>
    </Modal>
  );
}

interface ManageButtonType {
  title: string;
  columnId: number;
}

function ManageButton({ title, columnId }: ManageButtonType) {
  const [, open] = useAtom(openModal);

  const handleEditModal = () => {
    open(`edit${columnId}`);
  };
  return (
    <Modal>
      <>
        <Modal.Open opens={`edit${columnId}`}>
          <button onClick={handleEditModal}>
            <IconSettings />
          </button>
        </Modal.Open>
        <Modal.Window name={`edit${columnId}`}>
          <Form>
            <Form.ColumnForm
              type='edit'
              columnName={title}
              columnId={columnId}
            />
          </Form>
        </Modal.Window>
      </>
    </Modal>
  );
}

export function DeleteCardButton({
  columnId,
  isHidden: isNone,
}: {
  columnId?: number;
  isHidden: boolean;
}) {
  const [, open] = useAtom(openModal);
  const [, closeAll] = useAtom(closeAllModals);

  const handleDeleteModal = () => {
    closeAll();
    open(`delete${columnId}`);
  };

  return (
    <Modal>
      <>
        <Modal.Open opens={`delete${columnId}`}>
          <button
            type='button'
            className={`absolute bottom-0 left-0 text-14 text-gray-4 underline  ${
              isNone && '-z-base opacity-0'
            }`}
            onClick={handleDeleteModal}
          >
            삭제하기
          </button>
        </Modal.Open>
        <Modal.Window name={`delete${columnId}`}>
          <Confirm>
            <Confirm.DeleteConfirm columnId={columnId} />
          </Confirm>
        </Modal.Window>
      </>
    </Modal>
  );
}

function SeeMore({ handleClick }: { handleClick: () => void }) {
  return (
    <div className='flex w-full justify-end pc:hidden'>
      <button
        onClick={handleClick}
        className='body2-bold w-fit px-5 text-gray-5 hover:underline'
      >
        더보기
      </button>
    </div>
  );
}
