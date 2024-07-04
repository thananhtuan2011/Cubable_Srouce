import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	HostListener,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../value-accessor';

export type CUBSwitchSize = 'small' | 'large';

@Component({
	selector: 'cub-switch',
	templateUrl: './switch.pug',
	styleUrls: [ './switch.scss' ],
	host: { class: 'cub-switch' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		CUB_VALUE_ACCESSOR(
			CUBSwitchComponent
		),
	],
})
export class CUBSwitchComponent
	extends CUBValueAccessor<boolean> {

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;
	@Input() public label: string;
	@HostBinding( 'style.--switch-size' )
	@Input() @DefaultValue()
	public size: CUBSwitchSize = 'small';
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() public onBeforeSwitch:
		() => boolean | Promise<boolean>;

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-switch-small':
				this.size === 'small',
			'cub-switch-large':
				this.size === 'large',
			'cub-switch--active':
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
				this.value === true,
		};
	}

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.isDisabled
			|| undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly
			|| undefined;
	}

	get canEdit(): boolean {
		return !this.isDisabled
			&& !this.readonly;
	}

	@HostListener( 'click' )
	@HostListener( 'keydown.space' )
	protected onClickAndKeydownSpace() {
		if ( !this.canEdit ) {
			return;
		}

		let isContinue: boolean
			| Promise<boolean> = true;

		if ( this.onBeforeSwitch ) {
			isContinue
				= this.onBeforeSwitch();

			if ( isContinue
					instanceof Promise ) {
				isContinue
				.then(( v: boolean ) => {
					if ( !v ) return;

					this.switch();
				});
				return;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
		if ( isContinue !== true ) {
			return;
		}

		this.switch();
	}

	/**
	 * @return {void}
	 */
	protected switch() {
		const value: boolean
			= !this.value;

		this.writeValue( value );
		this.onChange( value );
	}

}
