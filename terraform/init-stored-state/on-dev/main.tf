provider "aws" {
  region = "us-east-1"
}


module "stored-state" {
  source = "../../modules/stored-state"
  env    = "dev"
}
