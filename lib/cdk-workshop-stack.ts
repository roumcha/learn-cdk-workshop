import { Stack, StackProps } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
  }
}
