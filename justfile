set dotenv-load

run:
  wing run main.w

deploy:
  wing compile \
    --platform tf-aws \
    -v "root/Default/Default/cloud.Domain.hostedZoneId=$HOSTED_ZONE_ID" \
    -v "root/Default/Default/cloud.Domain.acmCertificateArn=$ACM_CERTIFICATE_ARN" \
    main.w

  cd ./target/main.tfaws && terraform apply
