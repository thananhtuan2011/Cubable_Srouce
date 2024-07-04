import {
	Injectable,
	TemplateRef
} from '@angular/core';
import {
	Subject,
	BehaviorSubject
} from 'rxjs';
import _ from 'lodash';

@Injectable({ providedIn: 'root' })
export class NavigationBarService {

	public contentTmp$: Subject<TemplateRef<any>>
		= new Subject<TemplateRef<any>>();

	public canRedirect$: Subject<boolean>
		= new BehaviorSubject<boolean>( true );
}
