import * as os from 'os';

export const getServerIPAddress = (): string => {
  const networkInterfaces = os.networkInterfaces();

  for (const key in networkInterfaces) {
    const interfaces = networkInterfaces[key];
    for (const iface of interfaces) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
};
