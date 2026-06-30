require('dotenv').config();
const os = require('os');
const app = require('./app');

const PORT = process.env.PORT || 4000;

function getLocalIp() {
  const interfaces = Object.values(os.networkInterfaces()).flat();
  const candidates = interfaces.filter(i => i.family === 'IPv4' && !i.internal);

  // Preferimos rangos de LAN doméstica típicos — VPNs como Cloudflare WARP
  // también aparecen acá (ej: 172.16.x.x) y no sirven para conectar desde el celular.
  const home = candidates.find(i => i.address.startsWith('192.168.') || i.address.startsWith('10.'));
  return (home ?? candidates[0])?.address;
}

app.listen(PORT, () => {
  console.log(`Sazón API corriendo en http://localhost:${PORT}`);
  const lanIp = getLocalIp();
  if (lanIp) {
    console.log(`Accesible desde otros dispositivos en la misma red en: http://${lanIp}:${PORT}`);
  }
});
