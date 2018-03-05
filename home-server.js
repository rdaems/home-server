var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var pug = require('pug');
var diskspace = require('diskspace');

server.listen(80, () => console.log('app listens on port 80'))

app.get('/', (req, res) => home(req, res))

var domain = 'http://raspberrypi.local'
var kodi_url = domain + ':8080'
var rasptorrent_url = domain + ':8081/search'
var transmission_url = domain + ':9091'
var sickrage_url = domain + ':8082'
var couchpotato_url = domain + ':5050'

function home(req, res) {
    var html = pug.renderFile('template.pug', {'kodi_url': kodi_url, 'rasptorrent_url': rasptorrent_url, 'transmission_url': transmission_url, 'sickrage_url': sickrage_url, 'couchpotato_url': couchpotato_url});
    res.end(html)
}

var info = {'temp': NaN, disk: {'used': NaN, 'total': NaN}};
function update_info(socket) {
  info.temp = 25
  socket.emit('info', info)

  diskspace.check('/', function (err, result)
  {
    info.disk = result
    socket.emit('info', info)
  });
}

io.on('connection', function(socket){
  setInterval(function() {
    update_info(socket);
  }, 1000)
})
