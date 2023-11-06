import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
  /** アクセスを数えたい Lambda 関数 **/
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  /** カウンター関数を公開 */
  public readonly handler: lambda.Function;

  /** カウンターのテーブルを公開 */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
    });

    this.handler = new lambda.Function(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "hitcounter.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName,
      },
    });

    // カウンター関数に、カウンターテーブルへの読み書きを許可
    this.table.grantReadWriteData(this.handler);

    // カウンター関数に、数える対象の関数の呼び出しを許可
    props.downstream.grantInvoke(this.handler);
  }
}
