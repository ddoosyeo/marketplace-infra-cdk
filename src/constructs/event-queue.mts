import { Queue } from 'aws-cdk-lib/aws-sqs';
import { NestedStack } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface EventQueuProps {
	queueName: string;
	deadletterQueueName: string;
}

export class QueueNestedStack extends NestedStack {
	constructor(scope: Construct, id: string, props: EventQueuProps) {
		super(scope, id);

		new Queue(this, 'Queue', {
			fifo: true,
			contentBasedDeduplication: true,
			queueName: props.queueName,
			deadLetterQueue: {
				queue: new Queue(this, 'DeadletterQueue', {
					queueName: props.deadletterQueueName
				}),
				maxReceiveCount: 1
			}
		});
	}
}