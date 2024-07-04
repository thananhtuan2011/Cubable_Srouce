import LeaderLine from 'leader-line-new';
import _ from 'lodash';

// @ts-ignore
LeaderLine.positionByWindowResize = false;

type Point = {
	x: number;
	y: number;
};

function addArc(
	pathData: string,
	radius: number
): string {
	const reL: RegExp
		= /^L ?([\d.\-+]+) ([\d.\-+]+) ?/;
	let newPathData: string;
	let curXY: Point | undefined;
	let curDir: string | undefined;
	let newXY: Point | undefined;
	let newDir: string | undefined;
	let sweepFlag: string;
	let arcXY: Point;
	let arcStartXY: Point;

	function getDir(
		xy1: Point,
		xy2: Point
	): string {
		if ( Math.abs( xy1.x - xy2.x ) < radius ) {
			return xy1.y < xy2.y ? 'd' : 'u';
		} else if ( Math.abs( xy1.y - xy2.y ) < radius ) {
			return xy1.x < xy2.x ? 'r' : 'l';
		}

		throw new Error( 'Invalid data' );
	}

	function captureXY(
		_s: string,
		x: string,
		y: string
	): string {
		newXY = { x: +x, y: +y };

		return '';
	}

	function offsetXY(
		xy: Point,
		dir: string,
		offsetLen: number,
		toBack: boolean = false
	): Point {
		/* eslint-disable indent */
		return {
			x: xy.x + (
				dir === 'l' ? -offsetLen :
				dir === 'r' ? offsetLen : 0
			) * ( toBack ? -1 : 1 ),
			y: xy.y + (
				dir === 'u' ? -offsetLen :
				dir === 'd' ? offsetLen : 0
			) * ( toBack ? -1 : 1 ),
		};
		/* eslint-enable indent */
	}

	pathData
		= pathData
		.trim()
		.replace( /,/g, ' ' )
		.replace( /\s+/g, ' ' )
		.replace(
			/^M ?([\d.\-+]+) ([\d.\-+]+) ?/,
			function( _s: string, x: string, y: string ) {
				curXY = { x: +x, y: +y };
				return '';
			}
		);

	if ( !curXY ) {
		throw new Error( 'Invalid data' );
	}

	newPathData = 'M' + curXY.x + ' ' + curXY.y;

	while ( pathData ) {
		newXY = undefined;
		pathData = pathData.replace( reL, captureXY );

		if ( !newXY ) {
			throw new Error( 'Invalid data' );
		}

		newDir = getDir( curXY, newXY );

		if ( curDir ) {
			arcStartXY = offsetXY( curXY, curDir, radius, true );
			arcXY = offsetXY( curXY, newDir, radius );

			/* eslint-disable indent */
			sweepFlag =
				curDir === 'l' && newDir === 'u' ? '1' :
				curDir === 'l' && newDir === 'd' ? '0' :
				curDir === 'r' && newDir === 'u' ? '0' :
				curDir === 'r' && newDir === 'd' ? '1' :
				curDir === 'u' && newDir === 'l' ? '0' :
				curDir === 'u' && newDir === 'r' ? '1' :
				curDir === 'd' && newDir === 'l' ? '1' :
				curDir === 'd' && newDir === 'r' ? '0' :
				null;
			/* eslint-enable indent */

			if ( !sweepFlag ) {
				throw new Error( 'Invalid data' );
			}

			// eslint-disable-next-line max-len
			newPathData += `L ${arcStartXY.x} ${arcStartXY.y} A${radius} ${radius} 0 0 ${sweepFlag} ${arcXY.x} ${arcXY.y}`;
		}

		curXY = newXY;
		curDir = newDir;
	}

	newPathData += 'L' + curXY.x + ' ' + curXY.y;

	return newPathData;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace LeaderLineNew {

	export type Options = LeaderLine.Options & {
		label?: string;
		cornerRadius?: number;
		scaleRatio?: number;
		container?: HTMLElement;
		labelOptions?: any;
	};

}

// eslint-disable-next-line no-redeclare
export class LeaderLineNew extends LeaderLine {

	public static DEFAULT_OPTIONS: LeaderLineNew.Options = {
		size: 2,
		cornerRadius: 8,
		scaleRatio: 1,
		label: '',
		color: '#8e8e93',
		path: 'straight',
		startPlug: 'disc',
		endPlug: 'arrow2',
		startSocket: 'bottom',
		endSocket: 'top',
		labelOptions: {
			color: '#262626',
			outlineColor: 'rgba(0, 0, 0, 0)',
			backgroundColor: '#d0d5dd',
			size: 20,
			radius: 12,
			fontFamily: 'unset',
			fontSize: 12,
		},
	};

	public svg: SVGAElement;

	private readonly _afterPosition: _.DebouncedFunc<() => void>
		= _.throttle(() => {
			// Re-adds the label to this line.
			this.addLabel();

			// Re-adds rounded corners to this line.
			this.addRoundedCornersToGridPath();
		}, 17); // 60fps

	private _label: string;
	private _labelRect: SVGRectElement;
	private _cornerRadius: number;
	private _scaleRatio: number;
	private _container: HTMLElement = document.body;
	private _options: LeaderLineNew.Options;

	get label(): string {
		return this._label;
	}
	set label( label: string ) {
		this.addLabel( this._label = label );
	}

	get cornerRadius(): number {
		return this._cornerRadius;
	}
	set cornerRadius( radius: number ) {
		this.addRoundedCornersToGridPath(
			this._cornerRadius = radius
		);
	}

	get scaleRatio(): number {
		return this._scaleRatio;
	}
	set scaleRatio( ratio: number ) {
		if ( ratio === this._scaleRatio ) {
			return;
		}

		this._scaleRatio = ratio;

		// Scales the size of the line.
		this.size = this._options.size * ratio;

		// Scales the size of rounded corners.
		this.cornerRadius
			= this._options.cornerRadius * ratio;

		// Scales the font size of the label.
		this.addLabel( this.label, ratio );
	}

	get container(): HTMLElement {
		return this._container;
	}
	set container( container: HTMLElement ) {
		this._container = container || document.body;

		this._container.appendChild( this.svg );
	}

	constructor( options: LeaderLineNew.Options ) {
		options = _.defaultsDeep(
			options,
			LeaderLineNew.DEFAULT_OPTIONS
		);

		// Fixes zooming issue.
		if ( options.path === 'grid' ) {
			options.startSocketGravity ??= 10;
			options.endSocketGravity ??= 10;
		}

		super( options );

		this._options = options;

		this.svg = document.querySelector(
			'body > .leader-line:last-of-type'
		);

		// Adds the label to this line.
		this._label = options.label;

		// Adds rounded corners to this line.
		this._cornerRadius = options.cornerRadius;

		// Scales this line by the specified ratio.
		this.scaleRatio = options.scaleRatio;

		// Sets the new container.
		this.container = options.container;
	}

	public override position(): void {
		super.position();

		this._afterPosition();
	}

	public override remove() {
		if ( !this.container ) {
			super.remove();
			return;
		}

		this.svg.style.display = 'none';

		setTimeout(() => {
			document.body.appendChild( this.svg );

			super.remove();
		});
	}

	/**
	 * Adds a label to this line.
	 * @param label The text of the label to be added.
	 * Defaults to the current label specified in this instance.
	 * @param scaleRatio The scale ratio by which the label size should be adjusted.
	 * Useful for dynamic scaling based on display size or other environmental factors.
	 * Defaults to the current scale ratio specified in this instance.
	 */
	protected addLabel(
		label: string = this.label,
		scaleRatio: number = this.scaleRatio
	) {
		// Removes the old label.
		this._labelRect?.remove();

		// Adds a new label.
		const labelOptions: any
			= this._options.labelOptions;
		const {
			size,
			radius,
			fontSize,
			backgroundColor,
		}: any = labelOptions;
		const svgWidth: number
			= this.svg.clientWidth;

		this.middleLabel
			= LeaderLineNew.captionLabel(
				label,
				{
					...labelOptions,

					fontSize: fontSize * scaleRatio,
					lineOffset: Math.min(
						-svgWidth / 2 + 80 * scaleRatio,
						-svgWidth / 4
					),
				}
			);

		if ( !label ) return;

		const text: SVGTextElement
			= this.svg.querySelector( 'text' );

		if ( !text ) return;

		const newY: number
			= parseFloat( text.getAttribute( 'y' ) )
				- 4 * scaleRatio;

		text.setAttribute( 'y', String( newY ) );

		const { x, y, width }: DOMRect
			= text.getBBox();
		const rect: SVGRectElement
			= this._labelRect
			= document.createElementNS(
				'http://www.w3.org/2000/svg',
				'rect'
			) as SVGRectElement;

		rect.setAttribute( 'x', String( x - 8 * scaleRatio ) );
		rect.setAttribute( 'y', String( y - 2 * scaleRatio ) );
		rect.setAttribute( 'width', String( width + 16 * scaleRatio ) );
		rect.setAttribute( 'height', String( size * scaleRatio ) );
		rect.setAttribute( 'rx', String( radius * scaleRatio ) );
		rect.setAttribute( 'fill', backgroundColor );

		text.parentNode.insertBefore( rect, text );
	}

	/**
	 * Adds rounded corners to this line
	 * when the path type is set to grid.
	 * @param cornerRadius The radius for the corners.
	 * Defaults to the radius specified in the object's options.
	 */
	protected addRoundedCornersToGridPath(
		cornerRadius: number = this.cornerRadius
	) {
		if ( !cornerRadius
			|| this.path !== 'grid' ) {
			return;
		}

		const linePath: SVGClipPathElement
			= this.svg.querySelector(
				'.leader-line-line-path'
			);

		if ( !linePath ) {
			return;
		}

		try {
			linePath.setAttribute(
				'd',
				addArc(
					linePath.getAttribute( 'd' ),
					cornerRadius
				)
			);
		} catch {}
	}

}
