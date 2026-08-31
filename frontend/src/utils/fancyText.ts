export type FancyFontStyle = "bold-serif" | "bold-sans" | "bold-sans-italic";

type CharMap = {
  upper: number;
  lower: number;
  digit?: number;
};

const STYLE_MAPS: Record<FancyFontStyle, CharMap> = {
  "bold-serif": { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  "bold-sans": { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  "bold-sans-italic": { upper: 0x1d63c, lower: 0x1d656 },
};

export const FONT_STYLE_LABELS: Record<
  FancyFontStyle,
  { label: string; sample: string; hint: string }
> = {
  "bold-serif": {
    label: "Bold Serif",
    sample: "𝐀𝐁𝐂 𝐚𝐛𝐜",
    hint: "Titles & headlines",
  },
  "bold-sans": {
    label: "Bold Sans",
    sample: "𝗔𝗕𝗖 𝗮𝗯𝗰",
    hint: "Body emphasis & names",
  },
  "bold-sans-italic": {
    label: "Bold Sans Italic",
    sample: "𝘼𝘽𝘾 𝙖𝙗𝙘",
    hint: "Section headers",
  },
};

export const FANCY_FONT_STYLES = Object.keys(
  FONT_STYLE_LABELS,
) as FancyFontStyle[];

const FANCY_CHAR_REVERSE_MAP = buildReverseMap();

function buildReverseMap(): Map<number, string> {
  const reverse = new Map<number, string>();

  for (const style of FANCY_FONT_STYLES) {
    const map = STYLE_MAPS[style];

    for (let index = 0; index < 26; index++) {
      reverse.set(map.upper + index, String.fromCharCode(65 + index));
      reverse.set(map.lower + index, String.fromCharCode(97 + index));
    }

    if (map.digit) {
      for (let index = 0; index < 10; index++) {
        reverse.set(map.digit + index, String.fromCharCode(48 + index));
      }
    }
  }

  return reverse;
}

function convertChar(char: string, map: CharMap): string {
  const code = char.charCodeAt(0);

  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(map.upper + (code - 65));
  }
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(map.lower + (code - 97));
  }
  if (map.digit && code >= 48 && code <= 57) {
    return String.fromCodePoint(map.digit + (code - 48));
  }

  return char;
}

export function toFancyText(text: string, style: FancyFontStyle): string {
  const map = STYLE_MAPS[style];
  return [...text].map((char) => convertChar(char, map)).join("");
}

export function fromFancyText(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.codePointAt(0);
      if (code === undefined) return char;
      return FANCY_CHAR_REVERSE_MAP.get(code) ?? char;
    })
    .join("");
}

export function hasFancyChars(text: string): boolean {
  return [...text].some((char) => {
    const code = char.codePointAt(0);
    return code !== undefined && FANCY_CHAR_REVERSE_MAP.has(code);
  });
}

export function toggleFancyText(text: string, style: FancyFontStyle): string {
  return hasFancyChars(text) ? fromFancyText(text) : toFancyText(text, style);
}
