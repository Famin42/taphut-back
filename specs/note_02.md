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
}
```

![dynamodb-onliner](./screenshots/.xdp_telegramUserFilter.ERXUV0)

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
