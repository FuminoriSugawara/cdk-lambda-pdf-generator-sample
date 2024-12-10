import { PDFDocument, PDFFont, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import subsetFont from "subset-font";
import { readFileSync } from "fs";

export interface PdfText {
  text: string;
  x: number;
  y: number;
  width?: number;
  size: number;
  weight: string;
  color: string;
}

export enum FontWeight {
  Black = "Black",
  Bold = "Bold",
  ExtraBold = "ExtraBold",
  ExtraLight = "ExtraLight",
  Light = "Light",
  Medium = "Medium",
  Regular = "Regular",
  SemiBold = "SemiBold",
  Thin = "Thin",
}

interface GeneratePdfOptions {
  pageHeight?: number;
}

function getCharSetFromText(text: string): Set<string> {
  return new Set(text.split(""));
}

async function getSubsetFontBuffer(
  fontBuffer: Buffer,
  charSet: Set<string>,
): Promise<Buffer> {
  const text = Array.from(charSet).join("");
  return subsetFont(fontBuffer, text);
}

function wrapText({
  text,
  font,
  fontSize,
  maxWidth,
}: {
  text: string;
  font: PDFFont;
  fontSize: number;
  maxWidth: number;
}): string {
  let result = "";
  let currentLine = "";
  let currentWidth = 0;
  if (maxWidth <= 0 || maxWidth === undefined) {
    return text;
  }

  for (const char of Array.from(text)) {
    const charWidth = font.widthOfTextAtSize(char, fontSize);

    if (currentWidth + charWidth <= maxWidth) {
      // この行に文字を追加可能
      currentLine += char;
      currentWidth += charWidth;
    } else {
      // 幅を超えるので改行
      result += currentLine + "\n";
      currentLine = char;
      currentWidth = charWidth;
    }
  }

  // 最終行を追加
  if (currentLine.length > 0) {
    result += currentLine;
  }

  return result;
}

function parseHexColor(hexColor: string): RGB {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// 左上が原点の座標系を左下が原点に変換
function convertYCoordinate({
  y,
  pageHeight,
  fontSize,
}: {
  y: number;
  pageHeight: number;
  fontSize: number;
}): number {
  return pageHeight - y - fontSize / 2;
}

export async function createPdfBuffer({
  texts,
  template,
  fontMap,
  options,
}: {
  texts: PdfText[];
  template: Buffer;
  fontMap: Map<string, Buffer>;
  options?: GeneratePdfOptions;
}): Promise<Buffer> {
  const pageHeight = options?.pageHeight || 842;

  const pdfDoc = await PDFDocument.load(template);
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.getPage(0);

  for (const text of texts) {
    const fontBuffer = fontMap.get(text.weight as FontWeight);
    if (!fontBuffer) {
      throw new Error(`Font buffer not found: ${text.weight}`);
    }
    const charSet = getCharSetFromText(text.text);
    // NotoSansJPだとembedFontのsubset optionが効かないので、subsetFontを使ってサブセットフォントを作成
    const subsetFontBuffer = await getSubsetFontBuffer(fontBuffer, charSet);
    const font = await pdfDoc.embedFont(subsetFontBuffer);
    //日本語だとmaxWidthが効かないので、改行処理を追加
    const wrappedText = wrapText({
      text: text.text,
      font,
      fontSize: text.size,
      maxWidth: text.width || 100,
    });

    page.drawText(wrappedText, {
      x: text.x,
      y: convertYCoordinate({ y: text.y, pageHeight, fontSize: text.size }),
      lineHeight: text.size,
      size: text.size,
      font: font,
      color: parseHexColor(text.color),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export function getFontBufferByWeight(weight: FontWeight): Buffer {
  if (!Object.values(FontWeight).includes(weight)) {
    throw new Error(`Invalid font weight: ${weight}`);
  }

  const fontPath = `${__dirname}/fonts/NotoSansJP-${weight}.ttf`;
  return readFileSync(fontPath);
}

export function getTemplateBuffer(): Buffer {
  const templatePath = `${__dirname}/templates/template.pdf`;
  return readFileSync(templatePath);
}
