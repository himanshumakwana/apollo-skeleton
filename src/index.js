const { exec } = require("child_process")

exec('src/scripts/init.sh', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
