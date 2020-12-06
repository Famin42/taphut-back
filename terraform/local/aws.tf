provider "aws" {
  region                      = "us-east-1"
  access_key                  = "anaccesskey"
  secret_key                  = "asecretkey"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  skip_region_validation      = true

  endpoints {
    dynamodb = "http://localhost:4569"
  }
}

module "tables" {
  source = "../modules/tables"
}
