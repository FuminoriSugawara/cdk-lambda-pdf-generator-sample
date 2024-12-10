import archiver from "archiver";
import { PassThrough } from "stream";
import {
  createPdfBuffer,
  FontWeight,
  getFontBufferByWeight,
  getTemplateBuffer,
  PdfText,
} from "./generatePdf";

export interface PdfContent {
  fileName: string;
  texts: PdfText[];
}

export interface Options {
  pageHeight?: number;
}

export function parseFontMapFromPdfContents(
  pdfContents: PdfContent[],
): Map<string, Buffer> {
  const fontMap = new Map<string, Buffer>();
  pdfContents.forEach((pdfContent) => {
    pdfContent.texts.forEach((text) => {
      const fontWeight = text.weight as FontWeight;
      if (!fontMap.has(fontWeight)) {
        fontMap.set(fontWeight, getFontBufferByWeight(fontWeight));
      }
    });
  });
  return fontMap;
}

export async function createZipBuffer({
  pdfs,
  options,
}: {
  pdfs: PdfContent[];
  options?: Options;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on("data", (chunk) => chunks.push(chunk));
    passThrough.on("end", () => {
      console.log("Zip file created successfully.");
      return resolve(Buffer.concat(chunks));
    });
    passThrough.on("error", reject);

    archive.on("error", reject);
    archive.pipe(passThrough);

    const fontMap = parseFontMapFromPdfContents(pdfs);
    const template = getTemplateBuffer();

    // PDFを生成して追加
    Promise.all(
      pdfs.map(async (pdf) => {
        const pdfBuffer = await createPdfBuffer({
          texts: pdf.texts,
          template,
          fontMap,
          options,
        });
        console.log(`PDF created: ${pdf.fileName}`);
        archive.append(pdfBuffer, { name: pdf.fileName });
      }),
    )
      .then(() => {
        archive.finalize();
      })
      .catch(reject);
  });
}
