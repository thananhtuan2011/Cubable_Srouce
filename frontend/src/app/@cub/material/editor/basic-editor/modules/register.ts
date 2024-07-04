import Quill from 'quill/core';

// Basic formats
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Underline from 'quill/formats/underline';
import Strike from 'quill/formats/strike';
import Link from 'quill/formats/link';
import List, { ListContainer } from 'quill/formats/list';
import Blockquote from 'quill/formats/blockquote';
import CodeBlock, { Code } from 'quill/formats/code';

ListContainer.className = 'ql-ul';
Blockquote.className = 'ql-blockquote';
Code.className = 'ql-code';

Quill.register( Bold );
Quill.register( Italic );
Quill.register( Underline );
Quill.register( Strike );
Quill.register( Link );
Quill.register( List );
Quill.register( Blockquote );
Quill.register( Code );
Quill.register( CodeBlock );

// Tag
import TagBlot from './tag/blot';
import TagModule from './tag/module';

Quill.register( TagBlot );
Quill.register(
	`modules/${TagModule.moduleName}`,
	TagModule as any
);

// Mention
import MentionBlot from './mention/blot';
import MentionModule from './mention/module';

Quill.register( MentionBlot );
Quill.register(
	`modules/${MentionModule.moduleName}`,
	MentionModule as any
);
