import { PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import _ from 'lodash';

import { Memoize } from 'angular-core';

export interface IMetaEmbed {
	title: string;
	description: string;
	url: string;
	siteName: string;
	contentType: string;
	mediaType: string;
	images: string[];
	favicons: string[];
}

@Pipe({ name: 'metaEmbed' })
export class MetaEmbedPipe implements PipeTransform {

	/**
	 * @constructor
	 * @param {DomSanitizer} _domSanitizer
	 */
	constructor( private _domSanitizer: DomSanitizer ) {}

	/**
	 * @param {IMetaEmbed} meta
	 * @return {SafeHtml}
	 */
	public transform( meta: IMetaEmbed ): SafeHtml {
		if ( !meta ) return;

		const siteUrl: string = meta.url;
		const siteName: string = meta.siteName;
		const contentType: string = meta.contentType;
		const mediaType: string = meta.mediaType;
		const mediaImage: string = _.first( meta.images );

		return this._render( siteUrl, siteName, contentType, mediaType, mediaImage );
	}

	/**
	 * @param {string} siteUrl
	 * @param {string} siteName
	 * @param {string} contentType
	 * @param {string} mediaType
	 * @param {string} mediaImage
	 * @return {SafeHtml}
	 */
	@Memoize()
	private _render(
		siteUrl: string, siteName: string, contentType: string,
		mediaType: string, mediaImage: string
	): SafeHtml {
		let html: string = mediaImage ? `<img src="${mediaImage}" />` : undefined;

		if ( mediaType.search( /^(video|audio)/ ) !== -1 ) {
			if ( siteName === 'YouTube' ) {
				const urlParams: URLSearchParams = new URLSearchParams( siteUrl.split( '?' )[ 1 ] );
				const videoID: string = urlParams.get( 'v' );

				if ( videoID ) {
					html = `<iframe
						width="100%"
						height="320px"
						src="//www.youtube.com/embed/${videoID}"
						frameborder="0"
						allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen />`;
				}
			} else {
				html = mediaType === 'audio' || contentType === 'video/ogg'
					? `<audio width="100%" controls><source src="${siteUrl}" type="${contentType}" /></audio>`
					: `<video width="100%" controls><source src="${siteUrl}" type="${contentType}" /></video>`;
			}
		}

		return html ? this._domSanitizer.bypassSecurityTrustHtml( html ) : undefined;
	}

}
