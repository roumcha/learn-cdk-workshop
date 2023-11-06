import * as cdk from "aws-cdk-lib";
import { Capture, Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "../lib/hitcounter";

test("DynamoDB Table Created With Encryption", () => {
  const stack = new cdk.Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::DynamoDB::Table", 1);

  template.hasResource("AWS::DynamoDB::Table", {
    DeletionPolicy: "Delete",
    Properties: {
      SSESpecification: { SSEEnabled: true },
    },
  });
});

test("Lambda Has Environment Variables", () => {
  const stack = new cdk.Stack();

  // WHEN
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new lambda.Function(stack, "TestFunction", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "hello.handler",
      code: lambda.Code.fromAsset("lambda"),
    }),
  });

  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      DOWNSTREAM_FUNCTION_NAME: { Ref: "TestFunction22AD90FC" },
      HITS_TABLE_NAME: { Ref: "MyTestConstructHits24A357F0" },
    },
  });
});

test("Read Capacity Can Be Configured", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
      readCapacity: 3,
    });
  }).toThrow(/readCapacity must be.*/);
});
