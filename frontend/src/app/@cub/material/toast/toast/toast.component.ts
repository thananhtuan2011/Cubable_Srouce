import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	ViewEncapsulation,
	TemplateRef
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

export enum CUBToastType {
	Default = 'default',
	Info = 'info',
	Success = 'success',
	Warning = 'warning',
	Danger = 'danger',
}

export enum CUBToastPosition {
	Top = 'top',
	Bottom = 'bottom',
	TopRight = 'top-right',
	TopLeft = 'top-left',
	BottomRight = 'bottom-right',
	BottomLeft = 'bottom-left',
}

export type CUBToastConfig = {
	icon?: string;
	duration?: number;
	canClose?: boolean;
	translate?: boolean | ObjectType;
	type?: CUBToastType;
	position?: CUBToastPosition;
	onBeforeSwitch?:
		() => boolean | Promise<boolean>;
};

export type CUBToastTitleType = string | TemplateRef<any>;

@Component({
	selector: 'cub-toast',
	templateUrl: './toast.pug',
	styleUrls: [ './toast.scss' ],
	host: { class: 'cub-toast' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBToastComponent {

	@Input() public title: string;
	@Input() public icon: string;
	@Input() @DefaultValue()
	public type: CUBToastType = CUBToastType.Default;
	@Input() @CoerceBoolean()
	public canClose: boolean;
	@Input() public translate: boolean | ObjectType;

	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();

	@HostBinding( 'class.cub-toast-info' )
	get classInfo(): boolean {
		return this.type === CUBToastType.Info;
	}

	@HostBinding( 'class.cub-toast-success' )
	get classSuccess(): boolean {
		return this.type === CUBToastType.Success;
	}

	@HostBinding( 'class.cub-toast-warning' )
	get classWarning(): boolean {
		return this.type === CUBToastType.Warning;
	}

	@HostBinding( 'class.cub-toast-danger' )
	get classDanger(): boolean {
		return this.type === CUBToastType.Danger;
	}

	get iconUrl(): string {
		return `assets/@cub/images/icons/toast-${this.type}.webp`;
	}

	get isTitleString(): boolean {
		return _.isString( this.title );
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.closed.emit();
	}

}
