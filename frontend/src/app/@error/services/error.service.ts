import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import _ from 'lodash';

@Injectable()
export class ErrorService {

	public readonly errorCatcher$: Subject<any> = new Subject<any>();

}
