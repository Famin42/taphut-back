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

resource "aws_dynamodb_table" "OnlinerApartment" {
  name     = "OnlinerApartment"
  hash_key = "id"

  attribute {
    name = "id"
    type = "N"
  }

  ttl {
    attribute_name = "expirationTime"
    enabled        = true
  }

  billing_mode = "PAY_PER_REQUEST"

  lifecycle {
    prevent_destroy = true
  }

  point_in_time_recovery {
    enabled = true
  }
}
