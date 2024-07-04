/* eslint-disable max-len */
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
	Input,
	OnChanges,
	Optional,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import {
	Observable,
	Observer
} from 'rxjs';
import {
	takeWhile
} from 'rxjs/operators';
import _ from 'lodash';

import {
	COLOR
} from '@resources';

import {
	CoerceBoolean,
	CoerceCssPixel,
	CoerceNumber,
	ContrastPipe,
	DefaultValue,
	EmojiPipe,
	Memoize,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBPageComponent
} from '../page';
import {
	CUBMenuComponent
} from '../menu';
import {
	CUBTabsComponent
} from '../tabs';

export enum AvatarType {
	USER = 'user',
	TEAM = 'team',
}

export type CUBAvatarType = 'user' | 'team';
export type CUBAvatarSize = 'xxxlarge'
	| 'xxlarge'
	| 'xlarge'
	| 'large'
	| 'medium'
	| 'medium-small'
	| 'small';

export type CUBAvatar = {
	photo?: string;
	color?: string;
	mode?: CUBAvatarMode;
	label?: {
		text: string;
		color?: string;
	};
	icon?: {
		name: string;
		color?: string;
	};
};

type CUBAvatarMode = 'auto' | 'text' | 'photo' | 'icon';

type CUBAvatarOptions = {
	characters?: number;
	labelColor?: string;
	size?: string | CUBAvatarSize;
};

@Unsubscriber()
@Component({
	selector		: 'cub-avatar',
	templateUrl		: './avatar.pug',
	styleUrls		: [ './avatar.scss' ],
	host			: { class: 'cub-avatar' },
	providers		: [ CUBPageComponent, CUBMenuComponent, CUBTabsComponent ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBAvatarComponent
implements OnChanges {

	@HostBinding( 'style.--avatar-color' )
	get styleColor(): string { return this.avatar?.color; }

	@HostBinding( 'style.--avatar-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'style.--avatar-label-color' )
	get styleLabelColor(): string {
		return this.avatar?.label?.color || this.parsedLabelColor;
	}

	@HostBinding( 'class.cub-avatar--auto-color' )
	get classAuto(): boolean { return this.avatar?.color === 'auto'; }

	@HostBinding( 'class.cub-avatar--small' )
	get classSmall(): boolean { return this.size === 'small'; }

	@HostBinding( 'class.cub-avatar--medium-small' )
	get classMediumSmall(): boolean { return this.size === 'medium-small'; }

	@HostBinding( 'class.cub-avatar--medium' )
	get classMedium(): boolean { return this.size === 'medium'; }

	@HostBinding( 'class.cub-avatar--large' )
	get classLarge(): boolean { return this.size === 'large'; }

	@HostBinding( 'class.cub-avatar--xlarge' )
	get classXLarge(): boolean { return this.size === 'xlarge'; }

	@HostBinding( 'class.cub-avatar--xxlarge' )
	get classXXLarge(): boolean { return this.size === 'xxlarge'; }

	@HostBinding( 'class.cub-avatar--xxxlarge' )
	get classXXXLarge(): boolean { return this.size === 'xxxlarge'; }

	@HostBinding( 'class.cub-avatar--has-outline' )
	get classHasOutline(): boolean { return this.hasOutline; }

	@Input() @DefaultValue() @CoerceCssPixel()
	public size: string | CUBAvatarSize = 'medium';
	@Input() @DefaultValue() @CoerceNumber()
	public characters: number = 2;
	@Input() @DefaultValue()
	public lazy: boolean = true;
	@Input() @DefaultValue()
	public avatar: CUBAvatar;
	@Input() @CoerceBoolean() public hasOutline: boolean;
	@Input() public type: CUBAvatarType;
	@Input() public label: string;
	@Input() public labelColor: string;
	@Input() public defaultPhoto: string;
	@Input() public errorPhoto: string;

	protected parsedLabel: string;
	protected parsedLabelColor: string;
	protected isPhotoLoaded$: Observable<boolean>;

	get iconSize(): string {
		let size: string;

		switch ( this.size ) {
			case 'small':
				size = '14px';
				break;
			case 'medium-small':
				size = '16px';
				break;
			case 'medium':
				size = '17px';
				break;
			case 'large':
				size = '21px';
				break;
			case 'xlarge':
				size = '28px';
				break;
			case 'xxlarge':
				size = '40px';
				break;
			case 'xxxlarge':
				size = '54px';
				break;
		}

		return size;
	}

	/**
	 * @constructor
	 * @param {CUBPageComponent} pageComp
	 * @param {CUBMenuComponent} menuComp
	 * @param {CUBTabsComponent} tabGroupComp
	 */
	constructor(
		@Optional() @Inject( CUBPageComponent )
		public pageComp: CUBPageComponent,
		@Optional() @Inject( CUBMenuComponent )
		public menuComp: CUBMenuComponent,
		@Optional() @Inject( CUBTabsComponent )
		public tabGroupComp: CUBTabsComponent
	) {}

	/**
	 * @param {string} label
	 * @param {number} characters
	 * @return {string}
	 */
	@Memoize()
	public static parseLabel(
		label: string = '',
		characters: number = 2
	): string {
		if ( !label?.length ) return '?';

		label = _.trim( label );

		return label.search( ' ' ) === -1
			? label.substring( 0, characters )
			: _.chain( label )
			.split( ' ' )
			.slice( 0, characters )
			.map( ( item: string ) => item.charAt( 0 ) )
			.join( '' )
			.value();
	}

	/**
	 * @param {string} avatarColor
	 * @return {string}
	 */
	@Memoize()
	public static parseLabelColor( avatarColor: string ): string {
		return avatarColor
			? new ContrastPipe().transform( avatarColor )
			: 'unset';
	}

	/**
	 * @param {string} label
	 * @param {CUBAvatar} avatar
	 * @param {CUBAvatarOptions=} options
	 * @return {string}
	 */
	public static parseAvatar(
		label: string,
		avatar: CUBAvatar,
		options?: CUBAvatarOptions
	): string {
		const avatarMode: string = avatar?.mode || 'auto';
		const avatarColor: string = avatar?.color || 'auto';
		const avatarIcon: string = avatar?.icon.name;
		const avatarPhoto: string = avatar?.photo;

		label = CUBAvatarComponent.parseLabel(
			label,
			options?.characters
		);
		label = ( avatarMode === 'icon'
			? new EmojiPipe().transform( avatarIcon )
			: undefined ) || label;

		const labelColor: string
			= options?.labelColor
			|| CUBAvatarComponent.parseLabelColor( avatarColor );
		const size: string | CUBAvatarSize
			= options?.size || 'small';
		const labelEl: string
			= `<div class="cub-avatar__label">${label}</div>`;
		const imgEl: string
			= avatarPhoto
			&& avatarMode === 'photo'
				? `<img class="cub-avatar__image" src="${avatarPhoto}" />`
				: '';
		const avatarClass: string[] = [ 'cub-avatar', 'cub-avatar--' + size ];

		avatarColor === 'auto' && avatarClass.push( 'cub-avatar--auto-color' );

		return `
			<div
				class="${avatarClass.join( ' ' )}"
				style="--avatar-color: ${avatarColor}; --avatar-label-color: ${labelColor}; --avatar-size: ${size};">
				${labelEl}
				${imgEl}
			</div>
		`;
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if (
			changes.label
		) {
			this.parsedLabel
				= CUBAvatarComponent.parseLabel( this.label, this.characters );
		}

		if ( changes.avatar ) {
			this.avatar = {
				...this.avatar,
				mode	: this.avatar?.mode || 'auto',
				color	: this.avatar?.color || 'auto',
			};
			this.parsedLabelColor
				= this.labelColor
					|| CUBAvatarComponent.parseLabelColor( this.avatar.color );
			this.isPhotoLoaded$ = this._checkPhotoLoaded( this.avatar.photo );
		}

		if (
			changes.type?.currentValue === AvatarType.TEAM
		) {
			this.avatar = {
				...this.avatar,
				color: '#8fb63e',
				label: {
					color: COLOR.WHITE,
				} as any,
			};
		}
	}

	/**
	 * @param {CUBAvatarMode} mode
	 * @return {boolean}
	 */
	@Memoize()
	public isAutoMode( mode: CUBAvatarMode ): boolean {
		return mode === 'auto';
	}

	/**
	 * @param {CUBAvatarMode} mode
	 * @return {boolean}
	 */
	@Memoize()
	public isPhotoMode( mode: CUBAvatarMode ): boolean {
		return mode === 'photo';
	}

	/**
	 * @param {CUBAvatarMode} mode
	 * @return {boolean}
	 */
	@Memoize()
	public isIconMode( mode: CUBAvatarMode ): boolean {
		return mode === 'icon';
	}

	/**
	 * @param {CUBAvatarMode} mode
	 * @return {boolean}
	 */
	@Memoize()
	public isTextMode( mode: CUBAvatarMode ): boolean {
		return mode === 'text';
	}

	/**
	 * @param {string} photo
	 * @return {Observable}
	 */
	@Memoize()
	private _checkPhotoLoaded( photo: string ): Observable<boolean> {
		return new Observable( ( observer: Observer<boolean> ) => {
			if ( !photo ) {
				observer.next( false );
				return;
			}

			if ( /^(data:image)/.test( photo ) ) {
				observer.next( true );
				return;
			}

			const img: HTMLImageElement = document.createElement( 'img' );

			img.src = photo;

			img.onload = () => observer.next( img.complete || img.naturalWidth > 0 );
		} ).pipe(
			takeWhile( ( loaded: boolean ) => loaded ),
			untilCmpDestroyed( this )
		);
	}

}
