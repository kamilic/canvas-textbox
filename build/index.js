const chalk = require("chalk");
const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const yargs = require("yargs").argv;
const buildType = yargs.type;
const isDev = yargs.d;
const allBuildTypes = ["umd", "cjs", "esm"];
const isBuildAll = yargs.all;
const packageFilePath = path.resolve(__dirname, "../package.json");

function build(type, projectName) {
    return new Promise(function (res, rej) {
        let execText = null;
        if(isDev) {
            execText = `rollup -c ${path.resolve(__filename, "../rollup.prod.js")} --type=${type} --projectName=${projectName} --watch`;
        } else {
            execText = `rollup -c ${path.resolve(__filename, "../rollup.prod.js")} --type=${type} --projectName=${projectName}`;
        }
        
        console.log(chalk.cyan(execText));
        cp.exec(execText, (err, stdout, stderr) => {
            if (!err) {
                res(stdout);
            } else {
                rej(stderr);
            }
        });
    });
}


function getProjectName() {
    return new Promise((res, rej) => {
        fs.readFile(packageFilePath, (err, data) => {
            if (!err) {
                let packageJsonObject = JSON.parse(data.toString());
                res(packageJsonObject.name);
            } else {
                rej(err);
            }
        });
    });
}

getProjectName().then((projectName) => {
    let promises = [];
    console.log(chalk.yellow(`building project ${projectName}...`));
    if (isBuildAll) {
        promises = allBuildTypes.map(type => build(type, projectName));
    } else if (allBuildTypes.some(v => v === buildType)) {
        promises = build(buildType, projectName);
    } else {
        throw Error("Please specify a correct build type. eg.cjs, umd, esm.");
    }
    
    if (promises.length > 0) {
        Promise.all(promises).then(function () {
            console.log(chalk.green("build success."));
        }).catch(function (err) {
            console.log(chalk.red("build failed."));
            console.error("stack msg:" + chalk.red(err));
        })
    }
});


