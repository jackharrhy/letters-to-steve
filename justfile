deploy:
  wing compile --platform tf-aws main.w
  cd ./target/main.tfaws && terraform apply
