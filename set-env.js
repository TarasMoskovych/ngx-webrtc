// Buffer.from(JSON.stringify({})).toString('base64');
const { writeFile } = require('fs');
const writeFileUsingFS = (targetPath, environmentFileContent) => {
  writeFile(targetPath, environmentFileContent, (err) => {
    if (err) {
      console.log(err);
    }
    if (environmentFileContent !== '') {
      console.log(`wrote variables to ${targetPath}`);
    }
  });
};
const configs = JSON.parse(Buffer.from(process.argv[2], 'base64').toString('ascii'));
const target = './src/environments/environment.prod.ts';
const environmentFileContent = `
  // This file was autogenerated by dynamically running ${process.argv[1]}
  export const environment = {
    production: ${true},
    configs: {
      AppID: '${configs.AppID}',
    },
  };
`;

writeFileUsingFS(target, environmentFileContent);
