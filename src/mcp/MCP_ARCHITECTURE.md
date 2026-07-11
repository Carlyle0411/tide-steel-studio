# MCP ARCHITECTURE

项目：《潮汐钢魂》Movie Control Center  
阶段：MCP Phase 01  
目标：AI Film Operating System 的调度核心

---

# 01 MCP负责什么

Movie Control Center 中的 MCP 层不是展示页面。

它负责把电影制作上下文、资产库、审核规则和外部AI工具连接成可追踪、可审计、可替换的生产系统。

MCP 的职责：

1. 读取项目上下文。
2. 调用不同AI工具。
3. 管理输入输出。
4. 记录生成历史。
5. 绑定资产库。
6. 执行审核流程。
7. 防止未Approved资产进入视频。
8. 支持后续多模型协作。

---

# 02 核心原则

不允许假成功。

如果工具没有API Key，任务必须返回`needs_key`或`failed`，并写入日志。  
如果资产没有Approved，视频任务必须被阻止。  
如果资产没有登记进数据库，Storyboard任务必须被阻止。

MCP 不替导演做决定。  
MCP 负责保证每个决定都有上下文、输入、输出、版本和审核记录。

---

# 03 工作流边界

Reference  
-> Prompt  
-> Task  
-> Adapter  
-> Output  
-> Draft  
-> Review  
-> Approved  
-> Asset Library  
-> Storyboard  
-> Video

任何任务都必须经过统一任务模型。  
任何工具都必须经过 Tool Registry。  
任何生成输出都必须进入 Review 或明确失败。

---

# 04 后续扩展

Phase 01 使用本地内存队列和本地日志。  
未来可以替换为：

- Supabase：任务、资产、审核状态。
- Redis：长任务队列。
- GitHub：版本化生产记录。
- ComfyUI / Blender：本地渲染节点。
- DaVinci Resolve：剪辑与渲染输出。

接口稳定，存储可替换。
