import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createZipBuffer, PdfContent } from "./lib/zipFiles";

// ENVからバケット名を取得
const bucketName = process.env.BUCKET_NAME!;
const s3 = new S3Client({});

interface CustomEvent {
  pdfs: PdfContent[];
}

const PAGE_HEIGHT = 845;
// sample json
//{
//  "pdfs":
//  [
//    {
//      "fileName": "doc1.pdf",
//      "texts": [
//        {
//          "text": "株式会社Sample",
//          "x": 120,
//          "y": 354,
//          "size": 12,
//          "width": 160,
//          "weight": "Bold",
//          "color": "#101717"
//        },
//        {
//          "text": "山田太郎",
//          "x": 120,
//          "y": 374,
//          "size": 24,
//          "width": 160,
//          "weight": "Bold",
//          "color": "#101717"
//        },
//        {
//          "text": "サンプルテキストサンプルテキストサンプルテキストサンプルテキスト",
//          "x": 198,
//          "y": 490,
//          "size": 12,
//          "width": 275,
//          "weight": "Bold",
//          "color": "#101717"
//        },
//        {
//          "text": "2024年12月31日",
//          "x": 198,
//          "y": 528,
//          "size": 12,
//          "width": 275,
//          "weight": "Bold",
//          "color": "#101717"
//        }
//      ]
//    }
//  ]
//}

//export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
export const handler = async (event: CustomEvent) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    // ボディからJSON取得
    const pdfContents: PdfContent[] = event.pdfs || [];
    console.log("PDF contents:", pdfContents);

    // PDF作成とzip化
    const zipBuffer = await createZipBuffer({
      pdfs: pdfContents,
      options: { pageHeight: PAGE_HEIGHT },
    });

    // S3にアップロード
    const zipKey = `pdf-archive-${Date.now()}.zip`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: zipKey,
        Body: zipBuffer,
        ContentType: "application/zip",
      }),
    );

    // 署名付きURLを作成して返却
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: zipKey,
      }),
      { expiresIn: 3600 },
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Zip file created successfully.",
        downloadUrl: url,
      }),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
