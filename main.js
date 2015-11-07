fs    = require('fs');
irc   = require('irc');
yaml  = require('js-yaml');

try {
  var conf = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
  console.log(conf);
} catch (e) {
  console.log(e);
}

var client = new irc.Client(conf['connection']['server'], conf['bot']['nick'], {
  userName: conf['bot']['username'],
  realName: conf['bot']['realname'],
  port: conf['connection']['port'],
  channels: conf['connection']['channels']
})
