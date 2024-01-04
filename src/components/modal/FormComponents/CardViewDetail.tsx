import { useAtom, useSetAtom } from 'jotai';
import Image from 'next/image';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useRequest from '@/hooks/useRequest';
import { ColumnsAtom } from '@/store/columnsAtom';
import { CommentAtom } from '@/store/commentAtom';
import { closeAllModals, openModal } from '@/store/modalAtom';
import { CardProps } from '@/pages/api/mock';
import { changedAtom } from '@/containers/Dashboard/DashboardId';
import Members from '@/components/Members';
import { Button } from '@/components/buttons';
import StateChip from '@/components/chips/StateChip';
import TagChip from '@/components/chips/TagChip';
import Comments from '@/components/comment/Comments';
import Close from '@/components/icons/Close';
import Kebab from '@/components/icons/Kebab';
import Input from '@/components/inputs/Input';
import Form from '../Form';
import Modal from '../Modal';

interface Props {
  onCloseModal: () => void;
  cardData: CardProps;
  title: string;
}

interface CommentListType {
  cursorId?: number;
  comments: CommentsType[];
}

export interface CommentsType {
  author: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
  };
  cardId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  id: number;
}

interface CreateCommentType {
  content: string;
  cardId: number;
  columnId: number;
  dashboardId: number;
}

const SIZE = 2;

function CardViewDetail({ onCloseModal, cardData, title }: Props) {
  const [commentValue, setCommentValue] = useAtom(CommentAtom);
  const setColumnTitle = useSetAtom(ColumnsAtom);
  const [isKebab, setIsKebab] = useState(false);
  const [visible, setVisible] = useState(true);
  const [currentCursorId, setCurrentCursorId] = useState(0);
  const [list, setList] = useState<CommentsType[]>([]);

  const {
    tags,
    description,
    imageUrl,
    assignee,
    dueDate,
    id: cardId,
    columnId,
    dashboardId,
  } = cardData;

  const profile = [
    {
      id: assignee.id,
      profileImageUrl: assignee.profileImageUrl || undefined,
      nickname: assignee.nickname,
    },
  ];

  const { data: initCommentList } = useRequest<CommentListType>({
    deps: [cardId],
    skip: !cardId,
    options: {
      url: `comments`,
      params: { cardId: cardId, size: SIZE },
      method: 'get',
    },
  });

  const { data: commentList } = useRequest<CommentListType>({
    deps: [cardId, currentCursorId],
    skip: !currentCursorId,
    options: {
      url: `comments`,
      params: { cardId: cardId, size: SIZE, cursorId: currentCursorId },
      method: 'get',
    },
  });

  const { fetch: createComment } = useRequest<CreateCommentType>({
    skip: true,
    options: {
      url: 'comments',
      method: 'post',
      data: {
        content: commentValue.comment,
        cardId: cardId,
        columnId: columnId,
        dashboardId: dashboardId,
      },
    },
  });

  const handleClick = () => {
    if (!commentList || !commentList.comments || !commentList.cursorId) return;
    setCurrentCursorId(commentList.cursorId);
    setList((prev) => [...prev, ...commentList.comments]);

    if (
      commentList.cursorId === currentCursorId ||
      commentList.comments.length < SIZE
    ) {
      setVisible(false);
      return;
    }
  };

  const containerRef = useInfiniteScroll({
    handleScroll: handleClick,
    deps: [commentList, initCommentList],
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await createComment();

    if (data && commentList) {
      setList((prev) => [data, ...prev]);
      setCommentValue({ comment: '' });
    }
  };

  const handleKebab = () => {
    setIsKebab(!isKebab);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsKebab(false);
    }, 200);
  };

  const handleReset = () => {
    onCloseModal();
    setColumnTitle({ columnTitle: '' });
  };

  useEffect(() => {
    if (!initCommentList || !initCommentList.cursorId) return;
    setList(initCommentList.comments);
    setCurrentCursorId(initCommentList.cursorId);
    setVisible(true);
  }, [initCommentList]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className='flex items-center justify-between'>
          <h2 className='heading1-bold text-gray-7'>{cardData.title}</h2>
          <div
            className='mr-[-0.625rem] mt-[-3.4rem] flex items-center justify-between gap-16 tablet:mr-0 tablet:mt-0 tablet:gap-24'
            onBlur={handleBlur}
            tabIndex={0}
          >
            <label onClick={handleKebab}>
              <Kebab />
            </label>
            <Close onClick={onCloseModal} />
          </div>
        </div>
        <div className='flex flex-col-reverse items-start justify-between gap-24 tablet:flex-row'>
          <div className='w-full tablet:w-450'>
            <div className='mt-0 flex items-center justify-start tablet:mt-24'>
              <div className='border-r border-gray-3 pr-20'>
                <StateChip str={title} />
              </div>
              <ul className='flex flex-wrap items-center justify-start gap-6 pl-20'>
                {tags.map((tag, index) => {
                  return <TagChip key={index} str={tag} />;
                })}
              </ul>
            </div>
            <p className='body2-normal my-16 text-gray-7'>{description}</p>
            {imageUrl && (
              <Image width={450} height={263} src={imageUrl} alt='이미지' />
            )}
            <div className='relative mb-20 mt-24'>
              <Input
                type='textarea'
                title='댓글'
                required={false}
                placeholder='댓글 작성하기'
              />
              <div className='absolute bottom-12 right-12'>
                <Button.Secondary size='md'>입력</Button.Secondary>
              </div>
            </div>
            <div className='flex flex-col items-start justify-start gap-10'>
              {list.length > 0 &&
                list.map((comment) => {
                  return (
                    <Comments
                      key={comment.id}
                      comment={comment}
                      list={list}
                      setList={setList}
                    />
                  );
                })}
              {visible && (
                <div ref={containerRef} className='h-10 w-full pc:inline' />
              )}
            </div>
          </div>
          <div className='card mt-21 flex h-85 w-full flex-row justify-between tablet:h-165 tablet:w-200 tablet:flex-shrink-0 tablet:flex-col tablet:justify-start'>
            <div className=' flex flex-col justify-center'>
              <h3 className='caption-bold mb-6 text-gray-7'>담당자</h3>
              <div className='body2-normal flex items-center justify-start gap-8'>
                <Members members={profile} totalCount={0} />
                <h2 className='body2-normal text-gray-7'>
                  {assignee.nickname}
                </h2>
              </div>
            </div>
            <div className=' flex h-63 flex-col justify-start gap-10'>
              <h3 className='caption-bold mb-6 text-gray-7 tablet:mt-20'>
                마감일
              </h3>
              <div className='caption-bold text-gray-7 '>{dueDate}</div>
            </div>
          </div>
        </div>
      </form>
      {isKebab && (
        <KebabButton
          handleReset={handleReset}
          columnId={columnId}
          setIsKebab={setIsKebab}
          cardId={cardId}
        />
      )}
    </>
  );
}

export default CardViewDetail;

interface KebabListType {
  id: number;
  name: string;
}

const KEBABLIST: KebabListType[] = [
  { id: 1, name: '수정하기' },
  { id: 2, name: '삭제하기' },
];

function KebabButton({
  columnId,
  setIsKebab,
  cardId,
}: {
  handleReset: () => void;
  columnId?: number;
  cardId: number;
  setIsKebab: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <ul className='card flex-center absolute right-30 top-0 h-82 w-93 flex-col p-6 tablet:right-50 tablet:top-30 '>
      {KEBABLIST.map((list) => {
        return list.id === 1 ? (
          <EditCardButton
            list={list}
            key={list.id}
            setIsKebab={setIsKebab}
            columnId={columnId}
            isHidden={true}
          />
        ) : (
          <DeleteCardButton key={list.id} list={list} cardId={cardId} />
        );
      })}
    </ul>
  );
}

function DeleteCardButton({
  list,
  cardId,
}: {
  list: KebabListType;
  cardId: number;
}) {
  const closeAll = useSetAtom(closeAllModals);
  const [changed, setChanged] = useAtom(changedAtom);

  const { fetch: deleteCard } = useRequest({
    skip: true,
    options: {
      url: `cards/${cardId}`,
      method: 'delete',
    },
  });

  const handleDeleteCard = async () => {
    await deleteCard();
    closeAll();
    setChanged(!changed);
  };

  return (
    <li
      className='flex-center body2-normal h-32 w-81 cursor-pointer rounded-sm hover:bg-primary-light'
      onClick={handleDeleteCard}
    >
      {list.name}
    </li>
  );
}

export function EditCardButton({
  list,
  setIsKebab,
  columnId,
  isHidden,
}: {
  list?: KebabListType;
  setIsKebab?: Dispatch<SetStateAction<boolean>>;
  columnId?: number;
  isHidden: boolean;
}) {
  /* const handleButtonClick = (e: MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    
  }; */
  const [, open] = useAtom(openModal);
  const [, closeAll] = useAtom(closeAllModals);
  const handleAddModal = () => {
    if (setIsKebab) {
      setIsKebab(false);
    }
    closeAll();
    setTimeout(() => {
      open(`addColumn${columnId}`);
    }, 4);
  };
  return (
    <Modal>
      <>
        <Modal.Open opens={`addColumn${columnId}`}>
          <li
            className={`flex-center body2-normal h-32 w-81 cursor-pointer rounded-sm hover:bg-primary-light ${
              !isHidden && '-z-base opacity-0'
            }`}
            onClick={handleAddModal}
          >
            {list && list.name}
          </li>
        </Modal.Open>
        <Modal.Window name={`addColumn${columnId}`}>
          <Form>
            <Form.TodoForm type='edit' />
          </Form>
        </Modal.Window>
      </>
    </Modal>
  );
}
