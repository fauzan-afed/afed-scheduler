module.exports = {
  apps: [{
    name: 'afed-scheduler',
    script: 'npm',
    args: 'start',
    cwd: '/root/afed-scheduler',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/afed-scheduler-error.log',
    out_file: '/var/log/pm2/afed-scheduler-out.log',
    log_file: '/var/log/pm2/afed-scheduler-combined.log',
    time: true,
    merge_logs: true
  }]
};
