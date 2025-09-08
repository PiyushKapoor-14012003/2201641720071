const { Log } = require('./logger');

(async () => {
  try {
    const resp = await Log('backend', 'error', 'handler', 'received string, expected bool');
    console.log('Log response:', resp);
  } catch (err) {
    console.error('Logging failed:', err.message || err);
  }
})();
