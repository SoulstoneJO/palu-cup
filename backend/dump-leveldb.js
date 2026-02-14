const fs = require('fs');
const { Level } = require('level');
const db = new Level('./leveldb', { valueEncoding: 'json' });

(async () => {
  const data = {};
  for await (const [key, value] of db.iterator()) {
    data[key] = value;
  }
  fs.writeFileSync('dump.json', JSON.stringify(data, null, 2));
  await db.close();
})();