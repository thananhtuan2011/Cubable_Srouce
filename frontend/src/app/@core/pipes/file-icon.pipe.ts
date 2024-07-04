import { PipeTransform, Pipe } from '@angular/core';
import _ from 'lodash';

import { Memoize } from 'angular-core';

const COMPRESSED: string[] = [ 'gz', 'bz2', 'rar', 'zip', '7z', 'apk' ];
const EXCEL: string[] = [ 'xls', 'xlsx', 'csv' ];
const DOCUMENT: string[] = [ 'doc', 'docx', 'txt' ];
const IMAGE: string[] = [ 'jpg', 'png', 'svg', 'gif', 'jpeg' ];
const SOUND: string[] = [ 'mp3', 'aac', 'ogg', 'wav' ];
const VIDEO: string[] = [ 'mp4', 'mov', 'flv', 'avi', 'mpg', 'wmv', 'mkv' ];
const PDF: string[] = [ 'pdf' ];
const POWER_POINT: string[] = [ 'ppt', 'pptx' ];
const CODE: string[] = [ 'js', 'php', 'c', 'h', 'css', 'scss', 'sass', 'less', 'ts', 'py', 'rb' ];
const SKETCH: string[] = [ 'sketch' ];
const PHOTOSHOP: string[] = [ 'psd' ];
const EXPERIENCE_DESIGN: string[] = [ 'xd' ];
const ILLUSTRATOR: string[] = [ 'ai' ];
const AFTER_EFFECT: string[] = [ 'aep' ];
const IN_DESIGN: string[] = [ 'indd' ];

@Pipe({ name: 'fileIcon' })
export class FileIconPipe implements PipeTransform {

	/**
	 * @param {string} filename
	 * @param {string} size
	 * @return {string}
	 */
	@Memoize()
	public transform( filename: string, size: string = '2x' ): string {
		const ext: string = _.chain( filename ).split( '.' ).last().toLower().value();
		let icon: string;

		if ( _.includes( COMPRESSED, ext ) ) icon = 'compressed';
		else if ( _.includes( EXCEL, ext ) ) icon = 'excel';
		else if ( _.includes( DOCUMENT, ext ) ) icon = 'document';
		else if ( _.includes( IMAGE, ext ) ) icon = 'image';
		else if ( _.includes( SOUND, ext ) ) icon = 'sound';
		else if ( _.includes( VIDEO, ext ) ) icon = 'video';
		else if ( _.includes( PDF, ext ) ) icon = 'pdf';
		else if ( _.includes( POWER_POINT, ext ) ) icon = 'power-point';
		else if ( _.includes( CODE, ext ) ) icon = 'code';
		else if ( _.includes( SKETCH, ext ) ) icon = 'sketch';
		else if ( _.includes( PHOTOSHOP, ext ) ) icon = 'photoshop';
		else if ( _.includes( EXPERIENCE_DESIGN, ext ) ) icon = 'experience-design';
		else if ( _.includes( ILLUSTRATOR, ext ) ) icon = 'illustrator';
		else if ( _.includes( AFTER_EFFECT, ext ) ) icon = 'after-effect';
		else if ( _.includes( IN_DESIGN, ext ) ) icon = 'in-design';
		else icon = 'unknown';

		return `assets/images/files/icons-files-${icon}@${size}.png`;
	}

}
