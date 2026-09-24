const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.smartcommerce.zkd6jjt.mongodb.net",
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);