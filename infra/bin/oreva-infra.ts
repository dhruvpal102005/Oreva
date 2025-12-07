#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ScannerStack } from '../lib/scanner-stack';

const app = new cdk.App();
new ScannerStack(app, 'OrevaScannerStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
