import { ApiHandlerWithConn } from 'src/common/types/server';
import { withSessionApi } from 'src/common/middleware/withSession';
import { ApiError, unresolved } from 'src/common/utils/server';
import { error, httpMethodError } from 'src/common/utils/response';
import {
  createAllowedStation,
  removeAllowedStation,
} from 'src/modules/users/apiHandler';
import { noAccessText } from 'src/config/constants';

const handler: ApiHandlerWithConn = async (req, res) => {
  try {
    const { method } = req;
    const { write } = req.session.user?.access.users ?? {};

    switch (method?.toUpperCase()) {
      case 'POST':
        if (!write) throw new ApiError(noAccessText, 403);
        await createAllowedStation(req, res);
        break;
      case 'DELETE':
        if (!write) throw new ApiError(noAccessText, 403);
        await removeAllowedStation(req, res);
        break;
      default:
        httpMethodError(res, method, ['POST']);
    }
  } catch (err) {
    error(res, err);
  }
};

export default withSessionApi(handler);

export const config = unresolved;
