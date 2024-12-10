#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PdfGeneratorStack } from "../lib/pdf-generator-stack";

import dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
new PdfGeneratorStack(app, "PdfGeneratorStack", {
  bucketName: process.env.BUCKET_NAME!,
});
