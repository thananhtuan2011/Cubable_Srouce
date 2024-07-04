import { CONSTANT } from '../resources';

export interface IError {
	status: 200 | 400 | 401 | 403 | 404 | 420 | 500;
	error: {
		key: MapObjectValue<typeof CONSTANT.KEY>;
		message: string;
		data: any;
	};
}
