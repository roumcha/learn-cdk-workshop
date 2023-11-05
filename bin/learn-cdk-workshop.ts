#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LearnCdkWorkshopStack } from '../lib/learn-cdk-workshop-stack';

const app = new cdk.App();
new LearnCdkWorkshopStack(app, 'LearnCdkWorkshopStack');
