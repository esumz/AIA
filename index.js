var http = require('http');
var options = {};

// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'total.js' };
// options.https = { key: fs.readFileSync('keys/agent2-key.pem'), cert: fs.readFileSync('keys/agent2-cert.pem')};

require('total.js').http('debug', options);
// require('total.js').http('test', options);
// require('total.js').http('release', options);

// require('total.js').https('debug', options);
// require('total.js').https('test', options);
// require('total.js').https('release', options);