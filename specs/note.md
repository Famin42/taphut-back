## Выбор темы

У меня появилась потребность в поиске съема новой квартиры. Я начал искать выгодоное мне предложение на интернет платформах,
таких как Onliner.by, Realt,by, Domovita.by, но столкнулся с проблемой:
каждый раз, когда ты открыаешь сайт в поиске новых объявлений, тебе приходить скурпулезно перебирать все старые, чтобы среди них выявить новое обхявление. Это достаточно хлопотное дельце. Позже, я нашел Flatty (https://t.me/FlattyBy), telegram-bot, который пресылает только новые объявления с платформ по аренде недвижимости. Но там есть больой минус: нет возможности задать фильтры, для получения только тех объявлений, которые подходят под твои критерии поиска. Поэтому и возикла идея реализовать в текущем КП телеграм-бот (помощнк в сфере аренды недвижимости), который бы мог приылать только те новые объяаления, которые будут подходить под Ваши критерии поиска.

## Выбор провайдера архитектуры

### Выбор провайдера?

В качестве реализации бэкенда, меня давно была интересна Serverless (микросервисная архитектуры??), поэтому я сразу решил реализовывать своий бэкенд с таким подходом. Serverless подзразумевает использовать облачные вычесления, поэтому после определения, что я буду реализовывать Serverless архитектуру, стал вопрос выбора облачного провайдера.

Текущие популрные облачные провайдеры: AWS (Amazon Web Services), MS Azure, Google Cloud Platform, Яндекс.Облако
Выбор пал на изучение AWS, тк он самый ТОП среди всех, имееет более 174 сервисов, и покрывает более чем 85% рынка и выгоднее выше перечисленных

Пару статей почему:

- [тут есть график, AWS круче всех ](https://www.datamation.com/cloud-computing/aws-vs-azure-vs-google-cloud-comparison.html)
- [тут графики, которые относятся к AWS Lambda (реализация Serveless на AWS)](https://mikhail.io/serverless/coldstarts/aws/)
- [тут графики и сравнение реализации Serverless на разных провайдерах (AWS Lambda, GCP functions, Azure)](https://mikhail.io/serverless/coldstarts/big3/)

### имплементация архитектуры?

Мы определились с облачным провадером: AWS;
следующим шагом нам надо продумать микросервисную архитектуру, какие сервисы нам необходимы, и как их использовать/связать.

1. Сразу ясно, что основная бизнес логика будет исполнятся Serverless с помощью [AWS Lambda](https://docs.aws.amazon.com/lambda/index.html)

## Ссылки

1. [Onliner.by](Onliner.by)
2. [Realt.by](https://realt.by/)
3. [Domovita.by](https://domovita.by/)
4. [TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html)
5. [ESLint](https://eslint.org/docs/user-guide/configuring)
6. [TSLint](https://palantir.github.io/tslint/)
7. [Prettier](https://prettier.io/docs/en/options.html)
8. [Webpack](https://webpack.js.org/)
9. [Yarn](https://classic.yarnpkg.com/en/docs/)
10. [Serverless](https://www.serverless.com/)
11. [Terraform](https://www.terraform.io/)
12. [Vercel](https://vercel.com/docs)
13. [AWS-Vault](https://github.com/99designs/aws-vault)
14. [Github](https://github.com/)
15. [AWS Cognito](https://docs.aws.amazon.com/cognito/)
16. [AWS S3](https://docs.aws.amazon.com/s3/index.html)
17. [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/index.html)
18. [AWS Lambda](https://docs.aws.amazon.com/lambda/index.html)
19. [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)
20. [AWS VTL](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html)
21. [AWS APIGateway](https://docs.aws.amazon.com/apigateway/index.html)
22. [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
23. [AWS System Manager](https://docs.aws.amazon.com/systems-manager/index.html)
24. [AWS KMS](https://aws.amazon.com/kms/)
25. [AWS CloudWatch](https://docs.aws.amazon.com/cloudwatch/index.html)
26. [AWS Amplify](https://docs.amplify.aws/)
27. [AWS SNS](https://docs.aws.amazon.com/sns/index.html)
28. [Angular](https://angular.io/)
29. [Telegam API](https://core.telegram.org/)
