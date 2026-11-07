import sharp from 'sharp';

/**
 * Teinte dominante d'une image (logo), exprimée en degrés et saturation en %.
 * Renvoie null si l'image est illisible ou monochrome (aucune couleur nette) :
 * l'interface conserve alors le thème par défaut.
 */
export async function extractDominantHue(buffer: Buffer): Promise<{ h: number; s: number } | null> {
	let data: Buffer;
	try {
		const { data: raw } = await sharp(buffer)
			.resize(64, 64, { fit: 'fill' })
			.ensureAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		data = raw;
	} catch {
		return null;
	}

	const BINS = 36; // une case de 10° par teinte
	const counts = new Array<number>(BINS).fill(0);
	const sumHue = new Array<number>(BINS).fill(0);
	const sumSat = new Array<number>(BINS).fill(0);

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 128) continue; // pixel transparent
		const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
		// On ignore les neutres (gris/blanc/noir) et les tons quasi blancs/noirs,
		// pour qu'un logo monochrome ne produise pas une interface grisée.
		if (s < 0.2 || l < 0.06 || l > 0.94) continue;
		const bin = Math.floor(h / (360 / BINS)) % BINS;
		counts[bin]++;
		sumHue[bin] += h;
		sumSat[bin] += s;
	}

	const best = counts.indexOf(Math.max(...counts));
	// En dessous de ce nombre de pixels colorés, le logo compte comme monochrome.
	if (counts[best] < 40) return null;

	// Saturation bornée : un logo très pastel ou très saturé resterait lisible.
	const sat = Math.min(0.85, Math.max(0.4, sumSat[best] / counts[best]));
	return { h: Math.round(sumHue[best] / counts[best]), s: Math.round(sat * 100) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	switch (max) {
		case rn:
			h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
			break;
		case gn:
			h = ((bn - rn) / d + 2) * 60;
			break;
		default:
			h = ((rn - gn) / d + 4) * 60;
	}
	return { h, s, l };
}
