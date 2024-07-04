import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ContentChildren,
	EventEmitter,
	HostBinding,
	HostListener,
	Input,
	OnDestroy,
	Output,
	QueryList,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	CoerceCssPixel,
	DefaultValue
} from 'angular-core';

import {
	CUBActionItemComponent
} from '../action-item/action-item.component';

import {
	CUBActionBoxEndComponent
} from './action-box-end.component';
import {
	CUBActionBoxMiddleComponent
} from './action-box-middle.component';
import {
	CUBActionBoxStartComponent
} from './action-box-start.component';

export type CUBIActionBoxPosition = 'top' | 'bottom';

@Component({
	selector: 'cub-action-box',
	templateUrl: './action-box.pug',
	styleUrls: [ './action-box.scss' ],
	host: { class: 'cub-action-box' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBActionBoxComponent implements OnDestroy {

	@HostBinding( 'class.cub-action-box--visible' )
	@Input() @CoerceBoolean()
	public visible: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public autoClose: boolean = true;
	@Input() @DefaultValue()
	public position: CUBIActionBoxPosition = 'bottom';
	@HostBinding( 'style.--action-box-offset' )
	@Input() @CoerceCssPixel()
	public offset: string;

	@Output() public dismissed: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public visibleChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	@ContentChild( CUBActionBoxStartComponent, { static: true } )
	protected readonly actionBoxStart: CUBActionBoxStartComponent;
	@ContentChild( CUBActionBoxMiddleComponent, { static: true } )
	protected readonly actionBoxMiddle: CUBActionBoxMiddleComponent;
	@ContentChild( CUBActionBoxEndComponent, { static: true } )
	protected readonly actionBoxEnd: CUBActionBoxEndComponent;

	@ContentChildren( CUBActionItemComponent, { descendants: true } )
	protected readonly actionItems: QueryList<CUBActionItemComponent>;

	@HostBinding( 'class.cub-action-box-top' )
	get classTop(): boolean {
		return this.position === 'top';
	}

	@HostBinding( 'class.cub-action-box-bottom' )
	get classBottom(): boolean {
		return this.position === 'bottom';
	}

	@HostListener( 'window:keydown.esc', [ '$event' ] )
	protected onWindowKeydownEsc( e: KeyboardEvent ) {
		if ( !this.autoClose ) return;

		this.dismiss( e );
	}

	ngOnDestroy() {
		this.dismiss();
	}

	/**
	 * @param {Event=} e
	 * @return {void}
	 */
	public dismiss( e?: Event ) {
		if ( !this.visible ) return;

		this.visibleChange.emit(
			this.visible = false
		);

		this.dismissed.emit( e );
	}

}
