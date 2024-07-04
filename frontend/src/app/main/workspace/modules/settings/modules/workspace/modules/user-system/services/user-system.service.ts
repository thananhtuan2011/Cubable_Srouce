import {
	Injectable
} from '@angular/core';
import {
	Subject
} from 'rxjs';

@Injectable()
export class UserSystemService {

	public markAsChanged$: Subject<void>
		= new Subject<void>();
	public unMarkAsChanged$: Subject<void>
		= new Subject<void>();
	public save: Function;
	public cancel: Function;

}
