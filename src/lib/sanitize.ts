// Sanitisation minimaliste des contenus de rapports : les anciens rapports
// sont du HTML produit par un éditeur riche, les nouveaux du texte brut.
// Seules les balises de mise en forme de base sont conservées, sans aucun attribut.

const ALLOWED_TAGS = new Set([
	'b',
	'strong',
	'i',
	'em',
	'u',
	'ul',
	'ol',
	'li',
	'br',
	'p',
	'div',
	'h2',
	'h3'
]);

/**
 * Nettoise une chaîne de HTML : supprime tout commentaire, toute balise non
 * autorisée et tous les attributs. Le texte brut est conservé tel quel.
 */
export function sanitizeHtml(input: string): string {
	return input
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, close, tag) => {
			const name = tag.toLowerCase();
			if (!ALLOWED_TAGS.has(name)) return '';
			return close ? `</${name}>` : `<${name}>`;
		});
}

/** Retourne le texte brut d'une chaîne de HTML déjà (ou à) sanitizer. */
export function htmlToText(input: string): string {
	return sanitizeHtml(input).replace(/<[^>]+>/g, '');
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	eacute: 'é',
	egrave: 'è',
	ecirc: 'ê',
	euml: 'ë',
	agrave: 'à',
	acirc: 'â',
	auml: 'ä',
	ccedil: 'ç',
	ocirc: 'ô',
	ouml: 'ö',
	ugrave: 'ù',
	ucirc: 'û',
	uuml: 'ü',
	iuml: 'ï',
	icirc: 'î',
	oelig: 'œ',
	Eacute: 'É',
	Egrave: 'È',
	Agrave: 'À',
	Ccedil: 'Ç',
	OElig: 'Œ'
};

/** Décode les entités HTML courantes (nommées, décimales et hexadécimales). */
function decodeHtmlEntities(input: string): string {
	return input.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, entity) => {
		if (entity[0] === '#') {
			const codePoint =
				entity[1] === 'x' || entity[1] === 'X'
					? parseInt(entity.slice(2), 16)
					: parseInt(entity.slice(1), 10);
			return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
		}
		return entity in NAMED_ENTITIES ? NAMED_ENTITIES[entity] : match;
	});
}

/**
 * Texte brut conservant les retours de ligne (blocs et <br>) —
 * pour l'export CSV par exemple. Les entités HTML sont décodées et les
 * éléments de liste sont préfixés pour rester lisibles hors contexte HTML.
 */
export function htmlToPlainText(input: string): string {
	const withListMarkers = sanitizeHtml(input).replace(/<li>/gi, '<li>- ');
	return decodeHtmlEntities(
		withListMarkers
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/(?:div|p|li|h2|h3)>\s*/gi, '\n')
			.replace(/<[^>]+>/g, '')
	)
		.replace(/\n{2,}/g, '\n')
		.trim();
}
