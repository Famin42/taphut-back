import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'taphut',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    region: 'us-east-1',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      TG_BOT_TOKEN: '${ssm:/taphut/tg-bot-token~true}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['ssm:DescribeParameters', 'ssm:GetParameter'],
        Resource: ['arn:aws:ssm:${opt:region, self:provider.region}:*:parameter/taphut/tg-bot-token'],
      },
    ],
  },
  functions: {
    hello: {
      handler: 'handler.hello',
      events: [
        {
          http: {
            path: 'bot-api',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
