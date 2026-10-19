const post = require('./post.js');
function activate(host) { host.registerPostProcessor(post); }
