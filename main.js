bunyan = require('bunyan');
fs     = require('fs');
irc    = require('irc');
yaml   = require('js-yaml');

var log = bunyan.createLogger({name: "myapp"});

try {
  var conf = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
  log.info(conf);
} catch (e) {
  log.info(e);
  process.exit(1);
}

log.level(conf['loglevel']);

var client = new irc.Client(conf['connection']['server'], conf['bot']['nick'], {
  userName: conf['bot']['username'],
  realName: conf['bot']['realname'],
  port: conf['connection']['port'],
  channels: conf['connection']['channels']
});

/*
  prefix commands
*/
function commandPing(from, to, text, message, args) {
  log.debug(args)
  client.say(to, 'pong')
};

var commands = {
  'ping': commandPing
};

var prefix = conf['prefix'];

for (command in commands) {
  client.addListener('message', function(from, to, text, message){
    var cmdreg = new RegExp("(\\" + prefix + ')(\\w+)((\\s\\w+)*)');
    parsedCommand = cmdreg.exec(text);
    if (parsedCommand && parsedCommand[1] === prefix && parsedCommand[2] === command ) {
      commands[command](from, to, text, message, parsedCommand[3]);
    }
  });
}

/*
  treten
*/
var treten = true;

client.addListener('action', function (from, to, text, message) {
  getreten = text.match(/tritt (\S*)\s*$/)
  if (getreten && treten) {
    client.action(to, getreten[0])
    treten = false

    r = (Math.random() * 300)+30
    setInterval(function(){
      treten = true;
      clearInterval(this);
    }, r*1000)
  }
});
