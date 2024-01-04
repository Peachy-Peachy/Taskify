import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { loginAtom } from '@/store/loginAtom';
import Footer from './Footer';
import SideMenu from './SideMenu';
import DashboardHeader from './headers/DashboardHeader';
import LandingHeader from './headers/LandingHeader';

interface Props {
  children: ReactNode;
}

function Layout({ children }: Props) {
  const loginInfo = useAtomValue(loginAtom);
  const router = useRouter();
  const dashboardId = Array.isArray(router.query.dashboardId)
    ? router.query.dashboardId[0]
    : router.query.dashboardId;

  if (router.pathname === '/signin' || router.pathname === '/signup')
    return <>{children}</>;

  return (
    <>
      {loginInfo.isLoggedIn ? (
        <div className='flex h-screen w-screen'>
          <SideMenu dashboardId={dashboardId} />
          <div className='w-full overflow-hidden'>
            <DashboardHeader dashboardId={dashboardId} />
            <div className='custom-scrollbar h-[calc(100%-60px)] w-full overflow-auto bg-gray-1 pc:h-[calc(100%-70px)]'>
              {children}
            </div>
          </div>
        </div>
      ) : (
        <>
          <LandingHeader />
          {children}
          <Footer />
        </>
      )}
    </>
  );
}

export default Layout;
