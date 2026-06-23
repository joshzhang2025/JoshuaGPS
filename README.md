# Joshua Dynamic Bilingual GPS Site MVP

这是一个“静态页面 + JSON 数据文件”的动态更新 MVP。页面不需要后端、数据库或登录系统；每天更新内容时，优先修改 `data/gps.json`。

## 文件结构

```text
.
├─ index.html
├─ style.css
├─ script.js
├─ data/
│  ├─ gps.json
│  ├─ today.json
│  ├─ daily-logs.json
│  └─ project-notes.json
└─ README.md
```

当前页面主要读取：

```text
data/gps.json
```

另外三个 JSON 是后续继续拆分动态数据时使用的模板。

## 如何打开网页

因为页面会读取 JSON，请用本地服务打开：

```powershell
cd "C:\Users\e87\Documents\Joshua GPS"
C:\Users\e87\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 8000
```

然后打开：

```text
http://127.0.0.1:8000/index.html
```

如果要查看单独的部署与功能说明页，打开：

```text
http://127.0.0.1:8000/deployment-guide.html
```

## 如何修改内容

打开：

```text
data/gps.json
```

常用区域：

```text
today
weeks
priorities
schedule
logTemplate
projectTemplate
portfolio
```

## 如何修改今日任务

在 `data/gps.json` 里搜索：

```text
"today"
```

每天主要改：

```text
today.day
today.status
today.en.focus
today.en.tasks
today.en.deliverables
today.en.resources
today.en.check
today.zh.focus
today.zh.tasks
today.zh.deliverables
today.zh.resources
today.zh.check
```

## 如何修改双语文本

每个主要内容都有 `en` 和 `zh` 两套字段。修改英文时，也同步修改中文，语言切换才完整。

示例：

```json
"en": {
  "focus": "Open and use the Joshua GPS Site."
},
"zh": {
  "focus": "打开并使用 Joshua GPS Site。"
}
```

## 如何更新 Daily Log

现在 Daily Log 页面已经有一个轻量更新表单。Joshua 每天下班前可以直接在页面里填写：

```text
Date
Day
Today’s Focus
What I learned
What I built
What AI helped with
What I found difficult
Questions
Tomorrow’s next step
```

点击：

```text
Submit and prepare tomorrow
```

页面会自动做三件事：

1. 备份当前 Today 卡。
2. 保存当天 Daily Log 到当前浏览器。
3. 根据 `Tomorrow’s next step`、困难和问题，生成第二天的 Today 卡。

刷新页面后，这些更新仍会保留在同一个浏览器里。

注意：这一版是浏览器本地保存，数据存在 Chrome / Edge 的 localStorage 里，不会自动写回 `data/gps.json`。

如果要把本地记录保存成文件，点击：

```text
Export local records
```

它会下载一份 JSON 备份。

如果要恢复到 `data/gps.json` 的原始内容，点击：

```text
Reset local updates
```

### 手动维护 Daily Log JSON

如果后续要做长期文件归档，可以把导出的记录整理追加到：

```text
data/daily-logs.json
```

建议每天新增一条：

```text
date
day
focus
learned
built
aiHelpedWith
difficulty
questions
nextStep
```

## 如何更新 Project Note

项目记录放在：

```text
data/project-notes.json
```

每做一个 Site Demo，就新增一条 Project Note。

## 如何测试手机端

1. 电脑启动本地服务。
2. 手机和电脑连接同一个 Wi-Fi。
3. 查询电脑 IP 地址。
4. 手机打开：

```text
http://电脑IP地址:8000/index.html
```

手机端会自动单列显示卡片，导航会折行。

## 如何使用朗读功能

点击顶部：

```text
Read current page
```

它会朗读当前打开页面的主要内容。切换到中文时，会尝试中文朗读。不同浏览器声音效果不同，推荐 Chrome 或 Edge。

## 后续如何升级为真正动态版本

推荐顺序：

1. 先保留当前浏览器本地保存方式，让 Joshua 低成本使用。
2. 定期用 `Export local records` 导出备份。
3. 让页面同时读取 `gps.json`、`daily-logs.json`、`project-notes.json`。
4. 增加一个本地更新脚本，把导出的 Daily Logs 合并回 JSON 文件。
5. 再考虑 FastAPI / Node 小后端，用来直接保存 JSON。
6. 最后才考虑数据库、登录和多用户权限。
