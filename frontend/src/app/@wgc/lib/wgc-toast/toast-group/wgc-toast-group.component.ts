import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import moment from 'moment-timezone';
import _ from 'lodash';

import { WGCIToastConfig } from '../toast/wgc-toast.component';

@Component({
	selector		: 'wgc-toast-group',
	templateUrl		: './wgc-toast-group.pug',
	host			: { class: 'wgc-toast-group' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCToastGroupComponent {

	public toasts: ObjectType[] = [];
	public onDeletedAll: () => void;

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @param {string} title
	 * @param {string} description
	 * @param {WGCIToastConfig} config
	 * @return {number}
	 */
	public createToast( title: string, description?: string, config?: WGCIToastConfig ): number {
		if ( !config ) return;

		const id: number = +moment();

		this.toasts.push({ id, title, description, config });

		config.canClose
			&& config.duration !== 0
			&& setTimeout( this.deleteToast.bind( this, id ), config.duration );

		this._cdRef.markForCheck();

		return id;
	}

	/**
	 * @param {number} id
	 * @return {void}
	 */
	public deleteToast( id: number ) {
		this.toasts = _.reject( this.toasts, { id } );

		!this.toasts.length && this.onDeletedAll?.();
		this._cdRef.markForCheck();
	}

}
