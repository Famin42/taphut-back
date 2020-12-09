resource "aws_dynamodb_table" "TelegramUserFilters" {
  name      = "TelegramUserFilters"
  hash_key  = "chatId"
  range_key = "filterName"

  attribute {
    name = "chatId"
    type = "S"
  }

  attribute {
    name = "filterName"
    type = "S"
  }

  billing_mode = "PAY_PER_REQUEST"

  lifecycle {
    prevent_destroy = true
  }

  point_in_time_recovery {
    enabled = true
  }
}
