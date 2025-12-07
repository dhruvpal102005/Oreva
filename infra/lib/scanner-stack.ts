import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class ScannerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Define the Lambda Function
        // This bundles the code from aws/lambda/scanner
        const scannerFunction = new nodejs.NodejsFunction(this, 'ScannerFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../../aws/lambda/scanner/index.ts'),
            handler: 'handler',
            timeout: cdk.Duration.minutes(15), // Extended timeout 15m
            memorySize: 1024, // 1GB memory for potential large file parsing
            bundling: {
                minify: true,
                sourceMap: true,
            },
            environment: {
                POWER_TOOLS_SERVICE_NAME: 'scanner',
            }
        });

        // 2. Grant permissions to invoke Bedrock
        // Ideally restricts to specific resources, but '*' for initial dev is acceptable
        scannerFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['bedrock:InvokeModel'],
            resources: ['*'],
        }));

        // 3. Create Function URL (Public Endpoint)
        // This allows the frontend to trigger it securely-ish (we can add auth later)
        const fnUrl = scannerFunction.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: ['*'],
                allowedMethods: [lambda.HttpMethod.POST],
                allowedHeaders: ['content-type'],
            }
        });

        // 4. Output the URL
        new cdk.CfnOutput(this, 'ScannerUrl', {
            value: fnUrl.url,
            description: 'The URL to trigger the scanner',
        });
    }
}
