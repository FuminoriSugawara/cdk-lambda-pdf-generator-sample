import { createZipBuffer } from "../lib/zipFiles";
import fs from "fs";

describe("zipFiles", () => {
  it("should create a zip file", async () => {
    const pdfs = [
      {
        fileName: "doc1.pdf",
        texts: [
          {
            text: "株式会社Sample",
            x: 120,
            y: 354,
            size: 12,
            width: 160,
            weight: "Bold",
            color: "#101717",
          },
          {
            text: "山田太郎",
            x: 120,
            y: 374,
            size: 24,
            width: 160,
            weight: "Bold",
            color: "#101717",
          },
          {
            text: "サンプルテキストサンプルテキストサンプルテキストサンプルテキスト",
            x: 198,
            y: 490,
            size: 12,
            width: 275,
            weight: "Bold",
            color: "#101717",
          },
          {
            text: "2024年12月31日",
            x: 198,
            y: 528,
            size: 12,
            width: 275,
            weight: "Bold",
            color: "#101717",
          },
        ],
      },
    ];

    const zipBuffer = await createZipBuffer({
      pdfs,
      options: { pageHeight: 845 },
    });

    fs.writeFileSync("../tmp/output.zip", zipBuffer);

    expect(fs.existsSync("../tmp/output.zip")).toBe(true);
  });
});
