const posts = require('./post.js');
function activate(host) { for (const post of posts) host.registerPostProcessor(post); }
