import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
  /** アクセスを数えたい Lambda 関数 **/
  downstream: lambda.IFunction;

  /**
   * テーブルの read capacity (5から20)
   * @default 5
   */
  readCapacity?: number;
}

/** Lambda を呼び出しながらアクセスを数えるやつ */
export class HitCounter extends Construct {
  /** カウンター関数を公開 */
  public readonly handler: lambda.Function;

  /** カウンターのテーブルを公開 */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (
      props.readCapacity &&
      (props.readCapacity < 5 || 20 < props.readCapacity)
    ) {
      throw new Error("readCapacity must be >= 5 and <= 20");
    }

    super(scope, id);

    // カウンターのテーブル
    this.table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      readCapacity: props.readCapacity ?? 5,
    });

    // Lambda でアクセスカウントと下流の関数の呼び出し
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

    // カウンター関数に、下流の関数の呼び出しを許可
    props.downstream.grantInvoke(this.handler);
  }
}
