# TCG 禁卡表预测

为 Magnificent Maestros 前的 TCG 禁限更新（34 张新禁止 + 8 张新限制）做的预测小站。玩家从近一个月 TCG 上位最常用的 150 张卡里选出自己的 42 张，导出成一张 PNG 图片分享。

卡池外的卡也能选：在搜索框输入卡名，就能从全部 TCG 卡里把任何一张加进自己的预测。

纯静态网站，没有服务器、没有数据库，可以免费放在 GitHub Pages 上，你的电脑不用一直开着。每个人的选择只保存在自己浏览器里（刷新不会丢）。

## 第一步：下载卡图（只需一次）

需要 Node.js 18 或更高版本。在项目文件夹里运行：

```bash
npm run setup
```

它会做三件事，大约一分钟：

- 从 YGOPRODeck 官方 API 下载全部 TCG 卡片列表（一次请求），生成 `allcards.json`。这是"按卡名添加"用的卡片数据库，只含卡名、ID、种类和当前 TCG 禁限状态，大约几百 KB，访客第一次点搜索框时才会加载
- 查出卡池 150 张卡的 ID 和种类，写回 `cards.json`
- 把这 150 张的卡图下载到 `img/`

卡图放在自己仓库里托管，不直接外链 YGOPRODeck（他们的 API 文档要求这样做），导出图片时也不会有跨域问题。

`allcards.json` 里的禁限状态以运行 setup 当天 YGOPRODeck 的数据为准。官方公布新表后可以重新运行一次 `npm run setup` 再推送。

如果有卡名没匹配到，脚本最后会列出来。到 `cards.json` 里改正卡名后再运行一次即可。没匹配到的卡在网页上会显示成文字块，不影响使用。

## 第二步：本地预览（可选）

```bash
npm run preview
```

然后打开终端里显示的地址。**不能直接双击 `index.html`**，浏览器会拦截读取 `cards.json`，页面会提示你改用这个命令。

## 第三步：发布到 GitHub Pages

1. 在 GitHub 新建一个 **Public** 仓库，例如 `ygo-banlist`。免费账号的 Pages 只支持公开仓库。
2. 把整个文件夹的内容推上去，**包括 `img/` 里的卡图、`allcards.json` 和 `.nojekyll` 文件**：

   ```bash
   git init
   git add .
   git commit -m "TCG banlist predictor"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/ygo-banlist.git
   git push -u origin main
   ```

   也可以用 GitHub Desktop。网页上传一次最多 100 个文件，`img/` 里有 150 张图，用网页传的话要分两批。

3. 打开仓库的 **Settings → Pages**，在 Build and deployment 里把 Source 设成 **Deploy from a branch**，Branch 选 **main**、目录选 **/ (root)**，点 Save。
4. 等一两分钟，网站地址是：

   ```
   https://<你的用户名>.github.io/ygo-banlist/
   ```

之后改了任何文件，push 上去 Pages 会自动重新发布。

## 网站功能

- 每份预测最多 34 张禁止、8 张限制；同一张卡只能在其中一边
- 现在已经是限制的卡只能选禁止；准限制的卡可以选限制
- 按卡名搜索、按卡组类型和卡片种类筛选、只看已选
- **添加卡池外的卡**：输入英文卡名（至少 2 个字），从候选里直接点"禁止"或"限制"。现已禁止的卡不能选，现限制的卡只能选禁止，已经在卡池里的卡会标出来。加进来的卡显示在卡池最前面，可以用"我添加的"筛选，点卡片右上角的 × 移除。每人最多加 50 张
- 卡池外的卡没有卡图，网页和导出图片里用按卡片种类上色的文字卡表示（全部 TCG 卡图有一万多张，不适合放进仓库，也不能外链 YGOPRODeck）
- 可以填一个署名，会印在导出图片的标题上
- 导出 1800px 宽的 PNG 长图，手机上可以长按保存
- 中英双语、手机适配、深色模式

## 卡池是怎么来的

数据快照取自 yugiohmeta.com（Duel Links Meta 旗下的 TCG 站），截至 2026-10-14：

- 近一个月 TCG 上位共 515 份卡组，以 2026 年 9 月 21 日新禁限表生效后的比赛为主
- 取占比最高的 9 个卡组类型（合计约 61.7%）：Elfnote、Dark Magician Chaos Ritual、Kewl Tune、Chaos Ritual、Blitzclique、Invoked、Branded、Artmage、Sky Striker
- 汇总这些卡组类型页面上的"常用主卡组 / 额外卡组"列表，按卡组占比和卡在列表中的顺位加权排序，取前 150 张
- 排除了现已禁止的 Kewl Tune Rotary、Dimension Shifter、PSY-Framelord Omega、Protectcode Talker

网页上的"覆盖 X% 上位"是包含该卡的卡组类型合计占比，**不是逐卡投入率**。精确的逐卡投入率在 YGOPRODeck 和 yugiohmeta 上都是动态加载的，无法直接抓取。

想换卡池：编辑 `scripts/build_pool_snapshot.py` 里的卡组占比和卡表，然后运行

```bash
python3 scripts/build_pool_snapshot.py
npm run setup
```

## 文件结构

```
index.html                      页面
style.css                       样式
app.js                          选卡、筛选、导出图片、中英文
cards.json                      150 张卡池
allcards.json                   全部 TCG 卡的精简数据库（npm run setup 生成）
img/                            npm run setup 下载的卡图
.nojekyll                       让 GitHub Pages 原样发布文件
scripts/setup-cards.mjs         下载卡片数据库、补全卡池信息和卡图
scripts/build_pool_snapshot.py  生成卡池
```

---

非官方粉丝项目，与 Konami 无关。卡图与卡片数据来自 YGOPRODeck。
