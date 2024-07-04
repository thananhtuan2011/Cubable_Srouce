import Quill, {
	AttributeMap,
	Delta,
	Op
} from 'quill/core';
import {
	EmitterSource
} from 'quill/core/emitter';
import {
	Range
} from 'quill/core/selection';
import Module from 'quill/core/module';
import _ from 'lodash';

import TagBlot, {
	TagBlotAttachedSource,
	TagBlotValue
} from './blot';

export type TagProps = {
	blot: typeof TagBlot;
	defaultBlotValue: Partial<TagBlotValue>;
	matcher: RegExp;
	spaceAfterInsert: boolean;
	onRenderValue(
		module: TagModule,
		tag: string,
		extra?: TagBlotValue
	): TagBlotValue;
	onTagAttached(
		module: TagModule,
		blot: TagBlot,
		attachedSource: TagBlotAttachedSource
	);
	onTagDetached(
		module: TagModule,
		blot: TagBlot
	);
	onTagClicked(
		module: TagModule,
		blot: TagBlot,
		event: MouseEvent
	);
	onTagHovered(
		module: TagModule,
		blot: TagBlot,
		event: MouseEvent
	);
};

export default class TagModule extends Module<TagProps> {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	static moduleName: string = 'tag';
	static DEFAULTS: Partial<TagProps> = {
		matcher: /{{[^}]*}}/g,
		blot: TagBlot,
		defaultBlotValue: { buttonRemove: true },
		spaceAfterInsert: true,
	};

	protected valueCache: Record<string, TagBlotValue>;

	get blotName(): string {
		return this.options.blot.blotName;
	}

	constructor(
		quill: Quill,
		options: Partial<TagProps>
	) {
		super( quill, options );

		quill.on(
			'text-change',
			(
				delta: Delta,
				_oldDelta: Delta,
				source: EmitterSource
			) => {
				if ( source !== Quill.sources.API ) {
					return;
				}

				delta.ops = _.reduce(
					delta.ops,
					( ops: Op[], op: Op ): Op[] => {
						if (
							typeof( op.insert ) === 'string'
						) {
							ops.push(
								...this._findAndReplace( op )
							);
						} else if (
							_.has( op.insert, this.blotName )
						) {
							const currValue: TagBlotValue
								= op.insert[ this.blotName ] as TagBlotValue;
							const value: TagBlotValue
								= this._renderValue(
									currValue.tag,
									currValue
								);
							const name: string | Node
								= value?.name || currValue.name;
							const icon: string
								= value?.icon || currValue.icon;

							ops.push({
								insert: {
									[ this.blotName ]: {
										...this.options.defaultBlotValue,
										...currValue,

										name,
										icon,
									},
								},
								attributes: op.attributes,
							});
						} else {
							ops.push( op );
						}

						return ops;
					},
					[]
				);
			}
		);

		quill.clipboard.addMatcher(
			Node.TEXT_NODE,
			( _n: Node, delta: Delta ): Delta => {
				const ops: Op[]
					= this._findAndReplace( delta.ops[ 0 ] );

				if ( ops ) {
					delta.ops = ops;
				}

				return delta;
			}
		);

		const rootNode: Node
			= quill.scroll.domNode;

		rootNode.addEventListener(
			`${this.blotName}-attached`,
			( e: CustomEvent ) => {
				this.options.onTagAttached?.(
					this,
					e.detail.blot,
					e.detail.attachedSource
				);
			}
		);

		rootNode.addEventListener(
			`${this.blotName}-detached`,
			( e: CustomEvent ) => {
				this.options.onTagDetached?.(
					this,
					e.detail
				);
			}
		);

		rootNode.addEventListener(
			`${this.blotName}-clicked`,
			( e: CustomEvent ) => {
				this.options.onTagClicked?.(
					this,
					e.detail.blot,
					e.detail.event
				);
			}
		);

		rootNode.addEventListener(
			`${this.blotName}-hovered`,
			( e: CustomEvent ) => {
				this.options.onTagHovered?.(
					this,
					e.detail.blot,
					e.detail.event
				);
			}
		);
	}

	/**
	 * Inserts a tag blot.
	 * @param value
	 * @param index
	 * @param source
	 */
	public insert(
		value: any,
		index: number = this.quill.getSelection( true )?.index,
		source?: EmitterSource
	) {
		index ??= 0;

		this.quill.insertEmbed(
			index,
			this.blotName,
			{
				...this.options.defaultBlotValue,
				...value,

				attachedSource:
					TagBlotAttachedSource.Insertion,
			},
			source
		);

		// Inserts a space after inserted tag.
		if ( this.options.spaceAfterInsert ) {
			this.quill.insertText(
				++index,
				' ',
				Quill.sources.SILENT
			);
		}

		// Moves the cursor to after inserted tag.
		this.quill.setSelection(
			new Range( index + 1 )
		);
	}

	/**
	 * Find tag with matcher and replace by a tag blot.
	 * @ref https://github.com/quilljs/quill/issues/109#issuecomment-278181150
	 * @param op
	 * @returns Delta ops.
	 */
	private _findAndReplace( op: Op ): Op[] {
		if ( typeof( op.insert ) !== 'string' ) {
			return;
		}

		const matches: RegExpMatchArray
			= op.insert.match( this.options.matcher );
		const ops: Op[] = [];

		if ( matches?.length > 0 ) {
			const attributes: AttributeMap
				= op.attributes;
			let str: string = op.insert;

			matches.forEach(( match: string ) => {
				const value: TagBlotValue
					= this._renderValue( match );

				if ( !value ) {
					return;
				}

				const split: string[]
					= str.split( match );
				const beforeStr: string
					= split.shift();

				ops.push({
					insert: beforeStr,
					attributes,
				});
				ops.push({
					insert: {
						[ this.blotName ]: {
							...this.options.defaultBlotValue,
							...value,

							tag: match,
							attachedSource:
								TagBlotAttachedSource.Replacement,
						},
					},
					attributes,
				});

				str = split.join( match );
			});

			ops.push({
				insert: str,
				attributes,
			});
		} else {
			ops.push( op );
		}

		return ops;
	}

	/**
	 * Call the render value method inside the options
	 * and cache if value not empty.
	 * @param tag
	 * @param extra
	 * @returns A value of tag blog.
	 */
	private _renderValue(
		tag: string,
		extra?: TagBlotValue
	): TagBlotValue {
		const value: TagBlotValue
			= this.valueCache?.[ tag ]
				|| this.options.onRenderValue?.(
					this,
					tag,
					extra
				);

		if ( value ) {
			this.valueCache ||= {};

			this.valueCache[ tag ] = value;
		}

		return value;
	}

}
