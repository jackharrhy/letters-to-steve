bring cloud;
bring util;
bring http;
bring expect;

let domain = new cloud.Domain(
  domainName: "steve-letter-writ.ing",
);

let website = new cloud.Website(
  path: "./static",
  domain: domain,
) as "letters-to-steve-site";

let api = new cloud.Api({
  cors: true,
  corsOptions: {
    allowHeaders: ["*"],
    allowMethods: [http.HttpMethod.POST],
  },
}) as "letters-to-steve-api";
website.addJson("config.json", { api: api.url });

let counter = new cloud.Counter() as "letters-to-steve-counter";

api.post("/hello-steve", inflight (request) => {
  return {
    status: 200,
    headers: {
      "Content-Type" => "text/html",
      "Access-Control-Allow-Origin" => "*",
    },
    body: "<div id=\"hello\" class=\"mt-4\">hello from steve, here is a counter: {counter.inc()}</div>",
  };
});
