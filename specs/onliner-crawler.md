# Onliner Crawler

## Description

Onliner-crawler, will collect data from onliner, validate it, and push new data to DynamoDB for next processing

## API endpoints

There are no public endpoints. It just works on schedule events.

## DynamoDB

### OnlinerApartment

- Hash Key: `id`
- Sort Key: `none`
- Global Secondary Hash Key: `status`

| **Attribute**  | **Type**                                    |
| -------------- | ------------------------------------------- |
| id             | number                                      |
| status         | stiring: 'NEW', 'IN_FLIGHT', 'ERROR', 'OLD' |
| apartment      | IOnlinerApartment                           |
| createdAt      | string                                      |
| expirationTime | number                                      |

> expirationTime - Unix time in seconds, `TTL` Attribute, when will be expired, DynamoDB delete Item with this attribute

## Events

**Schedule**: every N time

## Data flow

### onliner-crawler

1. Parallel fetch all data from onliner into `Map` where `key` is `apartment.id`
2. Batch scan DynamoDB `OnlinerApartment`, form `newApartment` with `pickBy` items from onliner which is not in our DB
3. Put this new into `OnlinerApartment` with `NEW` status

## Maintenance manual

Issues that may arise and how to handle them.

## File structure

```sh
crawlers/onliner
```
