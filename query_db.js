const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgres://522f3b343cbf9debf5a320d09deb7486dedd9c85622ec4d20d72a54bffcc056a:sk_vMLGjNnC4MP_wIsZ34ICc@db.prisma.io:5432/postgres?sslmode=require' }); 
client.connect()
    .then(() => client.query('SELECT p.id, p."userId", p.cash, pos.symbol, pos.shares, pos."avgCost" FROM "Portfolio" p JOIN "Position" pos ON p.id = pos."portfolioId"'))
    .then(res => { console.log(res.rows); client.end(); })
    .catch(console.error);
