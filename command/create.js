"use strict";
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const shell = require("shelljs");

// 要拷贝的目标所在路径
let templatePath;
// 目标文件夹根路径
let targetRootPath;

// 代理监听shell返回, 做统一处理
let shellRes = new Proxy(
  { response: undefined },
  {
    set: function (obj, prop, newVal) {
      switch (typeof newVal) {
        case "object":
          if (newVal.code !== 0) {
            shell.echo(
              chalk.red(
                `Error code: ${newVal.code}, 详细信息: ${newVal.stderr}`
              )
            );
            shell.exit(1);
          }
          break;
        case "string":
          break;
      }
      obj[prop] = newVal;
      return true;
    },
  }
);

/**
 * 生成项目
 * @param {objec} templateConfig 模版配置信息
 * @param {string} name 项目名
 */
function generateProject(templateConfig, name) {
  templatePath =
    typeof templateConfig.templatePath !== "undefined"
      ? path.join(__dirname, templateConfig.templatePath)
      : path.join(__dirname, "..", "templates/react-app/*");

  targetRootPath = templateConfig.targetRootPath;
  let targetDir = path.join(targetRootPath, name);

  if (fs.existsSync(targetDir)) {
    // 如果已存在改模块，提问开发者是否覆盖该模块
    inquirer
      .prompt([
        {
          name: "project-overwrite",
          type: "confirm",
          message: `项目${chalk.blue(name)}已存在, 是否需要覆盖?`,
          default: false,
          validate: function (input) {
            const done = this.async();
            if (input.lowerCase !== "y" || input.lowerCase !== "n") {
              done("请输入 y/n !")
              return;
            }
            return done(null ,true);
          },
        },
      ])
      .then((answers) => {
        console.log("answers", answers);

        // 如果确定覆盖
        if (answers["project-overwrite"]) {
          // 删除文件夹
          console.log(
            chalk.yellow(`项目${chalk.blue(name)}已存在, 正在移除...`)
          );
          shellRes.response = shell.rm("-R", targetDir);

          //创建新模块文件夹
          shellRes.response = shell.mkdir(targetDir);
          shellRes.response = shell.cp("-R", templatePath, targetDir);

          shellRes.response = shell.cd(targetDir);

          console.log(
            chalk.green(
              `✅ 创建项目${chalk.blue(name)}成功, 正在安装项目依赖...`
            )
          );
          shellRes.response = shell.exec("npm install");
        }
      })
      .catch((err) => {
        console.log(chalk.red(err));
      });
  } else {
    //创建新模块文件夹
    shellRes.response = shell.mkdir(targetDir);
    shellRes.response = shell.cp("-R", templatePath, targetDir);

    shellRes.response = shell.cd(targetDir);
    console.log(
      chalk.green(`✅ 创建项目${chalk.blue(name)}成功, 正在安装项目依赖...`)
    );
    shellRes.response = shell.exec("npm install");
  }
}

module.exports = generateProject;
