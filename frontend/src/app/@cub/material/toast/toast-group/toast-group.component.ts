import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	ViewEncapsulation
} from '@angular/core';
import {
	ulid,
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CUBToastConfig,
	CUBToastTitleType
} from '../toast/toast.component';

export type CUBToast = {
	id?: ULID;
	title?: CUBToastTitleType;
	config?: CUBToastConfig;
};

@Component({
	selector: 'cub-toast-group',
	templateUrl: './toast-group.pug',
	styleUrls: [ './toast-group.scss' ],
	host: { class: 'cub-toast-group' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBToastGroupComponent {

	public toasts: CUBToast[];
	public onDeletedAll: () => void;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	/**
	 * @param {CUBToastTitleType} title
	 * @param {CUBToastConfig} config
	 * @return {ULID}
	 */
	public createToast(
		title: CUBToastTitleType,
		config?: CUBToastConfig
	): ULID {
		if ( !config ) return;

		const id: ULID = ulid();

		this.toasts ||= [];

		this.toasts.push({
			id,
			title,
			config,
		});

		if (
			config.canClose
			&& config.duration !== 0
		) {
			setTimeout(
				this.deleteToast.bind( this, id ),
				config.duration
			);
		}

		this._cdRef.markForCheck();

		return id;
	}

	/**
	 * @param {ULID} id
	 * @return {void}
	 */
	public deleteToast( id: ULID ) {
		this.toasts
			= _.reject( this.toasts, { id } );

		if ( !this.toasts.length ) {
			this.onDeletedAll?.();
		}

		this._cdRef.markForCheck();
	}

}
