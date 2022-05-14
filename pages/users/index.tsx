import { InferGetServerSidePropsType as IPT } from 'next';
import { useRouter } from 'next/router';
import { RowClickHandler } from 'types/client';
import { accessConstants } from 'config/constants';
import { useGetUsers } from 'client/api/users';
import { withSessionSsr } from 'lib/withSession';
import Layout from 'client/components/layout/Layout';
import DataGrid from 'client/components/common/DataGrid';
import userColumns from 'client/tables/users';

export const getServerSideProps = withSessionSsr();

function AllUsersPage({ user }: IPT<typeof getServerSideProps>) {
  const users = useGetUsers();
  const router = useRouter();

  const rowClickHandler: RowClickHandler = async (e) => {
    const { id } = e;
    router.push(`/users/${id}`);
  };

  const cols = userColumns();

  const { permitted } = accessConstants(user.access);
  const hasAccess = permitted['/users'];

  return (
    <Layout session={user} blockAccess={!hasAccess}>
      <DataGrid
        columns={cols}
        rows={users.data ?? []}
        error={users.error !== undefined}
        loading={!users.data && !users.error}
        rowClickHandler={rowClickHandler}
      />
    </Layout>
  );
}

export default AllUsersPage;
