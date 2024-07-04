import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	ContentChild,
	HostBinding,
	HostListener,
	inject,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUBRadioContentDirective
} from './radio-content.directive';

export type CUBRadioSize = 'small' | 'large';

@Component({
	selector: 'cub-radio',
	templateUrl: './radio.pug',
	styleUrls: [ './radio.scss' ],
	host: { class: 'cub-radio' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBRadioComponent {

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;
	@Input() public label: string;
	@Input() public value: any;
	@HostBinding( 'style.--radio-size' )
	@Input() @DefaultValue()
	public size: CUBRadioSize = 'small';
	@Input() @CoerceBoolean()
	public checked: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() public onBeforeCheck:
		() => boolean | Promise<boolean>;

	@Output() public checkedChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	@ContentChild( CUBRadioContentDirective )
	protected readonly radioContent: CUBRadioContentDirective;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.disabled
			|| undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly
			|| undefined;
	}

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-radio-small':
				this.size === 'small',
			'cub-radio-large':
				this.size === 'large',
			'cub-radio--checked':
				this.checked,
		};
	}

	get canEdit(): boolean {
		return !this.disabled
			&& !this.readonly;
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

	@HostListener( 'click' )
	@HostListener( 'keydown.space' )
	protected onClickAndKeydownSpace() {
		if ( !this.canEdit ) {
			return;
		}

		let isContinue: boolean
			| Promise<boolean> = true;

		if ( this.onBeforeCheck ) {
			isContinue = this.onBeforeCheck();

			if ( isContinue
					instanceof Promise ) {
				isContinue
				.then(( v: boolean ) => {
					if ( !v ) return;

					this.check();
				});
				return;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
		if ( isContinue !== true ) {
			return;
		}

		this.check();
	}

	/**
	 * @return {void}
	 */
	protected check() {
		this.checkedChange.emit(
			this.checked = true
		);
	}

}
