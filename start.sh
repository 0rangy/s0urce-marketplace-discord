pm2 kill
node ./global_deploy_commands.js
pm2 start index.js
pm2 log