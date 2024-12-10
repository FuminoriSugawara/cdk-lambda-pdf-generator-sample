このプロジェクトはLambdaでPDFを生成するためのサンプルプロジェクトです。

任意のテンプレートPDFを元に、日本語のテキストを埋め込んだPDFを生成します。

## 使い方
### 1. テンプレートPDFを用意する
`template.pdf` という名前で、任意のテンプレートPDFを用意します。
テンプレートファイルは `lambda/templates` ディレクトリに配置してください。

### 2. S3バケット名を設定する
.env.sample をコピーして .env ファイルを作成し、S3バケット名を設定します。

```bash
$ cp .env.sample .env
```

### 3. cdk コマンドでデプロイする
```bash
$ cdk deploy
```

### 4. AWSコンソールからLambdaを実行する
AWSコンソールからLambdaを実行し、PDFを生成します。
デプロイ後、Lambdaのコンソール画面からテストイベントを作成し、実行してください。
テストイベントの内容は以下のように設定してください。

```json
{
  "pdfs":
  [
    {
      "fileName": "doc1.pdf",
      "texts": [
        {
          "text": "株式会社Sample",
          "x": 120,
          "y": 354,
          "size": 12,
          "width": 160,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "山田太郎",
          "x": 120,
          "y": 374,
          "size": 24,
          "width": 160,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "サンプルテキストサンプルテキストサンプルテキストサンプルテキスト",
          "x": 198,
          "y": 490,
          "size": 12,
          "width": 275,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "2024年12月31日",
          "x": 198,
          "y": 528,
          "size": 12,
          "width": 275,
          "weight": "Bold",
          "color": "#101717"
        }
      ]
    },
    {
      "fileName": "doc2.pdf",
      "texts": [
        {
          "text": "株式会社Sample",
          "x": 120,
          "y": 354,
          "size": 12,
          "width": 160,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "山田太郎",
          "x": 120,
          "y": 374,
          "size": 24,
          "width": 160,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "サンプルテキストサンプルテキストサンプルテキストサンプルテキスト",
          "x": 198,
          "y": 490,
          "size": 12,
          "width": 275,
          "weight": "Bold",
          "color": "#101717"
        },
        {
          "text": "2024年12月31日",
          "x": 198,
          "y": 528,
          "size": 12,
          "width": 275,
          "weight": "Bold",
          "color": "#101717"
        }
      ]
    }
  ]
}
```

### 5. S3バケットからPDFをダウンロードする

Lambdaの実行が成功すると、S3バケットに生成されたPDFが保存されます。
Lambdaからのレスポンスに含まれる、downloadUrl を使ってPDFをダウンロードしてください。

## 開発メモ

- PDFの生成には [pdf-lib](https://pdf-lib.js.org/) を使用しています。
- 日本語フォントは [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) を使用しています。
- pdf-lib で日本語フォントを使用する場合、フォントファイルを埋め込む必要があります。
- フォントファイルは `lambda/fonts` ディレクトリに配置しています。
- pdf-libのsubset機能はNoto Sans JPでは正常に動作しないため、subsetは[subset-font](https://www.npmjs.com/package/subset-font)を使用しています。
- pdf-libで日本語フォントを使用する場合、maxWidthが効かないので、wrapText 関数を実装しています。
- subset-fontライブラリはcdk deploy時に





