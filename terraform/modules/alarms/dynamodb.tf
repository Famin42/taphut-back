variable "tables" {
  description = "Tables to monitor for throttling events"
  type        = list(string)

  default = [
    "TelegramUserFilters",
    "OnlinerApartment"
  ]
}

resource "aws_sns_topic" "dynamodb-throttle-alarms" {
  name = "dynamodb-throttle-alarms"
}

module "dynamodb_throttle_alarm" {
  source           = "../dynamodb_throttle_alarm"
  tables           = var.tables
  alarm_action_arn = aws_sns_topic.dynamodb-throttle-alarms.arn
}
