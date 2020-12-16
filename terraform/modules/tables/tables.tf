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
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    write_capacity  = 0
    read_capacity   = 0
    projection_type = "ALL"
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
