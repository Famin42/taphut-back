variable "tables" {
  type = "list"
}

variable "alarm_action_arn" {}

resource "aws_cloudwatch_metric_alarm" "dynamodb_throttle_monitor" {
  count               = "${length(var.tables)}"
  alarm_name          = "dynamodb-throttled-${element(var.tables, count.index)}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/DynamoDB"

  dimensions = {
    TableName = "${element(var.tables, count.index)}"
  }

  period                    = "60"
  statistic                 = "Sum"
  unit                      = "Count"
  threshold                 = "0"
  alarm_description         = "Alarm when requests to ${element(var.tables, count.index)} are throttled"
  insufficient_data_actions = []
  alarm_actions             = ["${var.alarm_action_arn}"]
}
