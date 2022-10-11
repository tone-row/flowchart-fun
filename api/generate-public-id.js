const Moniker = require("moniker");
const names = Moniker.generator([
  Moniker.adjective,
  Moniker.noun,
  Moniker.verb,
]);

export default async function handler(req, res) {
  res.json(names.choose());
}
