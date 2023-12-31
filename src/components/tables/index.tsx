import { InvitationProps, MemberProps } from 'src/types';
import DashboardInfoTable from './DashboardInfoTable';
import InvitedDashboardsTable from './InvitedDashboardsTable';

export interface DashboardInfoProps {
  type: 'member' | 'invitation';
  totalCount: number;
  data: MemberProps[] | InvitationProps[];
  setCurrentPage: (arg: number) => void;
  currentPage: number;
  fetch: () => void;
}

interface InvitedDashboardsProps {
  type: 'dashboard';
  data?: InvitationProps[];
}

type Props = DashboardInfoProps | InvitedDashboardsProps;

function Table(props: Props) {
  return props.type !== 'dashboard' ? (
    <DashboardInfoTable
      type={props.type}
      totalCount={props.totalCount}
      data={(props as DashboardInfoProps).data}
      setCurrentPage={props.setCurrentPage}
      currentPage={props.currentPage}
      fetch={props.fetch}
    />
  ) : (
    <InvitedDashboardsTable />
  );
}

export default Table;
