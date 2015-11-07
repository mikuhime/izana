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

// treten
var treten = true;

client.addListener('action', function (from, to, text, message) {
  var tritt = /tritt (\S*)$/
  getreten = text.match(tritt)
  if (getreten && treten) {
    client.action(from, getreten[0])
    treten = false
  }
});

setInterval(function(){
  treten = true;
}, 3*60*1000)
