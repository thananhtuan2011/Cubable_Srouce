import {
	ChangeDetectorRef,
	Directive,
	OnInit,
	ViewChild,
	Input,
	inject
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed,
	Unsubscriber
} from '@core';

import {
	CUBTMember,
	CUBMemberData,
	CUBMemberListComponent
} from '@cub/material/member-picker';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	PeopleField
} from '@main/common/field/objects';

import {
	AdvanceData,
	ComparisonSource,
	TComparisonOperator
} from '../../interfaces';
import {
	ComparisonBase
} from '../../components';

const operatorHasComparisonType: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.NOT_IN,
	ComparisonOperator.IN,
]);

const comparisonEmpty: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
]);

export type PeopleData = AdvanceData & {
	// specific
	specific?: PeopleSpecific;

	// static
	userIDs?: ULID[];
	selected?: CUBTMember[];
};

export enum ComparisonPeopleType {
	CUSTOM = 1,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	SPECIFIC_FIELD,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	CURRENT_VIEWER
};

export enum PeopleSpecific {
	CurrentViewer = 1,
}

@Unsubscriber()
@Directive()
export class PeopleComparisonBase
	extends ComparisonBase<PeopleData, PeopleSpecific>
	implements OnInit {

	@ViewChild( CUBMemberListComponent )
	private _cubMemberList: CUBMemberListComponent;

	@Input() public field: PeopleField;

	protected readonly comparisonOperatorType: typeof ComparisonOperator
		= ComparisonOperator;
	// protected readonly comparisonPeopleType: typeof ComparisonPeopleType
	// 	= ComparisonPeopleType;
	protected readonly comparisonOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EMPTY,
				'IS_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EMPTY,
				'IS_NOT_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EXACTLY,
				'IS_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EXACTLY,
				'IS_NOT_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IN,
				'IN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.NOT_IN,
				'NOT_IN'
			),
		];
	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;

	protected users: IUser[];

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnInit( ) {
		super.ngOnInit();
		this._setComparisonTypeSpecific();

		this._userService
		.getAvailableUser()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( users: IUser[] ) => {
				this.users = users;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.data = this.operatorHasComparisonType.has( this.operator )
			? {
				compareType: PeopleComparisonBase.default.compareType,
			}
			: comparisonEmpty.has( this.operator )
				? undefined
				: {};

		if (
			operatorHasComparisonType.has( this.operator )
		) {
			setTimeout(
				() => this._cubMemberList.pickerMenuTrigger.open()
			);
		}

		this._setComparisonTypeSpecific();
		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		type: ComparisonType
	) {
		super.onTypeChange(
			type
		);

		this.data = {
			...this.data,
			userIDs: undefined,
			selected: undefined,
		};

		// switch ( this.data.compareType ) {
		// 	case ComparisonPeopleType.SPECIFIC_FIELD:
		// 		// TODO
		// 		// this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonPeopleType.CUSTOM:
		// 		setTimeout(
		// 			() => this._cubMemberList.pickerMenuTrigger.open()
		// 		);
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @return {void}
	 */
	protected addUsers( event: CUBMemberData<CUBTMember[]> ) {
		this.data.userIDs
			= [
				...this.data.userIDs || [],
				..._.map( event.users, 'id' ),
			];

		super.onDataChange();
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @return {void}
	 */
	protected removeUsers( event: CUBMemberData<CUBTMember[]> ) {
		_.forEach( event.users, ( user: IUser ) => {
			this.data.userIDs = _.filter(
				this.data.userIDs,
				( id: ULID ) => {
					return user.id !== id;
				}
			);
		} );

		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	private _setComparisonTypeSpecific() {
		if (
			this.source === ComparisonSource.Workflow
		) return;

		this.comparisonTypeSpecific
			= this.operator === ComparisonOperator.IS_EXACTLY
				? [
					{
						value: PeopleSpecific.CurrentViewer,
						label: 'FIELD.COMPARISON.LABEL.CURRENT_VIEWER',
						icon: 'user',
					},
				]
				: [];
	}

}
