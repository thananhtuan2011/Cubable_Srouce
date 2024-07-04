// easier with fs-extra, but possible also with node build-in fs
const fs = require( 'fs-extra' );

function storeVersionInTsFile() {
	const packageJson = fs.readJSONSync( './package.json' );
	const file = `./src/environments/version.ts`;
	const contents = `/**\n * Auto generated file, do not edit.\n */\n\nexport const appVersion: string = '${packageJson.version}';\n`;

	fs.writeFileSync( file, contents );
}

storeVersionInTsFile()
