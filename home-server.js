var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var pug = require('pug');
var diskspace = require('diskspace');
var exec = require('child_process').exec;

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

var info = {temp: NaN, disk: {'used': NaN, 'total': NaN}, vpn: undefined, public_ip: undefined, private_ip: undefined};
function update_info(socket) {
  exec('cat /sys/class/thermal/thermal_zone0/temp', function (err, result) {
    info.temp = (result / 1000).toFixed(1)
    socket.emit('info', info)
  });

  diskspace.check('/mnt/hdd', function (err, result)
  {
    info.disk = result
    socket.emit('info', info)
  });

  exec('expressvpn status', function (err, result) {
    if (result[0] == 'N') {
      info.vpn = 'not connected'
    } else {
      info.vpn = 'connected'
    }
    socket.emit('info', info)
  });

  exec('curl ipinfo.io/ip', function (err, result) {
    info.public_ip = result
    socket.emit('info', info)
  });

  exec('hostname -I', function (err, result) {
      info.private_ip = result
      socket.emit('info', info)
    });
}

io.on('connection', function(socket){
  setInterval(function() {
    update_info(socket);
  }, 1000)
})
