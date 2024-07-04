import {
	Directive,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges
} from '@angular/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import _ from 'lodash';

import {
	CoerceBoolean,
	untilCmpDestroyed
} from '@core';

import {
	View
} from '../../../interfaces';

import {
	Base
} from './base';

@Directive()
export abstract class BaseView<T extends View>
	extends Base<T>
	implements OnInit, OnChanges {

	@Input() @CoerceBoolean()
	public isFromManageTab: boolean;
	@Input() @CoerceBoolean()
	public isFromAllView: boolean;
	@Input() @CoerceBoolean()
	public tabAccess: boolean;
	@Input() @CoerceBoolean()
	public tabManage: boolean;
	@Input() public view: T;

	public readonly nameFormControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.required,
				Validators.maxLength( 80 ),
			]
		);

	public isHovering: boolean;
	public isEditingName: boolean;
	public nameView: string;

	ngOnInit() {
		this.viewService.created$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( view: T ) => this.changeName( view ),
		});
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.activeView?.currentValue ) this.isEditingName = false;
	}

	/**
	 * @param {T} view
	 * @return {void}
	 */
	public updateName( view: T ) {
		this.isEditingName = false;

		if ( this.nameFormControl.valid
			&& this.nameView !== view.name ) {
			this.updateChange.emit({
				view,
				data: { name: this.nameView },
			});
		}

		this.cdRef.markForCheck();
	}

	/**
	 * @param {T} view
	 * @return {void}
	 */
	public changeName( view: T ) {
		this.nameView = view.name;
		this.isEditingName = true;

		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this.cdRef.markForCheck();
	}

}
