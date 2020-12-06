resource "aws_s3_bucket" "taphut-tf-backend" {
  bucket = "taphut-terraform-backend-${var.env}"
  acl    = "private"

  # Enable versioning so we can see the full revision history of our state files
  versioning {
    enabled = true
  }

  tags = {
    Where_Used  = "For terraform stored states"
    Environment = "Environment: ${var.env}"
  }
}


resource "aws_dynamodb_table" "taphut-tf-state" {
  name         = "taphut-terraform-state"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Where_Used  = "For terraform stored states"
    Environment = "Environment: ${var.env}"
  }
}
