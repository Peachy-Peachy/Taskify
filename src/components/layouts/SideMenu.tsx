import { useInfiniteQuery } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import { useEffect } from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { themeAtom } from '@/store/colorSchemeAtom';
import { dashboardUpdateAtom } from '@/store/dashboardUpdateAtom';
import { openModal } from '@/store/modalAtom';
import { reduceText } from '@/utils/reduceText';
import fetch from '@/services/utils/fetch';
import { DashboardProps, DashboardsProps } from '@/pages/api/mock';
import DashBoardColorDot from '@/components/DashboardColorDot';
import Logo from '@/components/logos/Logo';
import Form from '@/components/modal/Form';
import Modal from '@/components/modal/Modal';
import { IconAddBox, IconCrown } from '@/public/svgs';
import DeferredSuspense from '../skeletons/DeferredSuspense';
import SideMenuSkeleton from '../skeletons/SideMenuSkeleton';

interface Props {
  dashboardId?: string;
}

const INITIAL_SIZE = 15;
const SIZE = 5;

function SideMenu({ dashboardId }: Props) {
  const [dashboardUpdate, setDashboardUpdate] = useAtom(dashboardUpdateAtom);

  const getDashboards = async ({ pageParam = 1 }) => {
    const { data }: { data: DashboardsProps } = await fetch({
      url: 'dashboards',
      method: 'get',
      params: {
        navigationMethod: 'pagination',
        page: pageParam === 1 ? pageParam : pageParam + 2,
        size: pageParam === 1 ? INITIAL_SIZE : SIZE,
      },
    });
    return data;
  };

  const {
    data: dashboards,
    fetchNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['dashboards'],
    queryFn: getDashboards,
    getNextPageParam: (lastPage, allPageParams) =>
      lastPage.dashboards.length < SIZE ? null : allPageParams.length + 1,
  });

  const containerRef = useInfiniteScroll({
    handleScroll: fetchNextPage,
    deps: [dashboards],
  });

  useEffect(() => {
    if (dashboardUpdate === false) return;
    refetch();
    setDashboardUpdate(false);
  }, [dashboardId, dashboardUpdate]);

  return (
    <div className='flex h-full w-67 flex-shrink-0 flex-col items-center overflow-hidden border-r border-gray-3 bg-white px-12 pb-75 pt-20 tablet:w-160 pc:w-300'>
      <div className='w-full pb-60 pl-12'>
        <Logo />
      </div>
      <DashboardsHeader />
      <ul className='custom-scrollbar flex h-full w-full flex-col gap-5 overflow-y-auto overflow-x-hidden'>
        {dashboards?.pages.map((dashboardPage) =>
          dashboardPage.dashboards.map((dashboard) => (
            <li key={dashboard.id}>
              <DashboardCard
                title={dashboard.title}
                color={dashboard.color}
                createdByMe={dashboard.createdByMe}
                id={dashboard.id}
                selected={dashboard.id === Number(dashboardId)}
              />
            </li>
          )),
        )}

        <DeferredSuspense
          fallback={<SideMenuSkeleton />}
          isFetching={isFetching}
        />
        <div ref={containerRef} className='h-50 w-full' />
      </ul>
    </div>
  );
}

export default SideMenu;

function DashboardsHeader() {
  const [, open] = useAtom(openModal);
  const handleCreateModal = () => {
    open('addDashboard');
  };
  return (
    <div className='flex w-full justify-between px-12 pb-18'>
      <p className='caption-bold hidden text-gray-5 tablet:inline'>
        Dash Boards
      </p>
      <Modal>
        <>
          <Modal.Open opens='addDashboard'>
            <div className='cursor-pointer' onClick={handleCreateModal}>
              <IconAddBox fill='gray' viewBox='0 0 21 21' />
            </div>
          </Modal.Open>
          <Modal.Window name='addDashboard'>
            <Form>
              <Form.DashboardForm />
            </Form>
          </Modal.Window>
        </>
      </Modal>
    </div>
  );
}

interface DashboardCardProps extends DashboardProps {
  selected: boolean;
}

function DashboardCard({
  title,
  color,
  createdByMe,
  id,
  selected = false,
}: DashboardCardProps) {
  const theme = useAtomValue(themeAtom);

  const reducedTitlePc = reduceText(title, 11);
  const reducedTitleTablet = reduceText(title, 4);

  return (
    <Link
      href={`/dashboard/${id}`}
      className={`flex-center h-40 w-full rounded-sm tablet:h-45 tablet:justify-start ${
        theme === 'light'
          ? `hover:bg-primary-light ${selected ? 'bg-primary-light' : ''}`
          : `hover:bg-gray-1 ${selected ? 'bg-gray-1' : ''}`
      }`}
    >
      <DashBoardColorDot color={color} />
      <div className='hidden items-center pr-12 tablet:flex'>
        <p className='heading3-normal pc:heading2-normal break-keep px-6 text-gray-5'>
          <span className='hidden pc:inline'>{reducedTitlePc}</span>
          <span className='pc:hidden'>{reducedTitleTablet}</span>
        </p>
        <IconCrown
          className={createdByMe ? 'inline flex-shrink-0' : 'hidden'}
        />
      </div>
    </Link>
  );
}
