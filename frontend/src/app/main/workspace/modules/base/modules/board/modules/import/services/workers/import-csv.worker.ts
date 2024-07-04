import _ from 'lodash';

addEventListener(
	'message',
	async ( e: { data: { file: File; records: any } } ) => {
		const reader: FileReader = new FileReader();

		reader.readAsText(e.data.file);

		reader.onload = () => {
			const csvData: string = reader.result as string;

			e.data.records = csvData.split(/\r\n|\n/);

			// Lọc các bản ghi không trống
			e.data.records
				= _.filter(
					e.data.records,
					( value: string ) => {
						return value.length > 0
							&& value.split( ',' ).some(
								( cell: any ) => cell !== null && cell !== undefined && cell !== ''
							);
					}
				);

			e.data.records = e.data.records.map(
				( items: any ) => {
					const regex: RegExp
						= /(".*?"|[^",]+)(?=\s*,|\s*$)/g;

					const matches: any[] = [];
					let match: any;

					while (
						!!( match = regex.exec( items ) )
					) {
						// Bỏ dấu ngoặc kép nếu có và xử lý phần tử để phân biệt số và chuỗi
						let value: any
							= match[1].replace(/^"|"$/g, '');

						// Kiểm tra xem giá trị có phải là số
						if (
							!isNaN( value )
								&& value.trim() !== ''
						) {
							// Chuyển đổi sang kiểu số thích hợp: Integer hoặc Float
							value = value.includes( '.' )
								? parseFloat( value )
								: parseInt( value, 10 );
						}

						matches.push( value );
					}

					return matches;
				}
			);

			postMessage({
				data: {
					isHasTitle: true,
					totalRows: e.data.records.length - 1,
					headers: e.data.records[ 0 ],
					records: e.data.records,
					sheets: [`${e.data.file.name.split('.')[0]}`],
					currentSheet: e.data.file.name.split('.')[0],
				},
			});
		};

		reader.onerror = (
			error: ProgressEvent<FileReader>
		) => {
			postMessage({ error });
		};
	}
);
