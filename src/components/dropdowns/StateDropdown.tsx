import { useState } from 'react';
import { IconArrowDown, IconCheck } from '@/public/svgs';

function StateDropdown() {
  /* 컴포넌트 합칠 때 수정해도됩니다.*/
  const [todoList, setTodoList] = useState({
    todoState: [
      { id: 1, state: 'TODO', isDone: true },
      { id: 2, state: 'on Progress', isDone: false },
      { id: 3, state: 'Done', isDone: false },
    ],
  });
  const [isDrop, setIsDrip] = useState(false);
  const [todoName, setTodoName] = useState(todoList.todoState[0].state);

  const handleClickDiv = () => {
    setIsDrip(!isDrop);
  };

  const handleClickList = (e: React.MouseEvent<HTMLLIElement>, id: number) => {
    setIsDrip(!isDrop);

    const { textContent } = e.currentTarget;
    if (textContent) {
      setTodoName(textContent);
    }

    const newTodoList = todoList.todoState.map((todo) => {
      return todo.id === id
        ? { ...todo, isDone: true }
        : { ...todo, isDone: false };
    });

    setTodoList({
      ...todoList,
      todoState: newTodoList,
    });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsDrip(false);
    }, 200);
  };

  return (
    <div className='flex flex-col justify-start gap-10 mobile:w-287 tablet:w-217 pc:w-217'>
      <h2 className='font-normal mobile:text-16 tablet:text-18 pc:text-18'>
        상태
      </h2>
      <div className='relative' onBlur={handleBlur}>
        <div
          className={` flex h-48 w-full items-center justify-between rounded-md p-16 ${
            isDrop ? 'border-solid-primary' : 'border-solid-gray'
          } cursor-pointer`}
          onClick={handleClickDiv}
        >
          <span>{todoName}</span>
          <IconArrowDown />
        </div>
        <ul
          className={`border-solid-gray absolute left-0 ${
            isDrop ? 'top-50' : 'top-46 z-[-1] opacity-0'
          } flex w-full flex-col items-start justify-between gap-13 rounded-md p-8 transition-all duration-500`}
        >
          {todoList.todoState.map((todo) => {
            return (
              <li
                className='flex w-full cursor-pointer items-start justify-start gap-6 rounded-sm hover:bg-gray-2'
                key={todo.id}
                onClick={(e) => handleClickList(e, todo.id)}
              >
                {todo.isDone ? <IconCheck /> : <div className='w-22'></div>}
                {todo.state}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default StateDropdown;
