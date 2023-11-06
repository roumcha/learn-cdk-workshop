# AWS CDK の練習

[AWS CDK Workshop](https://cdkworkshop.com/ja/) をやってみた。

## メモ

### ビルドされた JavaScript はこまめに消す

`.ts` ファイルがビルドされて `.d.ts` とか `.js` が生成されていると、TypeScript を変更してもテストなどに反映されなくて焦った。

### Lambda の AWS SDK のバージョンが違う？

チュートリアルにしたがって Lambda 環境（多分 Amazon Linux）の AWS SDK v2 を `require` したが、無いって言われた。

AWS SDK v3 は入っていたので、調べて書き換えた。

### JavaScript っていいな

オール TypeScript にしたい気持ちもあったけど、Lambda に投げるコードは JavaScript (cjs) で書いた。

ビルドの設定に労力をかけないで済むのがよい。
型コメント（正式名称わからない）を書けば補完も効くし、単一ファイルならわざわざ TypeScript にする必要ないと気づいた。

### pnpm

pnpm でやってみたが、CDK の動作に特に問題なし。

注意点は、

- `cdk init` すると勝手に `npm install` をおっぱじめる
  → pnpm を使いたい場合はまず `cdk init --generate-only ...` とする。
- AWS CodeBuild 上で pnpm を動かすのは若干面倒
  → CodeBuild はやめて、GitHub Actions にすればいい。

## コマンド

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
