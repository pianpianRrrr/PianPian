/* ============================================================
   "片片公子" 个人博客 — 文章数据
   所有文章元信息和内容集中管理
   ============================================================ */

var BlogData = {};

BlogData.articles = [
  {
    id: 'mc-server',
    title: '从零搭建我的世界服务器',
    date: '2025-03-15',
    tags: ['开发', '游戏'],
    readTime: '约 8 分钟',
    excerpt: '记录从购买 VPS 到配置插件、优化性能的完整过程。包括 Java 环境配置、server.properties 调优、常用插件推荐以及日常运维经验分享。',
    url: 'article-detail.html?id=mc-server'
  }
  /*
  ,
  {
    id: 'js-async',
    title: 'JavaScript 异步编程：从回调到 async/await',
    date: '2025-04-22',
    tags: ['开发', '笔记'],
    readTime: '约 12 分钟',
    excerpt: '深入理解 JS 异步编程的演进历程。从回调地狱到 Promise，再到 Generator 和 async/await，结合实例讲解每个阶段的原理与最佳实践。',
    url: 'article-detail.html?id=js-async'
  },
  {
    id: 'learning-path',
    title: '我的前端学习之路',
    date: '2025-05-08',
    tags: ['感悟', '笔记'],
    readTime: '约 6 分钟',
    excerpt: '从 HTML/CSS 入门到接触 React、Vue 等现代框架，分享这一路上的学习资源和踩坑经历，希望能帮助同样在路上的朋友。',
    url: 'article-detail.html?id=learning-path'
  },
  {
    id: 'git-workflow',
    title: 'Git 团队协作工作流实践',
    date: '2025-05-30',
    tags: ['开发', '笔记'],
    readTime: '约 10 分钟',
    excerpt: '总结 Git Flow、GitHub Flow 和 Trunk-Based Development 的优劣，以及在实际项目中如何选择合适的分支策略，附常见冲突解决技巧。',
    url: 'article-detail.html?id=git-workflow'
  }
  */
];

BlogData.contents = {
  'mc-server': {
    title: '从零搭建我的世界服务器',
    date: '2025-03-15',
    tags: ['开发', '游戏'],
    author: '片片公子',
    readTime: '约 8 分钟',
    content: '\n        <p>最近和朋友们想一起玩 Minecraft，但使用第三方服务延迟太高，于是决定自己在 VPS 上搭建一台服务器。本文记录整个搭建过程，希望对有同样需求的朋友有所帮助。</p>\n\n        <h2>选择服务器</h2>\n        <p>我选择的是 2核4G 的轻量云服务器，系统选 Ubuntu 22.04 LTS。对于 5-10 人同时在线，这个配置足够了。如果预算有限，也可以选择 1核2G 的配置，但需要做一些性能优化。</p>\n        <p>服务器带宽建议至少 5Mbps，否则玩家会有明显的卡顿感。地理位置选择离小伙伴们最近的机房。</p>\n\n        <h2>安装 Java 环境</h2>\n        <p>Minecraft 服务端需要 Java 运行环境。推荐使用 Java 17 或更高版本：</p>\n        <pre><code>sudo apt update\nsudo apt install openjdk-17-jdk -y\njava -version</code></pre>\n        <p>验证安装成功后，Java 环境就准备好了。</p>\n\n        <h2>下载服务端</h2>\n        <p>我选择的是 PaperMC，它是一个高性能的 Minecraft 服务端，兼容 Bukkit/Spigot 插件：</p>\n        <pre><code>mkdir minecraft && cd minecraft\nwget https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/latest/downloads/paper-1.20.4-latest.jar\nmv paper-*.jar server.jar</code></pre>\n\n        <h2>配置 server.properties</h2>\n        <p>这是服务器最核心的配置文件，几个关键参数：</p>\n        <ul>\n          <li><code>server-port=25565</code> — 默认端口，记得在防火墙开放</li>\n          <li><code>max-players=20</code> — 最大玩家数</li>\n          <li><code>view-distance=10</code> — 视距，配置低可以调小</li>\n          <li><code>difficulty=normal</code> — 游戏难度</li>\n          <li><code>online-mode=true</code> — 正版验证，建议开启</li>\n        </ul>\n\n        <h2>启动与运维</h2>\n        <p>使用 screen 或 tmux 让服务器在后台持续运行：</p>\n        <pre><code>screen -S mc\njava -Xmx3G -Xms1G -jar server.jar nogui</code></pre>\n        <p>按 Ctrl+A+D 可以断开 screen 会话，服务器继续运行。需要回到控制台时输入 <code>screen -r mc</code>。</p>\n        <p>建议配合 <code>crontab</code> 定时备份地图数据，避免意外丢失进度。</p>\n\n        <h2>推荐插件</h2>\n        <p>以下是我目前在用的插件，都经过了实际测试：</p>\n        <ul>\n          <li><strong>LuckPerms</strong> — 权限管理，必备</li>\n          <li><strong>EssentialsX</strong> — 基础指令增强（/home, /spawn 等）</li>\n          <li><strong>CoreProtect</strong> — 方块变动日志，防熊孩子</li>\n          <li><strong>Dynmap</strong> — 网页实时地图，非常酷</li>\n        </ul>\n        <p>到此服务器就搭建完成了！整个过程大约需要 30 分钟。如果遇到问题，欢迎在评论区交流~</p>\n      '
  },
  /*
  'js-async': {
    title: 'JavaScript 异步编程：从回调到 async/await',
    date: '2025-04-22',
    tags: ['开发', '笔记'],
    author: '片片公子',
    readTime: '约 12 分钟',
    content: '\n        <p>异步编程是 JavaScript 的核心特性之一。从最早的回调函数到现代的 async/await，JS 的异步处理方式经历了巨大的演进。本文带你系统回顾这段历史。</p>\n\n        <h2>回调函数时代</h2>\n        <p>在 Promise 出现之前，所有的异步操作都依赖回调函数：</p>\n        <pre><code>fs.readFile(\'data.json\', \'utf8\', (err, data) => {\n  if (err) { console.error(err); return; }\n  const parsed = JSON.parse(data);\n  fs.writeFile(\'output.json\', JSON.stringify(parsed), (err) => {\n    if (err) { console.error(err); return; }\n    console.log(\'完成！\');\n  });\n});</code></pre>\n        <p>当异步操作增多，回调层层嵌套，就形成了臭名昭著的「回调地狱」。代码可读性极差，错误处理也非常繁琐。</p>\n\n        <h2>Promise 的救赎</h2>\n        <p>ES6 引入的 Promise 从根本上改变了异步编程的体验：</p>\n        <pre><code>fetch(\'/api/user\')\n  .then(res => res.json())\n  .then(user => fetch(`/api/posts/${user.id}`))\n  .then(res => res.json())\n  .then(posts => console.log(posts))\n  .catch(err => console.error(\'请求失败:\', err));</code></pre>\n        <p>Promise 通过链式调用解决了回调嵌套，<code>.catch()</code> 能统一捕获链上任意位置的错误。但它仍然没有让异步代码看起来像同步代码。</p>\n\n        <h2>async/await — 语法糖的革命</h2>\n        <p>ES2017 的 async/await 让我们可以用同步的写法写异步代码：</p>\n        <pre><code>async function getUserPosts() {\n  try {\n    const userRes = await fetch(\'/api/user\');\n    const user = await userRes.json();\n    const postsRes = await fetch(`/api/posts/${user.id}`);\n    const posts = await postsRes.json();\n    return posts;\n  } catch (err) {\n    console.error(\'请求失败:\', err);\n  }\n}</code></pre>\n        <p>async 函数始终返回一个 Promise，await 只能在 async 函数内部使用。这种模式让错误处理回归了熟悉的 try/catch 语法。</p>\n\n        <h2>常见陷阱</h2>\n        <ul>\n          <li><strong>串行等待</strong>：多个不相关的请求应该用 <code>Promise.all</code> 并行执行，而不是逐个 await</li>\n          <li><strong>forEach 陷阱</strong>：<code>forEach</code> 不支持 async/await，应使用 <code>for...of</code> 或 <code>Promise.all + map</code></li>\n          <li><strong>顶层 await</strong>：ES2022 支持在模块顶层使用 await，但仅限于 ESM</li>\n        </ul>\n        <p>理解这些演进历程，不仅能写出更好的异步代码，还能更好地理解各种库和框架的设计思想。</p>\n      '
  },
  'learning-path': {
    title: '我的前端学习之路',
    date: '2025-05-08',
    tags: ['感悟', '笔记'],
    author: '片片公子',
    readTime: '约 6 分钟',
    content: '\n        <p>从大一开始接触前端到现在，已经过去两年多了。这篇文章算是给自己的一个阶段性总结，也希望能给初学前端的同学一些参考。</p>\n\n        <h2>入门：HTML + CSS</h2>\n        <p>最开始是在 B 站看视频教程，跟着敲了几个静态页面。印象最深的是用纯 CSS 画了一只皮卡丘——虽然现在看来很粗糙，但那时候真的很有成就感。</p>\n        <p>这个阶段最重要的是<strong>建立信心</strong>。不用纠结记不住所有标签和属性，多用就会慢慢记住。</p>\n\n        <h2>进阶：JavaScript</h2>\n        <p>学完 HTML/CSS 后，发现只会写静态页面根本不够。于是开始啃 JavaScript——这才是真正的编程语言。</p>\n        <p>DOM 操作、事件处理、闭包、原型链……一开始确实很吃力。我的方法是：<strong>每个知识点都写一个小 demo</strong>，不只看教程，更要动手敲代码。</p>\n\n        <h2>工程化：框架与工具</h2>\n        <p>接触 React 后，才真正理解了组件化开发的思想。配合 Webpack、ESLint、Prettier 这些工具，整个开发体验完全不同了。</p>\n        <p>后来又学了 Vue 和一点点 Node.js。虽然不是每个框架都精通，但<strong>理解不同的设计理念</strong>本身就是很宝贵的收获。</p>\n\n        <h2>一些建议</h2>\n        <ul>\n          <li>不要追求「看完教程」，要追求「能做出东西」</li>\n          <li>尽早开始做个人项目，哪怕是简单的 Todo App</li>\n          <li>善用 MDN 文档，比百度搜索靠谱得多</li>\n          <li>加入技术社区，看别人的代码也是学习</li>\n          <li>保持好奇心，技术更新很快，但基础原理变化不大</li>\n        </ul>\n        <p>前端的路还很长，继续加油 💪</p>\n      '
  },
  'git-workflow': {
    title: 'Git 团队协作工作流实践',
    date: '2025-05-30',
    tags: ['开发', '笔记'],
    author: '片片公子',
    readTime: '约 10 分钟',
    content: '\n        <p>Git 是现代软件开发中不可或缺的版本控制工具。但在团队协作中，仅会 commit/push/pull 是不够的，选择合适的工作流同样重要。</p>\n\n        <h2>Git Flow — 经典的分支模型</h2>\n        <p>Git Flow 定义了严格的分支角色：</p>\n        <ul>\n          <li><strong>main</strong> — 生产环境代码</li>\n          <li><strong>develop</strong> — 开发主干，所有 feature 分支合并到这里</li>\n          <li><strong>feature/*</strong> — 功能分支，从 develop 分出，完成后合并回去</li>\n          <li><strong>release/*</strong> — 发布分支，从 develop 分出，测试后合并到 main 和 develop</li>\n          <li><strong>hotfix/*</strong> — 紧急修复，从 main 分出，修复后合并回 main 和 develop</li>\n        </ul>\n        <p>Git Flow 适合<strong>有明确发布周期</strong>的项目，流程严谨但相对复杂。</p>\n\n        <h2>GitHub Flow — 简单即美</h2>\n        <p>相比 Git Flow，GitHub Flow 简单得多：</p>\n        <ol>\n          <li>从 main 创建 feature 分支</li>\n          <li>在 feature 分支上开发和提交</li>\n          <li>发起 Pull Request，团队 review</li>\n          <li>合并到 main 并立即部署</li>\n        </ol>\n        <p>适合<strong>持续部署</strong>的项目，流程简单，但要求完善的自动化测试和 CI/CD。</p>\n\n        <h2>Trunk-Based Development</h2>\n        <p>所有开发者直接在同一个分支（trunk/main）上工作，功能通过 Feature Flag 控制。分支生命周期很短（通常不超过一天），强调频繁的小批量提交。</p>\n        <p>Google 和 Facebook 等大厂采用这种模式，但需要非常成熟的测试基础设施。</p>\n\n        <h2>实战建议</h2>\n        <p>对于多数小团队，我推荐 <strong>简化版的 GitHub Flow</strong>：</p>\n        <ul>\n          <li>main 分支始终可部署</li>\n          <li>功能分支命名规范：<code>feat/描述</code>、<code>fix/描述</code></li>\n          <li>提交信息遵循 Conventional Commits 规范</li>\n          <li>合并前必须通过 CI 检查</li>\n          <li>使用 Squash Merge 保持 main 分支历史清爽</li>\n        </ul>\n        <p>选择工作流的关键是<strong>匹配团队的规模和交付节奏</strong>，没有银弹。</p>\n      '
  }
  */
};
