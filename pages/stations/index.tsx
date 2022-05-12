import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { withSessionSsr } from 'lib/withSession';
import Layout from 'client/components/layout/Layout';
import DataGrid from 'client/components/common/DataGrid';
import { RowClickHandler } from 'types/client';
import stationColumns from 'client/tables/stations';
import { useGetStations } from 'client/api/stations';
import { accessConstants, routes } from 'config/constants';

import RegionsContainer from 'client/components/stations/RegionsContainer';

export const getServerSideProps = withSessionSsr();

// Home: NextPage
const AllStationsPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, error } = useGetStations();
  const router = useRouter();

  const rowClickHandler: RowClickHandler = async (e) => {
    const { id } = e;
    // window.location.href = `/users/${id}`;
    router.push(`/stations/${id}`);
  };

  const cols = stationColumns();

  const { permitted } = accessConstants(user.access);
  const hasAccess = permitted['/stations'];

  return (
    <Layout session={user} blockAccess={!hasAccess}>
      <DataGrid
        columns={cols}
        rows={data ?? []}
        error={error !== undefined}
        loading={!data && !error}
        rowClickHandler={rowClickHandler}
        add={routes['/stations/new'] <= user.access}
        actionHandler={() => {
          router.push('/stations/new');
        }}
      />
      <RegionsContainer />
    </Layout>
  );
};

export default AllStationsPage;
