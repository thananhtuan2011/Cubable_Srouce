import {
	inject,
	Injectable,
	TemplateRef
} from '@angular/core';
import {
	NavigationStart,
	Router
} from '@angular/router';
import {
	OverlayRef
} from '@angular/cdk/overlay';
import {
	ReplaySubject
} from 'rxjs';
import {
	filter,
	map,
	pairwise
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CUBPopupService,
	CUBPopupRef
} from '../popup';

import {
	CUBConfirmComponent,
	CUBConfirmConfig
} from './confirm.component';

export type CUBConfirmRef = {
	popupRef: CUBPopupRef<CUBConfirmComponent>;
	config: CUBConfirmConfig;
	close: ( answer: boolean ) => void;
	afterClosed: () => ReplaySubject<boolean>;
};

export type CUBIConfirmRef = CUBConfirmRef;

let refs: OverlayRef[] = [];

@Injectable({
	providedIn: 'any',
})
export class CUBConfirmService {

	private readonly _router: Router
		= inject( Router );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @constructor
	 */
	constructor() {
		this
		._router
		.events
		.pipe(
			filter(
				( e: NavigationStart ) =>
					e instanceof NavigationStart
			),
			map(
				( e: NavigationStart ) =>
					e.url.split( '?' )[ 0 ]
			),
			pairwise(),
			filter(
				(
					[ prev, curr ]: string[]
				): boolean => prev !== curr
			)
		)
		.subscribe(() => {
			this.closeAll();
		});
	}

	/**
	 * @param {string | TemplateRef<any>} message
	 * @param {string=} title
	 * @param {CUBConfirmConfig=} config
	 * @return {CUBConfirmRef}
	 */
	public open(
		message: string | TemplateRef<any>,
		title?: string,
		config?: CUBConfirmConfig
	): CUBConfirmRef {
		this.closeAll();

		config = {
			translate: true,

			...config,
		};

		const popupRef: CUBPopupRef<CUBConfirmComponent>
			= this
			._popupService
			.open(
				null,
				CUBConfirmComponent,
				undefined,
				{ hasBackdrop: true }
			);
		const { instance }: CUBPopupRef<CUBConfirmComponent>
			= popupRef;
		const closed$: ReplaySubject<boolean>
			= new ReplaySubject<boolean>();
		const confirmRef: CUBConfirmRef
			= instance.ref
			= {
				popupRef,
				config,
				close: ( answer: boolean ) =>
					this.close( confirmRef, answer ),
				afterClosed: () => closed$,
			} as CUBConfirmRef;

		instance.message = message;
		instance.title = title;

		return confirmRef;
	}

	/**
	 * @param {CUBConfirmRef} confirmRef
	 * @param {boolean} answer
	 * @return {void}
	 */
	public close(
		confirmRef: CUBConfirmRef,
		answer: boolean
	) {
		confirmRef
		.popupRef
		.close();

		confirmRef
		.afterClosed()
		.next( answer );
	}

	/**
	 * @return {void}
	 */
	public closeAll() {
		_.forEach(
			refs,
			( overlayRef: OverlayRef ) => {
				overlayRef.dispose();
			}
		);

		refs = [];
	}

}
