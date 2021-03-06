import axios from 'axios';
import { Station } from 'src/entities/Station';
import useRequest from 'src/common/hooks/useRequest';
import { FormValues } from 'src/common/components/Form';

const route = '/api/stations';

export const useGetStation = (id: number) =>
  useRequest<Station>({
    url: `${route}/${id}`,
  });

export const useGetStations = () => useRequest<Station[]>({ url: route });

export const postStation = (values: FormValues) => axios.post(route, values);

export const putStation = (id: number, values: FormValues) =>
  axios.put(`${route}/${id}`, values);

export const patchStation = (id: number, values: FormValues) =>
  axios.patch(`${route}/${id}`, values);

// export const deleteStation = (id: number) => axios.delete(`${route}/${id}`);
