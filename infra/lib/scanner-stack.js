"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const nodejs = require("aws-cdk-lib/aws-lambda-nodejs");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
class ScannerStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.ScannerStack = ScannerStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbm5lci1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYW5uZXItc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLGlEQUFpRDtBQUNqRCx3REFBd0Q7QUFDeEQsMkNBQTJDO0FBQzNDLDZCQUE2QjtBQUU3QixNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN2QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGdDQUFnQztRQUNoQyxnREFBZ0Q7UUFDaEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN2RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxtQ0FBbUMsQ0FBQztZQUNoRSxPQUFPLEVBQUUsU0FBUztZQUNsQixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsdUJBQXVCO1lBQzFELFVBQVUsRUFBRSxJQUFJLEVBQUUsOENBQThDO1lBQ2hFLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsSUFBSTtnQkFDWixTQUFTLEVBQUUsSUFBSTthQUNsQjtZQUNELFdBQVcsRUFBRTtnQkFDVCx3QkFBd0IsRUFBRSxTQUFTO2FBQ3RDO1NBQ0osQ0FBQyxDQUFDO1FBRUgseUNBQXlDO1FBQ3pDLGlGQUFpRjtRQUNqRixlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNwRCxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNoQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSiwyQ0FBMkM7UUFDM0MsOEVBQThFO1FBQzlFLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUM7WUFDekMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO1lBQ3pDLElBQUksRUFBRTtnQkFDRixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3JCLGNBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUN4QyxjQUFjLEVBQUUsQ0FBQyxjQUFjLENBQUM7YUFDbkM7U0FDSixDQUFDLENBQUM7UUFFSCxvQkFBb0I7UUFDcEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDbEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2hCLFdBQVcsRUFBRSxnQ0FBZ0M7U0FDaEQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBN0NELG9DQTZDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIG5vZGVqcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTY2FubmVyU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgICAgICAvLyAxLiBEZWZpbmUgdGhlIExhbWJkYSBGdW5jdGlvblxyXG4gICAgICAgIC8vIFRoaXMgYnVuZGxlcyB0aGUgY29kZSBmcm9tIGF3cy9sYW1iZGEvc2Nhbm5lclxyXG4gICAgICAgIGNvbnN0IHNjYW5uZXJGdW5jdGlvbiA9IG5ldyBub2RlanMuTm9kZWpzRnVuY3Rpb24odGhpcywgJ1NjYW5uZXJGdW5jdGlvbicsIHtcclxuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXHJcbiAgICAgICAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYXdzL2xhbWJkYS9zY2FubmVyL2luZGV4LnRzJyksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcclxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMTUpLCAvLyBFeHRlbmRlZCB0aW1lb3V0IDE1bVxyXG4gICAgICAgICAgICBtZW1vcnlTaXplOiAxMDI0LCAvLyAxR0IgbWVtb3J5IGZvciBwb3RlbnRpYWwgbGFyZ2UgZmlsZSBwYXJzaW5nXHJcbiAgICAgICAgICAgIGJ1bmRsaW5nOiB7XHJcbiAgICAgICAgICAgICAgICBtaW5pZnk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzb3VyY2VNYXA6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgICAgICAgICBQT1dFUl9UT09MU19TRVJWSUNFX05BTUU6ICdzY2FubmVyJyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyAyLiBHcmFudCBwZXJtaXNzaW9ucyB0byBpbnZva2UgQmVkcm9ja1xyXG4gICAgICAgIC8vIElkZWFsbHkgcmVzdHJpY3RzIHRvIHNwZWNpZmljIHJlc291cmNlcywgYnV0ICcqJyBmb3IgaW5pdGlhbCBkZXYgaXMgYWNjZXB0YWJsZVxyXG4gICAgICAgIHNjYW5uZXJGdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICBhY3Rpb25zOiBbJ2JlZHJvY2s6SW52b2tlTW9kZWwnXSxcclxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIDMuIENyZWF0ZSBGdW5jdGlvbiBVUkwgKFB1YmxpYyBFbmRwb2ludClcclxuICAgICAgICAvLyBUaGlzIGFsbG93cyB0aGUgZnJvbnRlbmQgdG8gdHJpZ2dlciBpdCBzZWN1cmVseS1pc2ggKHdlIGNhbiBhZGQgYXV0aCBsYXRlcilcclxuICAgICAgICBjb25zdCBmblVybCA9IHNjYW5uZXJGdW5jdGlvbi5hZGRGdW5jdGlvblVybCh7XHJcbiAgICAgICAgICAgIGF1dGhUeXBlOiBsYW1iZGEuRnVuY3Rpb25VcmxBdXRoVHlwZS5OT05FLFxyXG4gICAgICAgICAgICBjb3JzOiB7XHJcbiAgICAgICAgICAgICAgICBhbGxvd2VkT3JpZ2luczogWycqJ10sXHJcbiAgICAgICAgICAgICAgICBhbGxvd2VkTWV0aG9kczogW2xhbWJkYS5IdHRwTWV0aG9kLlBPU1RdLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnY29udGVudC10eXBlJ10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gNC4gT3V0cHV0IHRoZSBVUkxcclxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU2Nhbm5lclVybCcsIHtcclxuICAgICAgICAgICAgdmFsdWU6IGZuVXJsLnVybCxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgVVJMIHRvIHRyaWdnZXIgdGhlIHNjYW5uZXInLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==