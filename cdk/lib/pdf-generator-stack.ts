import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";

export type Props = {
  bucketName: string;
} & cdk.StackProps;

export class PdfGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: Props) {
    super(scope, id, props);

    const { bucketName } = props!;

    // S3バケット作成
    const bucket = new s3.Bucket(this, "PdfZipBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      bucketName,
    });

    // Lambda関数定義
    const pdfLambda = new lambda.NodejsFunction(this, "PdfLambdaFunction", {
      entry: "lambda/index.ts",
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ["aws-sdk"],
        commandHooks: {
          // ビルド後にpdfkitのdataフォルダをコピーする
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [
              `cp -r ${inputDir}/lambda/fonts ${outputDir}`,
              `cp -r ${inputDir}/lambda/templates ${outputDir}`,
              `install -D ${inputDir}/lambda/node_modules/harfbuzzjs/hb-subset.wasm ${outputDir}/harfbuzzjs/hb-subset.wasm`,
            ];
          },
          afterBundling(): string[] {
            return [];
          },
          beforeInstall(): string[] {
            return [];
          },
        },
      },
      // 時間
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      // 4GBメモリ
      memorySize: 4096,
    });

    // バケットへの書き込み・読み取り権限
    bucket.grantPut(pdfLambda);
    bucket.grantRead(pdfLambda);
  }
}
