import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	EventEmitter,
	inject,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';

import { CoerceBoolean } from 'angular-core';

import {
	CUBExpansionPanelHeaderComponent
} from './expansion-panel-header.component';
import {
	CUBExpansionPanelContentComponent
} from './expansion-panel-content.component';

@Component({
	selector		: 'cub-expansion-panel',
	templateUrl		: './expansion-panel.pug',
	styleUrls		: [ './expansion-panel.scss' ],
	host			: { class: 'cub-expansion-panel' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBExpansionPanelComponent {

	@ContentChild( CUBExpansionPanelHeaderComponent, { static: true } )
	public expansionPanelHeader: CUBExpansionPanelHeaderComponent;
	@ContentChild( CUBExpansionPanelContentComponent, { static: true } )
	public expansionPanelContent: CUBExpansionPanelContentComponent;

	@Input() @CoerceBoolean() public expanded: boolean;

	@Output() public expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	private _cdRef: ChangeDetectorRef = inject( ChangeDetectorRef );

	/**
	 * @return {void}
	 */
	public toggle() {
		this.expanded ? this.collapse() : this.expand();
	}

	/**
	 * @return {void}
	 */
	public expand() {
		this.expandedChange.emit( this.expanded = true );

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public collapse() {
		this.expandedChange.emit( this.expanded = false );

		this._cdRef.markForCheck();
	}

}
