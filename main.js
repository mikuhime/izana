bunyan  = require('bunyan');
fs      = require('fs');
irc     = require('irc');
twitter = require('twit');
yaml    = require('js-yaml');

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

function izanaError(msg, to, err) {
  log.error(err);
  client.say(to,msg);
}

/*
 twitter
*/
var anrainerkot = new twitter({
  access_token: conf['anrainerkot']['access_token'],
  access_token_secret: conf['anrainerkot']['access_token_secret'],
  consumer_key: conf['anrainerkot']['consumer_key'],
  consumer_secret: conf['anrainerkot']['consumer_secret']
});

function commandAnrainerkot(from, to, text, message, args) {
  anrainerkot.post('statuses/update', {status: args},  function(error, tweet, response){
    if(error) {
      izanaError("Error while tweeting", to, error);
    }
  });
}

var userstream = anrainerkot.stream('user',{ with: 'user' });

userstream.on('tweet', function(tweet) {
  client.say(conf['anrainerkot']['channel'], 'https://twitter.com/' + tweet['user']['screen_name'] + '/status/' + tweet['id_str'] + ' ' + tweet['text'])
})

/*
  prefix commands
*/
function commandPing(from, to, text, message, args) {
  log.debug(args)
  client.say(to, 'pong')
};

var commands = {
  'anrainerkot': commandAnrainerkot,
  'ping': commandPing
};

var prefix = conf['prefix'];

client.addListener('message', function(from, to, text, message){
  var cmdreg = new RegExp("(\\" + prefix + ')(\\w+)(.*)');
  parsedCommand = cmdreg.exec(text);
  if (parsedCommand && parsedCommand[1] === prefix && (parsedCommand[2] in commands)) {
    log.debug('Executing command ' + parsedCommand[2])
    commands[parsedCommand[2]](from, to, text, message, parsedCommand[3]);
  }
});


/*
  treten
*/
var treten = true;
var nichtTreten = conf['treten']['nicht']
var names = {}

client.addListener('names', function(channel, nicks){
  names[channel] = nicks;
})

client.addListener('action', function (from, to, text, message) {
  getreten = text.match(/tritt (\S*)\s*$/)
  if (getreten && treten && (getreten[1] in names[to]) && !~nichtTreten.indexOf(getreten[1])) {
    log.debug('Trete ' + getreten[1] + ' zurück')
    client.action(to, getreten[0])
    treten = false

    r = (Math.random() * 300)+30
    setInterval(function(){
      treten = true;
      clearInterval(this);
    }, r*1000)
  }
});
