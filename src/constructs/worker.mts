import { CfnApplication, CfnEnvironment } from 'aws-cdk-lib/aws-elasticbeanstalk';
import { NestedStack, NestedStackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface Database {
	host: string;
	name: string;
	user: string;
	port: string;
	password: string;
}

interface Provider {
	klaytn: string;
	ethereum: string;
	polygon: string;
	binance: string;
}

interface WorkerProps extends NestedStackProps {
	applicationName: string;
	environmentName: string;
	queueName: string;
	account: string;
	provider: Provider;
	database: Database;
}

export class WorkerNestedStack extends NestedStack {
	constructor(scope: Construct, id: string, props: WorkerProps) {
		super(scope, id, props);

		const workerApp = new CfnApplication(
			this, 
			'WorkerApplication',
			{ applicationName: props.applicationName }
		);

		const workerEnvOption: CfnEnvironment.OptionSettingProperty[] = [
			{
				namespace: 'aws:ec2:instances',
				optionName: 'InstanceTypes',
				value: 't3.small'
			},
			{
				namespace: 'aws:autoscaling:launchconfiguration',
				optionName: 'IamInstanceProfile',
				value: 'role-name'
			},
			{
				namespace: 'aws:elasticbeanstalk:sqsd',
				optionName: 'WorkerQueueURL',
				value: `https://sqs.ap-northeast-2.amazonaws.com/${props.account}/${props.queueName}`
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'PORT',
				value: '3000'
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'DB_HOST',
				value: props.database.host
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'DB_PORT',
				value: props.database.port
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'DB_NAME',
				value: props.database.name
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'DB_USER',
				value: props.database.user
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'DB_PASSWORD',
				value: props.database.password
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'KLAYTN_PROVIDER',
				value: props.provider.klaytn
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'ETHEREUM_PROVIDER',
				value: props.provider.ethereum
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'POLYGON_PROVIDER',
				value: props.provider.polygon
			},
			{
				namespace: 'aws:elasticbeanstalk:application:environment',
				optionName: 'BINANCE_PROVIDER',
				value: props.provider.binance
			},
			{
				namespace: 'aws:autoscaling:asg',
				optionName: 'MinSize',
				value: '1'
			},
			{
				namespace: 'aws:autoscaling:asg',
				optionName: 'MaxSize',
				value: '2'
			}
		];

		const env = new CfnEnvironment(this, 'WorkerEnvironment', {
			environmentName: props.environmentName,
			applicationName: workerApp.applicationName as string,
			solutionStackName: '64bit Amazon Linux 2 v5.6.3 running Node.js 16',
			optionSettings: workerEnvOption,
			tier: {
				name: 'Worker',
				type: 'SQS/HTTP'
			}
		});

		env.addDependency(workerApp);
	}
}