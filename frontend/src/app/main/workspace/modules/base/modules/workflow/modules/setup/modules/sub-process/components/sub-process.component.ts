import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	eventBlock
} from '../../../../../helpers';

import {
	SubProcess,
	SubProcessSetting,
	SubProcessTypeInfo
} from '../interfaces';
import {
	SubProcessCompleteType,
	SubProcessType
} from '../constant';

import {
	SubProcessBase
} from './sub-process-base';
import {
	OtherRecordComponent
} from './other-record.component';

type EventAdvanceExtend = EventAdvance & {
	value: string;
};

@Unsubscriber()
@Component({
	selector: 'sub-process',
	templateUrl: '../templates/sub-process.pug',
	styleUrls: [ '../styles/sub-process.scss' ],
	host: { class: 'sub-process' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubProcessComponent
implements OnInit, AfterViewInit {

	@ViewChild( 'otherRecordSettingComp' )
	public otherRecordSettingComp: SubProcessBase;
	@ViewChild( 'completeSettingComp' )
	public completeSettingComp: SubProcessBase;
	@ViewChild( 'subProcessTypePicker' )
	private _subProcessTypePicker: CUBDropdownComponent;

	@Input() public baseID: ULID;
	@Input() public blockSetup: SubProcess;
	@Input() public type: SubProcessType;
	@Input() public settings: SubProcessSetting;
	@Input() public boardsLk: ObjectType<IBoard>;

	@Output() public typeChange: EventEmitter<SubProcessType>
		= new EventEmitter<SubProcessType>();
	@Output() public settingsChange: EventEmitter<SubProcessSetting>
		= new EventEmitter<SubProcessSetting>();

	protected readonly SUB_PROCESS_TYPE: typeof SubProcessType
		= SubProcessType;
	protected readonly typeControl: FormControl
		= new FormControl( undefined );

	protected typeSelected: string;
	protected subProcessType: ReadonlySet<SubProcessTypeInfo>;
	protected onBeforeSelectType: () => boolean
		= this._onBeforeSelectType.bind( this );
	protected prevEvents: EventAdvanceExtend[];
	protected eventSelected: EventAdvanceExtend;

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _subProcessAddable: Record<SubProcessType, boolean>;

	ngOnInit() {
		this._setSubProcessType();

		if ( !this.type ) {
			setTimeout(
				() => this._subProcessTypePicker?.open()
			);
		}
	}

	ngAfterViewInit() {
		switch ( this.type ) {
			case SubProcessType.ROW_FROM_EVENT_BEFORE:
				this.typeSelected
					= this.type
					+ '_'
					+ this.settings.blockID;
				break;
			case SubProcessType.ROW_MATCH_CONDITION:
				this.typeSelected
					= this.type.toString();
				break;
		}

		if ( this.settings?.blockID ) {
			this.eventSelected
				= _.find(
					this.prevEvents,
					{ id: this.settings.blockID }
				);
		}
	}

	/**
	 * @return {boolean}
	 */
	protected onSettingChanged() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onSubProcessTypeChange(
		type: string
	) {
		if ( type === this.typeSelected ) return;

		this.typeSelected = type;

		const value: string[]
			= _.split( this.typeSelected, '_' );

		this.type = parseInt( value[ 0 ], 10 ) as SubProcessType;

		this.settings = {
			complete: {
				type: SubProcessCompleteType.All,
			},
		} as SubProcessSetting;

		if (
			this.type === SubProcessType.ROW_FROM_EVENT_BEFORE
		) {
			this.settings.blockID = this.eventSelected.id;
			this.settings.boardID = this.eventSelected.boardID;
		}

		this.typeChange.emit( this.type );
		this.onSettingChanged();

		setTimeout(
			() => ( this.otherRecordSettingComp as OtherRecordComponent )
			?.selectBoardComp
			?.boardPicker
			?.open()
		);
	}

	/**
	 * @return {boolean | Promise}
	 */
	private _onBeforeSelectType(): boolean | Promise<boolean> {
		if ( this.type ) {
			return new Promise(
				( resolve: any ) => {
					this._confirmService
					.open(
						'BASE.WORKFLOW.SETUP.SUB_PROCESS.MESSAGE.CHANGE_EVENT',
						'BASE.WORKFLOW.SETUP.SUB_PROCESS.LABEL.CHANGE_EVENT',
						{
							warning: true,
							buttonApply: {
								text: 'BASE.WORKFLOW.SETUP.SUB_PROCESS.LABEL.CHANGE',
								type: 'destructive',
							},
						}
					)
					.afterClosed()
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							resolve( true );
						},
					});
				}
			);
		} else {
			return true;
		}
	}

	/**
	 * @return {void}
	 */
	private _setPrevEvents() {
		const prevEvents: EventAdvance[]
			= eventBlock( this.blockSetup, this.boardsLk, true );

		this.prevEvents
			= [];

		_.forEach(
			prevEvents,
			( event: EventAdvance ) => {
				this.prevEvents
				.push({
					...event,
					value:
						this.SUB_PROCESS_TYPE.ROW_FROM_EVENT_BEFORE
						+ '_'
						+ event.id,
				});
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _setSubProcessType() {
		this._subProcessAddable
			= this._getSubProcessAddable();

		this._setPrevEvents();

		this.subProcessType
			= new Set([
				this._setSubProcessTypeInfo(
					SubProcessType.ROW_MATCH_CONDITION.toString(),
					'ROW_MATCH_CONDITION'
				),
			]);
	}

	/**
	 * @return {void}
	 */
	private _setSubProcessTypeInfo(
		value: string,
		name: string
	): SubProcessTypeInfo {
		return {
			value,
			name,
			addable: this._subProcessAddable[ value ],
			icon: 'search-pattern',
			iconColor: 'blue',
		};
	}

	/**
	 * @return {Record<SubProcessType, boolean>}
	 */
	private _getSubProcessAddable(): Record<SubProcessType, boolean> {
		const subProcessAddable: Record<SubProcessType, boolean>
			= {} as Record<SubProcessType, boolean>;

		subProcessAddable[ SubProcessType.ROW_FROM_EVENT_BEFORE ]
			= this._setEventAdvanceAddable();
		subProcessAddable[ SubProcessType.ROW_MATCH_CONDITION ]
			= this._setOtherRecordAddable();

		return subProcessAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setEventAdvanceAddable(): boolean {
		return true;
	}

	/**
	 * @return {boolean}
	 */
	private _setOtherRecordAddable(): boolean {
		return true;
	}

}
