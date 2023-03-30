<h1 align="center">😶‍🌫️ Antares 安塔尔斯</h1>

## ⚡️ 快速开始

1. 下载本仓库的代码

2. 安装 Cloudflare 的 CLI 工具 Wrangler `npm install -g wrangler`

3. 将 Wrangler 安装后使用 `wrangler login` 登录

4. 在代码的根目录执行 `npm install` 安装必要的依赖

5. 使用 `wrangler publish` 上传到 Cloudflare Workers

6. 创建 Cloudflare KV 缓存桶

   前往 Workers 的 Settings 页面 - 选择 Variables 选项卡 - 下滑至 **KV Namespace Bindings** 并创建：

   **Variable name** 为 `ANTARES_KV` 并选中刚刚创建的 Cloudflare KV 

7. 创建 Cloudflare R2 存储桶

   前往 Workers 的 Settings 页面 - 选择 Variables 选项卡 - 下滑至 **R2 Bucket Bindings** 并创建：

   **Variable name** 为 `ANTARES_R2` 并选中刚刚创建的 Cloudflare R2

8. 创建变量 `ANTARES_UPLOAD_SECRET`、`ANTARES_UPLOAD_URL` 和 `ANTARES_STORAGE_URL`

   前往 Workers 的 Settings 页面 - 选择 Variables 选项卡 - 下滑至 **Environment Variables** 并创建：

   | 变量名                | 描述                       | 示例                                    |
   | --------------------- | -------------------------- | --------------     ---------------------- |
   | ANTARES_UPLOAD_SECRET | 用于校验前端页面的上传权限 | 9f7c87a1-a5a2-3516-   8723-1f683445224e |
   | ANTARES_UPLOAD_URL    | 前端上传文件的目标后端地址 |    https://example.com/upload           |
   | ANTARES_STORAGE_URL   | 存储桶根地址               |    https://s0.example.com               |



## 🍀 关于开源

开源是一种精神。

开源运动所坚持的原则：

1. 坚持开放与共享，鼓励最大化的参与与协作。
2. 尊重作者权益，保证软件程序完整的同时，鼓励修改的自由以及衍生创新。
3. 保持独立性和中立性。

与来自五湖四海的开发者共同**讨论**技术问题，**解决**技术难题，**促进**应用的发展是开源的本质目的。

**众人拾柴火焰高，开源需要依靠大家的努力，请自觉遵守开源协议，弘扬开源精神，共建开源社区！**