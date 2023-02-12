import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { NestedStack } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface AlarmProps {
  topicName: string;
  emailAddresses: string[];
}

export class AlarmNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: AlarmProps) {
		super(scope, id);

    const topic = new Topic(this, 'AlarmTopic', {
      topicName: props.topicName
    });

    for (const emailAddress of props.emailAddresses) {
      topic.addSubscription(new EmailSubscription(emailAddress));
    }
  }
}
