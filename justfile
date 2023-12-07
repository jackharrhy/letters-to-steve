run:
  wing run main.w

deploy:
  wing compile --platform tf-aws main.w
  cd ./target/main.tfaws && terraform apply
