# **Продолжение разработки**

## DynamoDB

**Коллекция** - `OnlinerApartment`:

- `id`: **number** // `Primary key` - те `hash_key` Attribute
- `expirationTime`: **number** // !! `TTL` Attribute
- `status`: **string** // принимает значения "OLD" и "NEW"
- `createdAt`: **string** // timestamp
- `updatedAt`: **string** // timestamp
- `apartment`: **Object** // объект с Onliner.by (`IOnlinerApartment`)
  - [там оочень больша модель IOnlinerApartment](../src/onliner-crawler/model.ts)

```ts
export interface IOnlinerApartment {
  id: number;
  price: {
    amount: string;
    currency: OnlinerCurrences;
    converted: {
      [key: string]: {
        amount: string;
        currency: OnlinerCurrences;
      };
    };
  };
  rent_type: OnlinerRentType;
  location: IOnlinerApartmentLocation;
  photo: string;
  contact: {
    owner: boolean;
  };
  created_at: string;
  last_time_up: string;
  up_available_in: number;
  url: string;
}

export type OnlinerCurrences = 'USD' | 'BYN';

export type OnlinerRentType = '1_rooms' | '2_rooms' | '3_rooms' | '4_rooms' | '5_rooms';

export interface IOnlinerApartmentLocation {
  address: string;
  user_address: string;
  latitude: number;
  longitude: number;
}
```

![dynamodb-onliner](./screenshots/.xdp_dynamodb-onliner.AE8JV0)

**Коллекция** - `OnlinerApartment`:

`hash_key` и `range_key` образуют **Primary Key**

- `chatId`: String; // идентификатор чата между пользователем и ботом, `hash_key`
- `filterName`: String; // наименования фильтра, `range_key`
- `createdAt`: String; // timestamp создания
- `updatedAt`: String; // timestamp редактирования
- `filter`: Map; // храни объект, реализующий IFilter интерфейс
  - [там оочень больша модель IOnlinerApartment](../src/onliner-crawler/model.ts)

```ts
export interface IFIlter {
  filterName: string;
  city?: string;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  roomsNumber?: number;
}

export type Currency = 'USD' | 'BYN';
```

![dynamodb-onliner](./screenshots/.xdp_telegramUserFilter.ERXUV0)

## Onliner-Crawler сервис

> ВОТ ТУТ [serverless.yml config](../src/onliner-crawler/serverless.yml)

> ВОТ ТУТ [entry point (`handler` функция)](../src/onliner-crawler/onliner-crawler.ts)

Onliner-Crawler будет собирать данные с onliner, проверять их и отправлять новые данные в DynamoDB для следующей обработки.

запускается кажде 15 минут, описано в [serverless.yml config](../src/onliner-crawler/serverless.yml)

> а именно здечь

```yml
# ...
events:
  - schedule:
      name: onliner-crawler-event
      description: 'Run the Onliner Crawler to fetch data from Onliner'
      rate: rate(15 minutes)
# ...
```

**Обощенный алгоритм:**

1. Совершает первоначальный запрос на `Onliner API`, получает количество элементов, информацтю для пагинации
2. формируется массив запросов к `Onliner API` с параетрами пагинации
3. формируется паралелльное выполнение запросов к `Onliner API` batch-ами по 10 штук, и `timeout = 2500ms`, объявленя из ответов запроов складываются в объект `apartmentMap` типа ключ значение, где ключ - это уникальный идентификатор объявления с `Onliner API`, а значение - само объявлеие
4. Для оптимизации уменьшения количества запросов в БД, мы начинаем выполнять `SCAN` объявлений из нашей коллекции `OnlinerApartment`, и удаляем удаляем объявления из `apartmentMap`,которые пришли из нашей коллекции
   > (тк приходилось бы для каждого элемента совершать операцию `PutItem` с условием выполнения запроса, что безусловно занимает большее количество обращений в БД, чем обычный scan и сделать обработку данных с помощью `Lambda` функци
5. Конечный сформированный/обработанный объект `apartmentMap`, мы начианем перебирать по ключу и заносить данные в нашу коллекцию `OnlinerApartment` со `status: "NEW`

> ниже приведено логирование выполнения `Onliner-Crawler` Lambda функции c помощью сервиса `AWS CloudWatch`

```log
2020-12-20T10:19:36.758+03:00 START RequestId: bfc102c1-2368-4cdb-8fbb-fcf513aaa402 Version: $LATEST
2020-12-20T10:19:36.773+03:00 [info] Onliner Crawler
2020-12-20T10:19:36.775+03:00 [info] Formed Onliner URL: https://ak.api.onliner.by/search/apartments?page=1&limit=500
2020-12-20T10:19:38.336+03:00 [info] PAGE: 1, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=1&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 2, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=2&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 3, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=3&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 4, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=4&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 5, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=5&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 6, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=6&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 7, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=7&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 8, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=8&limit=500
2020-12-20T10:19:38.337+03:00 [info] PAGE: 9, LIMIT: 500, URL: https://ak.api.onliner.by/search/apartments?page=9&limit=500
2020-12-20T10:19:38.338+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=1&limit=500
2020-12-20T10:19:38.339+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=2&limit=500
2020-12-20T10:19:38.340+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=3&limit=500
2020-12-20T10:19:38.353+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=4&limit=500
2020-12-20T10:19:38.354+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=5&limit=500
2020-12-20T10:19:38.355+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=6&limit=500
2020-12-20T10:19:38.373+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=7&limit=500
2020-12-20T10:19:38.374+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=8&limit=500
2020-12-20T10:19:38.375+03:00 [info] Fetch from url: https://ak.api.onliner.by/search/apartments?page=9&limit=500
2020-12-20T10:19:39.195+03:00 [info] Keys in dataMap: 0
2020-12-20T10:19:39.195+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.355+03:00 [info] Keys in dataMap: 500
2020-12-20T10:19:39.356+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.375+03:00 [info] Keys in dataMap: 1000
2020-12-20T10:19:39.375+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.399+03:00 [info] Keys in dataMap: 1500
2020-12-20T10:19:39.399+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.575+03:00 [info] Keys in dataMap: 2000
2020-12-20T10:19:39.575+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.624+03:00 [info] Keys in dataMap: 2500
2020-12-20T10:19:39.633+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.659+03:00 [info] Keys in dataMap: 3000
2020-12-20T10:19:39.673+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.728+03:00 [info] Keys in dataMap: 3500
2020-12-20T10:19:39.733+03:00 [info] Keys in batchOfData: 426
2020-12-20T10:19:39.855+03:00 [info] Keys in dataMap: 3926
2020-12-20T10:19:39.873+03:00 [info] Keys in batchOfData: 500
2020-12-20T10:19:39.874+03:00 [info] fetching from Onliner: length: 4426
2020-12-20T10:19:39.874+03:00 [info] filterOutOnlyNewValues
2020-12-20T10:19:39.874+03:00 [info] Scan: Limit = 500
2020-12-20T10:19:40.337+03:00 [info] LastEvaluatedKey: {"id":430131}
2020-12-20T10:19:40.596+03:00 [info] LastEvaluatedKey: {"id":387010}
2020-12-20T10:19:40.975+03:00 [info] LastEvaluatedKey: {"id":623763}
2020-12-20T10:19:41.155+03:00 [info] LastEvaluatedKey: {"id":626663}
2020-12-20T10:19:41.418+03:00 [info] LastEvaluatedKey: {"id":625270}
2020-12-20T10:19:41.634+03:00 [info] LastEvaluatedKey: {"id":238964}
2020-12-20T10:19:41.774+03:00 [info] LastEvaluatedKey: {"id":624113}
2020-12-20T10:19:41.937+03:00 [info] LastEvaluatedKey: {"id":624492}
2020-12-20T10:19:42.134+03:00 [info] LastEvaluatedKey: {"id":556877}
2020-12-20T10:19:42.336+03:00 [info] LastEvaluatedKey: {"id":612366}
2020-12-20T10:19:42.456+03:00 [info] LastEvaluatedKey: {"id":585886}
2020-12-20T10:19:42.517+03:00 [info] LastEvaluatedKey: undefined
2020-12-20T10:19:42.517+03:00 [info] Total raws: 5683
2020-12-20T10:19:42.517+03:00 [info] filtered apartments from Onliner: length: 3
2020-12-20T10:19:42.517+03:00 [info] new apartment id: 627332
2020-12-20T10:19:42.534+03:00 [info] new apartment id: 627331
2020-12-20T10:19:42.534+03:00 [info] new apartment id: 627330
2020-12-20T10:19:42.593+03:00 [info] COMPLETE SUCCESS, put items: 3
2020-12-20T10:19:42.595+03:00 END RequestId: bfc102c1-2368-4cdb-8fbb-fcf513aaa402
2020-12-20T10:19:42.595+03:00 REPORT RequestId: bfc102c1-2368-4cdb-8fbb-fcf513aaa402
2020-12-20T10:19:42.595+03:00 Duration: 5836.21 ms Billed Duration: 5837 ms	Memory Size: 512 MB
2020-12-20T10:19:42.595+03:00 Max Memory Used: 140 MB Init Duration: 550.60 ms
```

## AppSync Public (GraphQL Endpoint), имя сервиса: `taphut-api-public`

> ВОТ ТУТ [public graphql schema config](../src/appsync/public/schema.graphql)

> ВОТ ТУТ [serverless.yml config file](../src/appsync/public/serverless.yml)

> ВОТ ТУТ [request.vtl](../src/appsync/public/apartments/onliner/request.vtl)

> ВОТ ТУТ [response.vtl](../src/appsync/public/apartments/onliner/response.vtl)

> **!! ВОТ ТУТ ВАЖНО БУДЕТ УПОМЯНУТЬ ПРО ТОТ САМЫЙ VTL, его реализацию**

### схема GraphQL

```graphql
schema {
  query: Query
}

type Query {
  # get onliner apartments
  onlinerApartments(limit: Int = 10, nextToken: String = null): OnlinerApartmentRowWithPagination
}

#  ...
```

### объявление GraphQL в AppSync

```yml
# ...
mappingTemplatesLocation: .
mappingTemplates:
  - dataSource: OnlinerApartment
    type: Query
    field: onlinerApartments
    request: apartments/onliner/request.vtl
    response: apartments/onliner/response.vtl
# ...
```

### request.vtl для `onlinerApartments`

```vtl
{
  "version" : "2017-02-28",
  "operation" : "Scan",
  "limit": $util.defaultIfNull($ctx.args.limit, 10),
  "nextToken": $util.toJson($util.defaultIfNull($ctx.args.nextToken, null)),
}
```

### response.vtl для `onlinerApartments`

```vtl
$util.toJson($context.result)
```

### объявление ресурса

```yml
# ...
dataSources:
  - type: AMAZON_DYNAMODB
    name: OnlinerApartment
    description: 'Onliner apartment table'
    config:
      tableName: 'OnlinerApartment'
      serviceRoleArn: '${self:custom.appSyncDynamoServiceRole}'
# ...
```

> **Ниже приведу пару monitoring графиков этого сервиса**

![appsync-public-monitoring](./screenshots/.xdp_appsync-public-monitoring.YHQCV0)

## **3.4 описание разработки Telegram endpoint-а для бота на бэке?**

## **3.5 описание разработки Angular client-а + настройка его CI/DI?**

# **Тестирование**

## описание тестирования

# **Руководство программиста**

## описание руководства программиста

# Ссылки

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
30. [AWS Vault](https://github.com/99designs/aws-vault)
