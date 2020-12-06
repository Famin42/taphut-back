provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket         = "taphut-terraform-backend-dev"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "taphut-terraform-state"
  }
}

module "tables" {
  source = "../modules/tables"
}

module "alarms" {
  source = "../modules/alarms"
}

