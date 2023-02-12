import 'dotenv/config';

import env from 'env-var';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { WorkerNestedStack, QueueNestedStack, AlarmNestedStack } from './constructs/index.mjs';

const DB_HOST = env.get('DB_HOST').required().asString();
const DB_PORT = env.get('DB_PORT').required().asString();
const DB_NAME = env.get('DB_NAME').required().asString();
const DB_USER = env.get('DB_USER').required().asString();
const DB_PASSWORD = env.get('DB_PASSWORD').required().asString();

const KLAYTN_PROVIDER = env.get('KLAYTN_PROVIDER').required().asString();
const ETHEREUM_PROVIDER = env.get('ETHEREUM_PROVIDER').required().asString();
const POLYGON_PROVIDER = env.get('POLYGON_PROVIDER').required().asString();
const BINANCE_PROVIDER = env.get('BINANCE_PROVIDER').required().asString();

class MarketplaceInfraStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new AlarmNestedStack(this, 'Alarm', {
      topicName: 'event-worker-error-alarm',
      emailAddresses: ['']
    });

    new QueueNestedStack(this, 'Queue', {
      queueName: 'marketplace-event-queue.fifo',
      deadletterQueueName: 'marketplace-event-dl-queue.fifo'
    });

    new WorkerNestedStack(this, 'Worker', {
      applicationName: 'marketplace-worker',
      environmentName: 'marketplace-worker-prod',
      queueName: 'marketplace-event-queue.fifo',
      account: props.env?.account as string,
      provider: {
        klaytn: KLAYTN_PROVIDER,
        ethereum: ETHEREUM_PROVIDER,
        polygon: POLYGON_PROVIDER,
        binance: BINANCE_PROVIDER
      },
      database: {
        host: DB_HOST,
        name: DB_NAME,
        user: DB_USER,
        port: DB_PORT,
        password: DB_PASSWORD
      },
      alarmTopic: 'event-worker-error-alarm'
    });
  };
}

const app = new App();

new MarketplaceInfraStack(app, 'MarketplaceInfraStack', {
  env: {
    account: '',
    region: 'ap-northeast-2'
  }
})