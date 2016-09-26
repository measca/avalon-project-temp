使用方式(我使用的是淘宝的cnpm,并不是npm):
  cnpm install
  cnpm install -g gulp (如果安装过,就不用了)
  cnpm install -g supervisor (如果安装过,就不用了)

npm 执行命令:
 npm run start-dev --启动开发服务器
 npm run build --打包程序
 npm run start-release --运行打包程序
 npm run deploy --上传到FTP(FTP配置,到config/gulpfile.js,自行配置)

VS code Tack命令:
 tack start-dev --启动开发服务器
 tack build --打包程序
 tack start-release --运行打包程序
 tack deploy --上传到FTP(FTP配置,到config/gulpfile.js,自行配置)