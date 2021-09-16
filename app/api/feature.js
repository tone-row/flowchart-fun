const { serialize } = require("cookie");
/**
 * Eventually this handler will be responsible for
 * determining what features a user has access to
 */
export default async function handler(req, res) {
  console.log(req.cookies);

  // 30 Days From Now
  let today = new Date();
  let future = new Date(today);
  future.setDate(today.getDate() + 30);
  const expires = future.toISOString().split("T")[0];

  const cookie = serialize("features", JSON.stringify([]), {
    expires: new Date("2020-12-01"),
  });

  res.setHeader("Set-Cookie", [cookie]);
  res.end();
}
