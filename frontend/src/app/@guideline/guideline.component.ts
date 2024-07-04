import {
	AfterViewInit, ChangeDetectionStrategy, Component,
	QueryList, TemplateRef, ViewChildren, ViewChild
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { startWith } from 'rxjs/operators';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import fontIcon from '@cub/assets/fonts/icomoon/selection.json';

import { REGEXP, Unsubscriber, untilCmpDestroyed } from '@core';

import { WGCIActionBoxPosition } from '@wgc/wgc-action-box';
import { WGCIBarChartDataset, WGCILineChartDataset, WGCIPieChartDataset, WGCIDonutChartDataset } from '@wgc/wgc-chart';
import { WGCIComment, WGCIMention } from '@wgc/wgc-comment';
import { WGCConfirmService, WGCIConfirmRef } from '@wgc/wgc-confirm';
import { WGCDialogService, WGCIDialogRef, WGCIDialogPagerType } from '@wgc/wgc-dialog';
import { WGCIMember } from '@wgc/wgc-member-picker';
import { WGCCdkTableDataSource } from '@wgc/wgc-table';
import { WGCToastService } from '@wgc/wgc-toast';

import { CUBTMember } from '@cub/material/member-picker';

import { IUser } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	WorkflowBlockType
} from '@main/workspace/modules/base/modules/workflow/resources';

import { COLOR } from '@resources';

import { MyDialogComponent } from './my-dialog.component';
import { CUBFlowchartNode, CUBFlowchartNodeAddonEvent } from '@cub/material';
import MenntionModule, { MentionKeyboard } from '@cub/material/editor/basic-editor/modules/mention/module';
import { ulid } from 'ulidx';
import MentionBlot from '@cub/material/editor/basic-editor/modules/mention/blot';

const labelRange: number[] = _.range( 1, 6 );
const serverStorage: string = 'public/uploads/channel_undefined/default';

@Unsubscriber()
@Component({
	selector		: 'guideline',
	templateUrl		: './guideline.pug',
	host			: { class: 'flex layout-column' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class GuidelineComponent implements AfterViewInit {

	@ViewChildren( 'devCompTemplate', { read: TemplateRef } ) public devCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'systemCompTemplate', { read: TemplateRef } ) public systemCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'layoutCompTemplate', { read: TemplateRef } ) public layoutCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'overlayCompTemplate', { read: TemplateRef } ) public overlayCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'displayCompTemplate', { read: TemplateRef } ) public displayCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'pickerCompTemplate', { read: TemplateRef } ) public pickerCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'buttonCompTemplate', { read: TemplateRef } ) public buttonCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'inputCompTemplate', { read: TemplateRef } ) public inputCompTemplateList: QueryList<TemplateRef<{}>>;
	@ViewChildren( 'otherCompTemplate', { read: TemplateRef } ) public otherCompTemplateList: QueryList<TemplateRef<{}>>;

	public isCompNotFound: boolean;
	public console: typeof console = console;
	public currentCompTemplate: TemplateRef<any>;
	public BLOCK_TYPE: typeof WorkflowBlockType = WorkflowBlockType;

	// Icon
	public icons: typeof fontIcon.icons = fontIcon.icons;
	// public icons2: typeof fontIcon2.icons = fontIcon2.icons;

	// Action box
	public actionBoxVisible: boolean;
	public actionBoxPosition: WGCIActionBoxPosition;

	// Toast
	public hasDescription: boolean;

	// Board, Grid, Table, Card
	public arr: number[] = _.range( 1, 21 );

	// CDK Table
	public dataSource: WGCCdkTableDataSource<any> = new WGCCdkTableDataSource<any>();
	public displayedColumns: string[] = [
		'positions', 'description', 'kpi',
		'numberOfMembers', 'status',
	];

	public rootNode: CUBFlowchartNode = {
		id: ulid(),
		type: WorkflowBlockType.TRIGGER,
		nextNode: {
			id: ulid(),
			type: 'trigger',
			nextNode: {
				id: ulid(),
				type: 'condition',
				childNodes: [
					{
						id: ulid(),
						type: 'action',
						childNodes: [
							{
								id: ulid(),
								type: 'action',
								metadata: {
									label: 'Action 3.1',
								},
							},
							{
								id: ulid(),
								type: 'action',
								metadata: {
									label: 'Action 3.2',
								},
							},
							{
								id: ulid(),
								type: 'action',
								metadata: {
									label: 'Action 3.3',
								},
							},
							{
								id: ulid(),
								type: 'action',
								metadata: {
									label: 'Action 3.4',
								},
							},
							{
								id: ulid(),
								type: 'action',
								metadata: {
									label: 'Action 3.5',
								},
							},
						],
						metadata: {
							label: 'Action 3',
						},
					},
					{
						id: ulid(),
						type: 'action',
						nextNode: {
							id: ulid(),
							type: 'action',
							childNodes: [
								{
									id: ulid(),
									type: 'action',
									metadata: {
										label: 'Action 4.1.1',
									},
								},
								{
									id: ulid(),
									type: 'action',
									metadata: {
										label: 'Action 4.1.2',
									},
								},
								{
									id: ulid(),
									type: 'action',
									metadata: {
										label: 'Action 4.1.3',
									},
								},
								{
									id: ulid(),
									type: 'action',
									metadata: {
										label: 'Action 4.1.4',
									},
								},
								{
									id: ulid(),
									type: WorkflowBlockType.SUB_PROCESS,
									addOuterBox: true,
									childNodes: [
										{
											id: ulid(),
											type: WorkflowBlockType.ACTION,
											metadata: {
												label: 'Action 4.1.5',
											},
										},
									],
									metadata: {
										label: 'Sub-process 4.1.5',
									},
								},
							],
							metadata: {
								label: 'Action 4.1',
							},
						},
						metadata: {
							label: 'Action 4',
						},
					},
				],
				childNodeLineCaptions: [ 'Đúng', 'Sai' ],
				nextNode: {
					id: ulid(),
					type: 'action',
					nextNode: {
						id: ulid(),
						type: WorkflowBlockType.SUB_PROCESS,
						addOuterBox: true,
						childNodes: [
							{
								id: ulid(),
								type: 'action',
								nextNode: {
									id: ulid(),
									type: WorkflowBlockType.ACTION,
									metadata: {
										label: 'Action 5.1',
									},
								},
								metadata: {
									label: 'Action 5',
								},
							},
						],
						nextNode: {
							id: ulid(),
							type: 'condition',
							childNodes: [ null, null ],
							childNodeLineCaptions: [ 'Đúng', 'Sai' ],
							nextNode: {
								id: ulid(),
								type: 'action',
								disableInsertNextNode: true,
								metadata: {
									label: 'End',
								},
							},
							metadata: {
								label: 'Value > 51',
							},
						},
						metadata: {
							label: 'Sub-process',
						},
					},
					metadata: {
						label: 'Merge',
					},
				},
				metadata: {
					label: 'Value === 5',
				},
			},
			metadata: {
				label: 'Trigger 2',
			},
		},
		metadata: {
			label: 'Trigger 1',
		},
	};

	// WGC Table, CDK Table, Form field
	public positions: ObjectType[] = [
		{
			id			: 1,
			order		: 1,
			name		: 'CEO',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: 1,
			status		: 'Active',
			email		: 'ceo@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 2,
			order		: 2,
			name		: 'Vice President',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: 1,
			status		: 'Active',
			email		: 'vice@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 3,
			order		: 3,
			name		: 'Head of Department',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: 5,
			status		: 'Active',
			email		: 'head@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 4,
			order		: 4,
			name		: 'CFO',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: 2,
			status		: 'Active',
			email		: 'cfo@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 5,
			order		: 5,
			name		: 'CCO',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: undefined,
			status		: 'Active',
			email		: 'cco@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 6,
			order		: 6,
			name		: 'CMO',
			description	: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			kpi			: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
			noOfMembers	: undefined,
			status		: 'Active',
			email		: 'cmo@example.com',
			website		: 'https://example.com',
			done		: true,
			money		: 100000,
			assignees	: [ 1 ],
			priorities	: [ 'Urgent' ],
		},
		{
			id			: 7,
			order		: 7,
			name		: 'WFO',
			description	: undefined,
			kpi			: undefined,
			noOfMembers	: undefined,
			status		: undefined,
			email		: undefined,
			done		: false,
			money		: undefined,
			assignees	: undefined,
			priorities	: undefined,
		},
	];

	// Calendar
	public calendarEvents: any[] = [
		{
			id: '1',
			name: 'First event of the day',
			moment: moment(),
			color: COLOR.WHITE,
		},
		{
			id: '2',
			name: 'And another one',
			moment: moment(),
			color: COLOR.BLACK,
		},
		{
			id: '11',
			name: 'Inactive event',
			inactive: true,
			moment: moment(),
			color: COLOR.BLUE[ '400' ],
		},
		{
			id: '3',
			name: 'Event this',
			moment: moment().add( 1, 'h' ),
			color: COLOR.PRIMARY,
			actionable: true,
		},
		{
			id: '4',
			name: 'Event that',
			moment: moment().add( 1, 'h' ),
			color: COLOR.SUCCESS,
		},
		{
			id: '5',
			name: 'Eve',
			moment: moment().add( 1, 'h' ),
			color: COLOR.GREEN[ '400' ],
		},
		{
			id: '6',
			name: 'Farewell',
			moment: moment().add( 1, 'h' ),
		},
		{
			id: '7',
			name: 'YEP',
			moment: moment().add( 1, 'd' ),
			color: COLOR.SECONDARY,
			actionable: true,
		},
		{
			id: '7',
			name: 'YEP 2',
			moment: moment().add( 1, 'd' ),
			color: COLOR.DEFAULT,
		},
		{
			id: '8',
			name: 'YSP',
			moment: moment().add( 1, 'd' ),
		},
		{
			id: '9',
			name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et',
			moment: moment().add( 1, 'd' ),
			color: COLOR.INFO,
		},
		{
			id: '10',
			name: 'Supa long long text',
			moment: moment().add( 1, 'd' ),
		},
	];

	// Timeline
	public timelineEvent: any[] = [
		{
			id: '1',
			name: 'First event of the day',
			startDate: moment().subtract( 1, 'y' ),
			endDate: moment().add( 3, 'w' ),
			color: COLOR.SUCCESS,
		},
		{
			id: '2',
			name: 'And another one',
			startDate: moment().subtract( 2, 'w' ),
			endDate: moment().add( 4, 'y' ),
			color: COLOR.WARNING,
		},
		{
			id: '3',
			name: 'Event this',
			startDate: moment().add( 2, 'd' ),
			endDate: moment().add( 8, 'd' ),
			color: COLOR.DANGER,
			actionable: true,
		},
		{
			id: '4',
			name: 'Event that',
			startDate: moment().add( 6, 'd' ),
			endDate: moment().add( 10, 'd' ),
		},
		{
			id: '5',
			name: 'Eve',
			startDate: moment().add( 9, 'd' ),
			endDate: moment().add( 14, 'd' ),
		},
		{
			id: '6',
			name: 'Farewell',
			startDate: moment().add( 1, 'd' ),
			endDate: moment().add( 6, 'd' ),
		},
		{
			id: '7',
			name: 'Whi',
			startDate: moment().add( 2, 'd' ),
			endDate: moment().add( 2, 'd' ),
			color: COLOR.TEXT,
			actionable: true,
		},
		{
			id: '8',
			name: 'Mohamed',
			startDate: moment().add( 2, 'd' ),
			endDate: moment().add( 3, 'd' ),
		},
		{
			id: '9',
			name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et',
			startDate: moment().add( 4, 'd' ),
			endDate: moment().add( 4, 'd' ),
			color: COLOR.LABEL,
		},
		{
			id: '10',
			name: 'Supa long long text',
			startDate: moment().add( 4, 'd' ),
			endDate: moment().add( 6, 'd' ),
		},
		{
			id: '11',
			name: 'No end date event',
			startDate: moment().subtract( 1, 'd' ),
			endDate: undefined,
			actionable: true,
		},
		{
			id: '12',
			name: 'No start date event',
			startDate: undefined,
			endDate: moment().add( 1, 'd' ),
		},
		{
			id: '13',
			inactive: true,
			name: 'No start date event',
			startDate: undefined,
			endDate: moment().add( 1, 'd' ),
		},
		{
			id: '14',
			inactive: true,
			name: 'Whi',
			startDate: moment().add( 2, 'd' ),
			endDate: moment().add( 4, 'd' ),
			color: COLOR.TEXT,
			actionable: true,
		},
	];

	// Chart
	public chartLabels: string[] = _.map( labelRange, ( i: number ) => `Collection ${i}` );
	public barChartDatasets: WGCIBarChartDataset[] = [
		{ label: 'Open', color: COLOR.INFO, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'In Progress', color: COLOR.WARNING, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'Done', color: COLOR.SUCCESS, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'Extra Status', color: COLOR.DANGER, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'No Status', data: _.map( labelRange, () => _.random( 0, 100 ) ) },
	];
	public lineChartDatasets: WGCILineChartDataset[] = [
		{ label: 'Open', color: COLOR.INFO, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'In Progress', color: COLOR.WARNING, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'Done', color: COLOR.SUCCESS, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'Extra Status', color: COLOR.DANGER, data: _.map( labelRange, () => _.random( 0, 100 ) ) },
		{ label: 'No Status', data: _.map( labelRange, () => _.random( 0, 100 ) ) },
	];
	public pieChartDatasets: WGCIPieChartDataset[] = [
		{ label: 'Open', color: COLOR.INFO, data: _.random( 0, 100 ) },
		{ label: 'In Progress', color: COLOR.WARNING, data: _.random( 0, 100 ) },
		{ label: 'Done', color: COLOR.SUCCESS, data: _.random( 0, 100 ) },
		{ label: 'Extra Status', color: COLOR.DANGER, data: _.random( 0, 100 ) },
		{ label: 'No Status', data: _.random( 0, 100 ) },
	];
	public donutChartDatasets: WGCIDonutChartDataset[] = [
		{ label: 'Open', color: COLOR.INFO, data: _.random( 0, 100 ) },
		{ label: 'In Progress', color: COLOR.WARNING, data: _.random( 0, 100 ) },
		{ label: 'Done', color: COLOR.SUCCESS, data: _.random( 0, 100 ) },
		{ label: 'Extra Status', color: COLOR.DANGER, data: _.random( 0, 100 ) },
		{ label: 'No Status', data: _.random( 0, 100 ) },
	];

	// Carousel
	public photo: string[] = [
		'https://cdn.mos.cms.futurecdn.net/3maXWsbJ2mvMkeQSCMgXuT-1200-80.jpg',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT32X2Mj029zKOYNWlUZVmgIfEJfhJwQPXvjw&usqp=CAU',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPrLWhfsdPPfddqlZYh1HwE6h1tA9aTzMJaQ&usqp=CAU',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWIBr29q7hfoCNmEZjjrIqRgGompa5FqErUQ&usqp=CAU',
		'https://i.etsystatic.com/9824055/r/il/4acfc2/1660036854/il_570xN.1660036854_aj88.jpg',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBpyx7czYAkLPaGwjiO0ESTxkhw9-wlpPCyg&usqp=CAU',
		'https://www.incimages.com/uploaded_files/image/1920x1080/getty_1014168768_2000130420009280281_415027.jpg',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTStGXG8xcqqZCto82IgTI3zuPca2Sj3eg6eA&usqp=CAU',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfhqVtDcW8DebOiIBeJ5V5j2YHDXFI19atsg&usqp=CAU',
		'https://cdn.cnn.com/cnnnext/dam/assets/200318154845-08-people-creative-wfh-setup-large-169.jpg',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6vCaqdYOcF4dbFC2B9CjCIdcyFVhEtdDfOw&usqp=CAU',
		'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR95r_brGGScXpIcIhg3OvXegXcITz5IcN6XA&usqp=CAU',
	];

	// Date picker
	public currentDate: Moment = moment().subtract( 1, 'M' );
	public currentDateRange: Moment[] = [ this.currentDate.clone(), this.currentDate.clone().add( 3, 'd' ) ];
	public minDate: Moment = this.currentDate.clone().subtract( 10, 'd' );
	public maxDate: Moment = this.currentDate.clone().add( 10, 'd' );

	// Member picker
	public optionAll: CUBTMember = { id: '0', name: 'All Collection Users', avatar: { color: '#fdb022' } };
	public selected: string[] = [ '1', '2', '3', '4' ];
	public selectedUserIDs: string[] = [ '1', '2', '3', '4', '5' ];
	public selectedTeamIDs: string[] = [ '3', '4' ];
	public users: CUBTMember[] = [
		{ id: '1', name: 'Member 1', status: 1, role: { name: 'Owner' }, cannotRemove: true },
		{ id: '2', name: 'Member 2', status: 1 },
		{ id: '3', name: 'Member 3', status: 2 },
		{ id: '4', name: 'Member 4', status: 2 },
		{ id: '5', name: 'Member 5', status: 3 },
	];
	public teams: CUBTMember[] = [
		{ id: '1', name: 'Team 1', status: 1 },
		{ id: '2', name: 'Team 2', status: 1 },
		{ id: '3', name: 'Team 3', status: 1 },
		{ id: '4', name: 'Team 4', status: 1 },
	];
	public members: WGCIMember[] = [
		{ id: '1', name: 'Member 1', status: 1 },
		{ id: '2', name: 'Member 2', status: 1 },
		{ id: '3', name: 'Member 3', status: 2 },
		{ id: '4', name: 'Member 4', status: 2 },
		{ id: '5', name: 'Member 5', status: 3 },
		{ id: '6', name: 'Member 6', status: 1 },
		{ id: '7', name: 'Member 7', status: 1 },
	];
	public members$: Observable<WGCIMember[]> = new Observable( ( observer: Observer<WGCIMember[]> ) => {
		observer.next( this.members );
	} );

	// Form field
	public requiredFormControl: FormControl = new FormControl( undefined, [ Validators.required ] );
	public emailFormControl: FormControl = new FormControl (
		undefined,
		[
			Validators.maxLength( 255 ),
			Validators.pattern( REGEXP.EMAIL ),
		]
	);

	// Inline input
	public inline: string = 'New Inline';

	// Phone field
	public phone: any;

	// Range input
	public range: number[];

	// Rating
	public ratingValue: number = 3;

	// Slider
	public slideValue: number = 70;

	// Comment
	public user: IUser = { id: '8', name: 'Administrator', avatar: undefined, status: 1 };
	public comments: WGCIComment[] = [
		{
			id				: '1',
			createdBy		: '1',
			replyTo			: undefined,
			createdAt		: '2020-11-05T06:16:51.000Z',
			updatedAt		: '2020-11-05T06:16:51.000Z',
			editable		: false,
			totalReplies	: 0,
			reactionCount	: 6,
			user			: { id: '6', name: 'Nguyen Van Owner', avatar: undefined },
			content: {
				content	: { ops: [{ insert: 'Hello World!\n' }] } as any,
				html	: '<p>Hello World!</p>',
				text	: 'Hello World!\n',
			},
			reactions: [
				{
					iconType: 2,
					users: [
						{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
						{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
					],
				},
				{
					iconType: 3,
					users: [
						{ id: '2', name: 'Tran Hoang Admin', avatar: undefined },
						{ id: '3', name: 'Ngo Cong An', avatar: undefined },
					],
				},

				{
					iconType: 6,
					users: [
						{ id: '7', name: 'Bui Chieu', avatar: undefined },
						{ id: '8', name: 'Administrator', avatar: undefined },
					],
				},
			],
		},
		{
			id				: '2',
			createdBy		: '2',
			replyTo			: undefined,
			createdAt		: '2020-11-16T10:23:27.000Z',
			updatedAt		: '2020-11-16T10:23:27.000Z',
			editable		: true,
			totalReplies	: 4,
			reactionCount	: 7,
			user			: { id: '2', name: 'Tran Hoang Admin', avatar: undefined },
			content: {
				content	: { ops: [{ insert: 'Hi Cub\n' }] } as any,
				html	: '<p>Hi Cub</p>',
				text	: 'Hi Cub\n',
			},
			replies: [
				{
					id				: '3',
					createdBy		: '2',
					replyTo			: '2',
					createdAt		: '2020-11-05T08:27:03.000Z',
					updatedAt		: '2020-11-05T08:27:03.000Z',
					editable		: true,
					reactionCount	: 5,
					user: { id: '2', name: 'Tran Hoang Admin', avatar: undefined },
					attachments: [{
						size			: 8833,
						name			: 'Screenshot from 2020-10-12 15-20-50_1604564435609.png',
						attachmentType	: 'local',
						createdAt		: moment(),
						location		: 'https://dummyimage.com/300.png/09f/fff',
					}],
					content: {
						content	: { ops: [{ insert: 'able\n' }] } as any,
						html	: '<p>able</p>',
						text	: 'able\n',
					},
					reactions: [
						{
							iconType: 1,
							users: [
								{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
								{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
								{ id: '8', name: 'Administrator', avatar: undefined },
							],
						},
						{
							iconType: 2,
							users: [
								{ id: '2', name: 'Tran Hoang Admin', avatar: undefined },
								{ id: '3', name: 'Ngo Cong An', avatar: undefined },
							],
						},
						{
							iconType: 7,
							users	: [{ id: '7', name: 'Bui Chieu', avatar: undefined }],
						},
					],
				},
				{
					id				: '4',
					createdBy		: '2',
					replyTo			: '2',
					createdAt		: '2020-11-05T08:27:03.000Z',
					updatedAt		: '2020-11-05T08:27:03.000Z',
					editable		: true,
					reactionCount	: 2,
					user			: { id: '3', name: 'Ngo Cong An', avatar: undefined },
					attachments: [{
						size			: 8833,
						name			: 'Screenshot from 2020-10-12 15-20-50_1604564435609.png',
						attachmentType	: 'local',
						createdAt		: moment(),
						path			: `${serverStorage}/2020-11-05/Screenshot from 2020-10-12 15-20-50_1604564435609.png`,
						location		: `http://localhost:3000/${serverStorage}/2020-11-05/Screenshot%20from%202020-10-12%2015-20-50_1604564435609.png`,
					}],
					content: {
						content	: { ops: [{ insert: 'hi\n' }] } as any,
						html	: '<p>hi</p>',
						text	: 'hi\n',
					},
					reactions: [{
						iconType: 2,
						users: [
							{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
							{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
						],
					}],
				},
				{
					id				: '5',
					createdBy		: '2',
					replyTo			: '2',
					createdAt		: '2020-11-05T08:27:03.000Z',
					updatedAt		: '2020-11-05T08:27:03.000Z',
					editable		: true,
					reactionCount	: 5,
					user			: { id: '4', name: 'Ngo Duc Trung', avatar: undefined },
					attachments: [{
						size			: 8833,
						name			: 'Screenshot from 2020-10-12 15-20-50_1604564435609.png',
						attachmentType	: 'local',
						createdAt		: moment(),
						path			: `${serverStorage}/2020-11-05/Screenshot from 2020-10-12 15-20-50_1604564435609.png`,
						location		: `http://localhost:3000/${serverStorage}/2020-11-05/Screenshot%20from%202020-10-12%2015-20-50_1604564435609.png`,
					}],
					content: {
						content	: { ops: [{ insert: 'hello\n' }] } as any,
						html	: '<p>hello</p>',
						text	: 'hello\n',
					},
					reactions: [
						{
							iconType: 1,
							users: [
								{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
								{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
							],
						},
						{
							iconType: 2,
							users: [
								{ id: '2', name: 'Tran Hoang Admin', avatar: undefined },
								{ id: '3', name: 'Ngo Cong An', avatar: undefined },
							],
						},
						{
							iconType: 3,
							users	: [{ id: '5', name: 'Tran Cong Phu', avatar: undefined }],
						},
					],
				},
				{
					id				: '6',
					createdBy		: '2',
					replyTo			: '2',
					createdAt		: '2020-11-05T08:27:03.000Z',
					updatedAt		: '2020-11-05T08:27:03.000Z',
					editable		: true,
					reactionCount	: 0,
					user			: { id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
					reactions		: [],
					attachments: [{
						size			: 8833,
						name			: 'Screenshot from 2020-10-12 15-20-50_1604564435609.png',
						attachmentType	: 'local',
						createdAt		: moment(),
						path: 'public/uploads/channel_undefined/default/2020-11-05/'
							+ 'Screenshot from 2020-10-12 15-20-50_1604564435609.png',
						location: 'http://localhost:3000/public/uploads/channel_undefined/default/2020-11-05/'
							+ 'Screenshot%20from%202020-10-12%2015-20-50_1604564435609.png',
					}],
					content: {
						content	: { ops: [{ insert: 'say hi\n' }] } as any,
						html	: '<p>say hi</p>',
						text	: 'say hi\n',
					},
				},
			],
			reactions: [
				{
					iconType: 1,
					users: [
						{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
						{ id: '3', name: 'Ngo Cong An', avatar: undefined },
					],
				},
				{
					iconType: 2,
					users: [
						{ id: '2', name: 'Tran Hoang Admin', avatar: undefined },
						{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
					],
				},
				{
					iconType: 5,
					users	: [{ id: '5', name: 'Tran Cong Phu', avatar: undefined }],
				},
				{
					iconType: 6,
					users	: [{ id: '6', name: 'Nguyen Van Owner', avatar: undefined }],
				},
				{
					iconType: 7,
					users	: [{ id: '7', name: 'Bui Chieu', avatar: undefined }],
				},
			],
		},
		{
			id				: '4',
			createdBy		: '1',
			replyTo			: undefined,
			createdAt		: '2020-11-05T06:16:51.000Z',
			updatedAt		: '2020-11-05T06:16:51.000Z',
			editable		: false,
			totalReplies	: 0,
			reactionCount	: 3,
			user			: { id: '6', name: 'Nguyen Van Owner', avatar: undefined },
			content: {
				content: {
					ops: [
						{ insert: 'What is Lorem Ipsum?\n' },
						{ attributes: { bold: true }, insert: 'Lorem Ipsum' },
						{ insert: ' is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s'
							+ ' standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it'
							+ ' to make a type specimen book. It has survived not only five centuries, but also the leap into electronic'
							+ ' typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset'
							+ ' sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus'
							+ ' PageMaker including versions of Lorem Ipsum.\nWhy do we use it?\nIt is a long established fact that a'
							+ ' reader will be distracted by the readable content of a page when looking at its layout. The point of using'
							+ ' Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content'
							+ ' here, content here\', making it look like readable English. Many desktop publishing packages and web page'
							+ ' editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many'
							+ ' web sites still in their infancy. Various versions have evolved over the years, sometimes by accident,'
							+ ' sometimes on purpose (injected humour and the like).\n\nWhere does it come from?\nContrary to popular'
							+ ' belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from'
							+ ' 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in'
							+ ' Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going'
							+ ' through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes'
							+ ' from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by'
							+ ' Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the'
							+ ' Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section'
							+ ' 1.10.32.\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.'
							+ ' Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their'
							+ ' exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\nWhere can I'
							+ ' get some?\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered'
							+ ' alteration in some form, by injected humour, or randomised words which don\'t look even slightly'
							+ ' believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything'
							+ ' embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat'
							+ ' predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary'
							+ ' of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum'
							+ ' which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected'
							+ ' humour, or non-characteristic words etc.\n',
						},
					],
				} as any,
				html: '<p>What is Lorem Ipsum?</p><p><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting'
					+ ' industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer'
					+ ' took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but'
					+ 'also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the'
					+ ' release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like'
					+ ' Aldus PageMaker including versions of Lorem Ipsum.</p><p>Why do we use it?</p><p>It is a long established fact that'
					+ ' a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem'
					+ ' Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content'
					+ ' here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem'
					+ ' Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their'
					+ ' infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour'
					+ ' and the like).</p><p><br></p><p>Where does it come from?</p><p>Contrary to popular belief, Lorem Ipsum is not'
					+ ' simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years'
					+ ' old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure'
					+ ' Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical'
					+ ' literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus'
					+ ' Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the'
					+ ' theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit'
					+ ' amet..\", comes from a line in section 1.10.32.</p><p>The standard chunk of Lorem Ipsum used since the 1500s is'
					+ ' reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by'
					+ ' Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation'
					+ ' by H. Rackham.</p><p>Where can I get some?</p><p>There are many variations of passages of Lorem Ipsum available,'
					+ ' but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look'
					+ ' even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t'
					+ ' anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat'
					+ ' predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over'
					+ ' 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks'
					+ ' reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or'
					+ ' non-characteristic words etc.</p>',
				text: 'What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing'
					+ ' and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an'
					+ ' unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five'
					+ ' centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in'
					+ ' the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop'
					+ ' publishing software like Aldus PageMaker including versions of Lorem Ipsum.\nWhy do we use it?\nIt is a long'
					+ ' established fact that a reader will be distracted by the readable content of a page when looking at its layout. The'
					+ ' point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using'
					+ ' \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page'
					+ ' editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web'
					+ ' sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on'
					+ ' purpose (injected humour and the like).\n\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not'
					+ ' simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years'
					+ ' old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure'
					+ ' Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical'
					+ ' literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus'
					+ ' Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the'
					+ ' theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit'
					+ ' amet..\", comes from a line in section 1.10.32.\nThe standard chunk of Lorem Ipsum used since the 1500s is'
					+ ' reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by'
					+ ' Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation'
					+ ' by H. Rackham.\nWhere can I get some?\nThere are many variations of passages of Lorem Ipsum available, but the'
					+ ' majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even'
					+ ' slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything'
					+ ' embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined'
					+ ' chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin'
					+ ' words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The'
					+ ' generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.\n',
			},
			reactions: [
				{
					iconType: 1,
					users: [
						{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined },
						{ id: '4', name: 'Ngo Duc Trung', avatar: undefined },
					],
				},
				{
					iconType: 7,
					users	: [{ id: '7', name: 'Bui Chieu', avatar: undefined }],
				},
			],
		},
	];

	public suggestionFn: typeof this.suggestion = this.suggestion.bind( this );
	public suggestionServerSideFn: typeof this.suggestionServerSide = this.suggestionServerSide.bind( this );
	public mentionSourceFn: typeof this.mentionSource = this.mentionSource.bind( this );

	@ViewChild( 'trigger' ) public trigger: any;

	public options: any = {
		modules: {
			mention: {
				onQueryStart: () => {
					this.trigger.open();
				},
				onQueryEnd: () => {
					this.trigger.close();
				},
				onMentionAttached: (
					_m: MenntionModule,
					blot: MentionBlot
				) => {
					console.log( "Attached", blot );
				},
				onMentionDetached: (
					_m: MenntionModule,
					blot: MentionBlot
				) => {
					console.log( "Detached", blot );
				},
				onMentionClicked: (
					_m: MenntionModule,
					blot: MentionBlot,
					e: MouseEvent
				) => {
					console.log( "Clicked", blot, e );
				},
				onMentionHovered: (
					_m: MenntionModule,
					blot: MentionBlot,
					e: MouseEvent
				) => {
					console.log( "Hovered", blot, e );
				},
				onKeyboardEvents: (
					module: MenntionModule,
					key: MentionKeyboard
				): boolean => {
					let bool: boolean = true;

					switch ( key ) {
						case MentionKeyboard.ArrowUp:
							bool = false;
							this.trigger.menu.pointPreviousItem();
							break;
						case MentionKeyboard.ArrowDown:
							bool = false;
							this.trigger.menu.pointNextItem();
							break;
						case MentionKeyboard.Enter:
							bool = false;
							this.trigger.menu.choosePointingItem();
							break;
						case MentionKeyboard.ArrowLeft:
						case MentionKeyboard.ArrowRight:
						case MentionKeyboard.Escape:
							module.exit();
							break;
					}

					return bool;
				},
			},
		},
	};

	private _filteredDevCompTemplates: TemplateRef<{}>[];
	private _filteredSystemCompTemplates: TemplateRef<{}>[];
	private _filteredLayoutCompTemplates: TemplateRef<{}>[];
	private _filteredOverlayCompTemplates: TemplateRef<{}>[];
	private _filteredDisplayCompTemplates: TemplateRef<{}>[];
	private _filteredPickerCompTemplates: TemplateRef<{}>[];
	private _filteredButtonCompTemplates: TemplateRef<{}>[];
	private _filteredInputCompTemplates: TemplateRef<{}>[];
	private _filteredOtherCompTemplates: TemplateRef<{}>[];
	private _userMentions: IUser[] = [
		{ id: '1', name: 'Nguyen Thai Quy', avatar: undefined, status: 1 },
		{ id: '2', name: 'Tran Hoang Admin', avatar: undefined, status: 1 },
		{ id: '3', name: 'Ngo Cong An', avatar: undefined, status: 2 },
		{ id: '4', name: 'Ngo Duc Trung', avatar: undefined, status: 2 },
		{ id: '5', name: 'Tran Cong Phu', avatar: undefined, status: 3 },
		{ id: '6', name: 'Nguyen Van Owner', avatar: undefined, status: 3 },
		{ id: '7', name: 'Bui Chieu', avatar: undefined, status: 3 },
		{ id: '8', name: 'Administrator', avatar: undefined, status: 3 },
	];

	get devCompTemplates(): TemplateRef<{}>[] { return this._filteredDevCompTemplates || this.devCompTemplateList?.toArray(); }
	get systemCompTemplates(): TemplateRef<{}>[] { return this._filteredSystemCompTemplates || this.systemCompTemplateList?.toArray(); }
	get layoutCompTemplates(): TemplateRef<{}>[] { return this._filteredLayoutCompTemplates || this.layoutCompTemplateList?.toArray(); }
	get overlayCompTemplates(): TemplateRef<{}>[] { return this._filteredOverlayCompTemplates || this.overlayCompTemplateList?.toArray(); }
	get displayCompTemplates(): TemplateRef<{}>[] { return this._filteredDisplayCompTemplates || this.displayCompTemplateList?.toArray(); }
	get pickerCompTemplates(): TemplateRef<{}>[] { return this._filteredPickerCompTemplates || this.pickerCompTemplateList?.toArray(); }
	get buttonCompTemplates(): TemplateRef<{}>[] { return this._filteredButtonCompTemplates || this.buttonCompTemplateList?.toArray(); }
	get inputCompTemplates(): TemplateRef<{}>[] { return this._filteredInputCompTemplates || this.inputCompTemplateList?.toArray(); }
	get otherCompTemplates(): TemplateRef<{}>[] { return this._filteredOtherCompTemplates || this.otherCompTemplateList?.toArray(); }
	get compTemplates(): TemplateRef<{}>[] {
		return [
			...this.devCompTemplates, ...this.systemCompTemplates, ...this.layoutCompTemplates,
			...this.overlayCompTemplates, ...this.displayCompTemplates, ...this.pickerCompTemplates,
			...this.buttonCompTemplates, ...this.inputCompTemplates, ...this.otherCompTemplates,
		];
	}

	/**
	 * @constructor
	 * @param {ActivatedRoute} _route
	 * @param {WGCConfirmService} _wgcConfirmService
	 * @param {WGCDialogService} _wgcDialogService
	 * @param {WGCToastService} _wgcToastService
	 */
	constructor(
		private _route: ActivatedRoute,
		private _wgcConfirmService: WGCConfirmService,
		private _wgcDialogService: WGCDialogService,
		private _wgcToastService: WGCToastService
	) {
		this.dataSource.data = this.positions;
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		const selectedCompIndex: number = +this._route.snapshot.fragment || 0;

		this.currentCompTemplate = this.compTemplates[ selectedCompIndex ];

		this.devCompTemplateList.changes
		.pipe(
			startWith( this.compTemplates ),
			untilCmpDestroyed( this )
		)
		.subscribe( () => {
			_.forEach( this.compTemplates, ( item: TemplateRef<{}> ) => {
				( item as ObjectType ).label = ( item as ObjectType )._declarationTContainer.attrs[ 1 ];
			} );
		} );
	}

	/**
	 * @param {TemplateRef} compTemplate
	 * @return {void}
	 */
	public selectCompTemplate( compTemplate: TemplateRef<{}> ) {
		const selectedCompIndex: number = _.indexOf( this.compTemplates, compTemplate );

		this.currentCompTemplate = compTemplate;
		window.location.hash = selectedCompIndex?.toString();
	}

	/**
	 * @param {string} searchStr
	 * @return {void}
	 */
	public onSearch( searchStr: string ) {
		this._filteredDevCompTemplates = searchStr
			? _.filter( this.devCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredSystemCompTemplates = searchStr
			? _.filter( this.systemCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredLayoutCompTemplates = searchStr
			? _.filter( this.layoutCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredOverlayCompTemplates = searchStr
			? _.filter( this.overlayCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredDisplayCompTemplates = searchStr
			? _.filter( this.displayCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredPickerCompTemplates = searchStr
			? _.filter( this.pickerCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredButtonCompTemplates = searchStr
			? _.filter( this.buttonCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredInputCompTemplates = searchStr
			? _.filter( this.inputCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;
		this._filteredOtherCompTemplates = searchStr
			? _.filter( this.otherCompTemplates, ( compTemplate: TemplateRef<{}> ) => _.search( ( compTemplate as any ).label, searchStr ) )
			: null;

		this.isCompNotFound = _.every(
			[
				this.devCompTemplates.length, this.systemCompTemplates.length, this.layoutCompTemplates.length,
				this.overlayCompTemplates.length, this.displayCompTemplates.length, this.pickerCompTemplates.length,
				this.buttonCompTemplates.length, this.inputCompTemplates.length, this.otherCompTemplates.length,
			],
			( length: number ) => !length
		);
	}

	/**
	 * @param {boolean} hasDescription
	 * @return {void}
	 */
	public showToast( hasDescription?: boolean ) {
		this._wgcToastService.show(
			'A simple general message',
			hasDescription
				? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
				: undefined,
			{ translate: false }
		);
	}

	/**
	 * @param {boolean} hasDescription
	 * @return {void}
	 */
	public showInfoToast( hasDescription?: boolean ) {
		this._wgcToastService.info(
			'There are over 180 integrations available.',
			hasDescription
				? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
				: undefined,
			{ translate: false }
		);
	}

	/**
	 * @param {boolean} hasDescription
	 * @return {void}
	 */
	public showSuccessToast( hasDescription?: boolean ) {
		this._wgcToastService.success(
			'You have successfully enabled Personas.',
			hasDescription
				? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
				: undefined,
			{ translate: false }
		);
	}

	/**
	 * @param {boolean} hasDescription
	 * @return {void}
	 */
	public showWarningToast( hasDescription?: boolean ) {
		this._wgcToastService.warning(
			'Your plan only supports a compute history of 30 days',
			hasDescription
				? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
				: undefined,
			{ translate: false }
		);
	}

	/**
	 * @param {boolean} hasDescription
	 * @return {void}
	 */
	public showDangerToast( hasDescription?: boolean ) {
		this._wgcToastService.danger(
			'We weren\'t able to save your changes.',
			hasDescription
				? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
				: undefined,
			{ translate: false }
		);
	}

	/**
	 * @param {any} dialog
	 * @return {void}
	 */
	public openDialog( dialog?: any ) {
		const dialogRef: WGCIDialogRef = this._wgcDialogService.open(
			dialog || MyDialogComponent,
			{
				data	: { content: 'This is the content pass by data' },
				width	: '1346px',
				height	: '795px',
				pager	: true,
			}
		);

		/* eslint-disable */
		dialogRef.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog opened' ) );
		dialogRef.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog closed' ) );
		dialogRef.afterFreezed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog freezed' ) );
		dialogRef.afterUnfreezed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog unfreezed' ) );
		dialogRef.afterFullscreen()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog open fullscreen' ) );
		dialogRef.afterExitFullscreen()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => console.log( 'After dialog exit fullscreen' ) );
		dialogRef.afterPagerClicked()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( type: WGCIDialogPagerType ) => console.log( `After dialog button ${type} clicked` ) );
		/* eslint-enable */
	}

	/**
	 * @param {boolean} isDialog
	 * @return {void}
	 */
	public openConfirm( isDialog: boolean = false ) {
		const confirmRef: WGCIConfirmRef = this._wgcConfirmService.open(
			'This is confirm message',
			'This is confirm title',
			{ translate: false, type: isDialog ? 'dialog' : 'popup' } // Default "dialog"
		);

		/* eslint-disable */
		confirmRef.afterOpened().subscribe( () => console.log( 'After confirm opened' ) );
		confirmRef.afterClosed().subscribe( () => console.log( 'After confirm closed' ) );
		/* eslint-enable */
	}

	/**
	 * @param {string} searchStr
	 * @return {ObjectType}
	 */
	public suggestion( searchStr: string ): ObjectType[] {
		return _.filter( this.positions, ( position: ObjectType ) => {
			return _.search( position.name, searchStr );
		} );
	}

	/**
	 * @param {string} searchStr
	 * @return {Observable}
	 */
	public suggestionServerSide( searchStr: string ): Observable<ObjectType[]> {
		return new Observable( ( observer: Observer<ObjectType[]> ) => {
			observer.next(
				_.filter( this.positions, ( position: ObjectType ) => {
					return _.search( position.name, searchStr );
				} )
			);
		} );
	}

	/**
	 * @return {Observable}
	 */
	public mentionSource(): Observable<WGCIMention[]> | WGCIMention[] {
		return new Observable( ( observer: Observer<WGCIMention[]> ) => {
			const _mentionSource: WGCIMention[] = _.map( this._userMentions, ( user: IUser ) => ({
				id		: user.id,
				value	: user.name,
				link	: '',
				avatar	: user.avatar,
			}) ) as any;

			observer.next( _mentionSource );
			observer.complete();
		} );
	}

	public addNode(
		{
			flowchart,
			sourceNode,
			position,
		}: CUBFlowchartNodeAddonEvent
	) {
		flowchart.insertNode(
			sourceNode,
			{
				id: ulid(),
				type: 'action',
				metadata: {
					label: 'New action',
				},
			},
			position
		);
	}

}
