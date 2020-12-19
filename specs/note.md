# Выбор темы

У меня появилась потребность в поиске съема новой квартиры. Я начал искать выгодоное мне предложение на интернет платформах,
таких как [Onliner.by[1]](onliner.by), [Realt,by[2]](Realt,by), [Domovita.by[3]](Domovita.by), но столкнулся с проблемой:
каждый раз, когда ты открыаешь сайт в поиске новых объявлений, тебе приходить скурпулезно перебирать все старые, чтобы среди них выявить новое обхявление. Это достаточно хлопотное дельце. Позже, я нашел Flatty (https://t.me/FlattyBy), telegram-bot, который пресылает только новые объявления с платформ по аренде недвижимости. Но там есть больой минус: нет возможности задать фильтры, для получения только тех объявлений, которые подходят под твои критерии поиска. Поэтому и возикла идея реализовать в текущем КП телеграм-бот (помощнк в сфере аренды недвижимости), который бы мог приылать только те новые объяаления, которые будут подходить под Ваши критерии поиска.

# Выбор провайдера/архитектуры/необходимых сервисов

## Выбор провайдера?

В качестве реализации бэкенда, меня давно была интересна [Serverless[10]](https://www.serverless.com/) (микросервисная архитектуры??), поэтому я сразу решил реализовывать своий бэкенд с таким подходом. [Serverless[10]](https://www.serverless.com/) подзразумевает использовать облачные вычесления, поэтому после определения, что я буду реализовывать [Serverless[10]](https://www.serverless.com/) архитектуру, стал вопрос выбора облачного провайдера.

Текущие популрные облачные провайдеры: AWS (Amazon Web Services), MS Azure, Google Cloud Platform, Яндекс.Облако
Выбор пал на изучение AWS, тк он самый ТОП среди всех, имееет более 174 сервисов, и покрывает более чем 85% рынка и выгоднее выше перечисленных

Пару статей почему:

- [тут есть график, AWS круче всех](https://www.datamation.com/cloud-computing/aws-vs-azure-vs-google-cloud-comparison.html)
- [тут графики, которые относятся к AWS Lambda (реализация Serveless на AWS)](https://mikhail.io/serverless/coldstarts/aws/)
- [тут графики и сравнение реализации Serverless на разных провайдерах (AWS Lambda, GCP functions, Azure)](https://mikhail.io/serverless/coldstarts/big3/)

## имплементация архитектуры?

Мы определились с облачным провадером: AWS;
следующим шагом нам надо продумать микросервисную архитектуру, какие сервисы нам необходимы, и как их использовать/связать.

- AWS Lambda
- AWS APIGateway
- AWS DynamoDB
  - AWS Cognito
  - AWS S3
  - AWS AppSync
  - AWS VTL
  - AWS CloudFormation
  - AWS System Manager
  - AWS KMS
  - AWS CloudWatch
  - AWS Amplify
  - AWS SNS

### **1. AWS Lambda**

Сразу ясно, что основная бизнес логика будет исполнятся Serverless с помощью [AWS Lambda [18]](https://docs.aws.amazon.com/lambda/index.html). Почему [AWS Lambda [18]](https://docs.aws.amazon.com/lambda/index.html)? .[ВСЕ ОТВЕТЫ ТУТ](https://aws.amazon.com/ru/lambda/features/). **[AWS Lambda [18]](https://docs.aws.amazon.com/lambda/index.html)** позволяет запускать программный код без выделения серверов и управления ими. Вы платите только за фактическое время вычисления. Если программный код не исполняется, оплата не требуется. С помощью Lambda можно запускать практически любые виды приложений и серверных сервисов, при этом не требуются какие-либо операции администрирования. Просто загрузите программный код, и Lambda обеспечит все ресурсы, необходимые для его исполнения, масштабирования и обеспечения высокой доступности. Можно настроить автоматический запуск программного кода из других сервисов AWS или вызывать его непосредственно из любого мобильного или интернет‑приложения.

**Вопрос: Что такое бессерверные вычисления?**

Бессерверные вычисления позволяют создавать и запускать приложения и сервисы, не беспокоясь о серверах. При бессерверных вычислениях приложение по‑прежнему работает на серверах, но управление этими серверами AWS полностью берет на себя. В основе бессерверных вычислений лежит сервис AWS Lambda, позволяющий запускать код без выделения серверов или управления ими.

### **2. AWS APIGateway**

нужно для реализации https endpoint-ов. С помощью его легко сделать REST или тп

Amazon API Gateway – это полностью управляемый сервис для разработчиков, предназначенный для создания, публикации, обслуживания, мониторинга и обеспечения безопасности API в любых масштабах. Через API приложения получают доступ к данным, бизнес‑логике или функциональным возможностям ваших серверных сервисов. API Gateway позволяет создавать API RESTful и WebSocket, которые являются главным компонентом приложений для двусторонней связи в режиме реального времени. API Gateway поддерживает рабочие нагрузки в контейнерах и бессерверные рабочие нагрузки, а также интернет‑приложения.

API Gateway берет на себя все задачи, связанные с приемом и обработкой сотен тысяч одновременных вызовов API, включая управление трафиком, поддержку CORS, авторизацию и контроль доступа, регулирование количества запросов, мониторинг и управление версиями API. Работа с API Gateway не требует минимальных платежей или стартовых вложений. Вы платите за полученные вызовы API и переданный объем данных и можете с помощью многоуровневой модели ценообразования API Gateway снизить свои расходы по мере масштабирования использования API.

### **Принцип работы API Gateway**

![API Gateway](./screenshots/.xdp_APIGateway-princip-diagram.I88PV0)

> В контекстке моего приложения, используется для того, чтобы сделать HTTP Endpoint (webhook для telegram-bot-а), который будет являтся тригером для вызова [Lambad функции (ссылка на функцию)](../src/telegram-bot/webhook.ts)

### **3. AWS DynamoDB**

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
