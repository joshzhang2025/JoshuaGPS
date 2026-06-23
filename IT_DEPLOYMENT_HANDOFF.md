# Joshua GPS Site MVP｜IT 部署交付说明

## 1. 项目性质

这是一个纯静态网页项目。

不需要：

- 后端服务
- 数据库
- 登录系统
- Node build
- npm install

需要：

- 一个可以托管静态文件的 Web Server
- 正确返回 `.html`、`.css`、`.js`、`.json`
- 推荐使用 HTTPS，尤其是需要朗读功能时

## 2. 交付文件清单

请把以下文件完整部署到同一个 Web Root 目录：

```text
index.html
offline.html
sw.js
manifest.json
icon.svg
style.css
script.js
README.md
IT_DEPLOYMENT_HANDOFF.md
server-config/
  nginx-joshua-gps.conf
  web.config
data/
  gps.json
  today.json
  daily-logs.json
  project-notes.json
```

> 注意（PWA / 离线支持）：`sw.js`、`offline.html`、`manifest.json`、`icon.svg`
> 必须与 `index.html` 部署在**同一个 Web Root 根目录**，不能放进子文件夹。
> Service Worker 只能控制与自身同级或更深路径的页面，且本项目全部使用
> `./` 相对路径。若 `sw.js` 不在根目录，离线回退页（offline.html）将失效。

页面入口：

```text
index.html
```

部署说明页入口：

```text
deployment-guide.html
```

主数据文件：

```text
data/gps.json
```

## 3. 功能说明

当前 MVP 包含：

- Home Dashboard
- Today
- Weekly Plan
- P0 / P1 / P2 Priority
- Monthly Schedule
- Daily Log
- Project Note
- Portfolio / Final View
- 中文 / English 切换
- Read current page 朗读
- Daily Log 页面本地更新表单
- Export local records
- Reset local updates

## 4. 数据和更新机制

页面通过浏览器读取：

```javascript
fetch("data/gps.json")
```

因此部署后必须保证：

```text
https://your-domain/path/data/gps.json
```

可以正常访问，并返回合法 JSON。

### 每日内容更新

如需由 IT 或运营人员手动更新当天内容，修改：

```text
data/gps.json
```

重点字段：

```text
today
schedule
portfolio
```

### Joshua 页面内提交 Daily Log

Daily Log 页面里的提交功能使用浏览器：

```text
localStorage
```

这意味着：

- 数据保存在当前浏览器、当前域名下。
- 不会自动写回服务器上的 `data/gps.json`。
- 换电脑、换浏览器、换域名后，看不到之前浏览器本地保存的数据。
- 需要长期归档时，请点击 `Export local records` 下载 JSON 备份。

如果未来需要多人同步或服务器持久保存，需要再增加轻量后端 API。

## 5. 推荐部署方式 A：Nginx

示例目录：

```text
/var/www/joshua-gps
```

把项目文件放入：

```text
/var/www/joshua-gps/index.html
/var/www/joshua-gps/style.css
/var/www/joshua-gps/script.js
/var/www/joshua-gps/data/gps.json
```

Nginx 配置参考：

```text
server-config/nginx-joshua-gps.conf
```

部署后检查：

```bash
nginx -t
systemctl reload nginx
```

访问：

```text
https://your-domain/joshua-gps/
```

或：

```text
https://your-domain/joshua-gps/index.html
```

## 6. 推荐部署方式 B：Windows IIS

示例目录：

```text
C:\inetpub\wwwroot\joshua-gps
```

把项目文件放入该目录。

IIS 需要支持 JSON MIME：

```text
.json -> application/json
```

本项目已提供：

```text
server-config/web.config
```

如果部署到 IIS 子目录，可以把 `web.config` 放在站点根目录或 `joshua-gps` 目录下。

访问：

```text
https://your-domain/joshua-gps/index.html
```

## 7. 临时测试服务

仅用于测试，不建议生产长期使用：

```powershell
cd "部署目录"
python -m http.server 8000
```

访问：

```text
http://127.0.0.1:8000/index.html
```

## 8. 部署后验收清单

请 IT 部署后检查：

- `index.html` 能打开。
- `style.css` 能加载，页面不是纯 HTML。
- `script.js` 能加载，左侧导航能切换。
- `data/gps.json` 能直接访问。
- Dashboard 能正常显示内容。
- 中文 / English 按钮可切换。
- `Read current page` 可朗读或浏览器给出权限/支持提示。
- Daily Log 页面能提交表单。
- 提交后 Today 页面会生成第二天任务。
- 刷新页面后本地提交记录仍保留。
- `Export local records` 能下载 JSON。
- 手机端没有横向滚动，卡片为单列。
- 首次在线打开后开启飞行模式刷新，显示离线回退页（offline.html），不是空白页。
- 使用中断网时弹出 “Connection lost” 提示，恢复网络后自动消失。

## 9. 常见问题

### 页面打开但没有内容

通常是 `data/gps.json` 没有加载成功。检查：

```text
/data/gps.json
```

是否能直接访问。

### JSON 修改后页面报错

检查 `data/gps.json` 是否为合法 JSON。常见错误：

- 少逗号
- 多逗号
- 中文引号
- key 没有双引号

### Daily Log 提交后服务器文件没有变化

这是当前 MVP 的预期行为。Daily Log 提交保存到浏览器 `localStorage`，不会写回服务器。

如需要写回服务器，需要开发后端保存接口。

### 朗读功能不可用

检查浏览器是否支持 Web Speech API。推荐 Chrome 或 Edge。HTTPS 环境下兼容性更好。

## 10. 后续升级建议

推荐从低到高：

1. 保持当前静态部署。
2. 每周导出 `Export local records` 作为备份。
3. IT 增加一个后台脚本，把导出的 records 合并进 `data/daily-logs.json`。
4. 增加轻量 API：`POST /api/daily-log` 写入服务器 JSON。
5. 再考虑数据库、登录、多用户权限。
