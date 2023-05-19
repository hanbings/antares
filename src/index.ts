export interface Env {
	ANTARES_KV: KVNamespace;
	ANTARES_R2: R2Bucket;
	ANTARES_UPLOAD_SECRET: string;
	// ANTARES_UPLOAD_URL = "https://example.com/upload"
	ANTARES_UPLOAD_URL: string;
	// ANTARES_STORAGE_URL = "https://s0.example.com"
	ANTARES_STORAGE_URL: string;
}

function e4(): string {
	var h = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	var k = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', '-', '4', 'x', 'x', 'x', '-', 'y', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
	var u = '', i = 0, rb = Math.random() * 0xffffffff | 0;
	while (i++ < 36) {
		var c = k[i - 1], r = rb & 0xf, v = c == 'x' ? r : (r & 0x3 | 0x8);
		u += (c == '-' || c == '4') ? c : h[v]; rb = i % 8 == 0 ? Math.random() * 0xffffffff | 0 : rb >> 4;
	}
	return u;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const upload = `<!DOCTYPE html><head><title>Upload</title><link href="https://cdn.jsdelivr.net/npm/daisyui@2.51.5/dist/full.css"rel="stylesheet"type="text/css"/><script src="https://cdn.tailwindcss.com"></script><style type="text/css">*{margin:0;padding:0}.contrainer{display:flex;flex-direction:column;justify-content:center;align-items:center;position:absolute;height:100%;width:100%}.bg{background:url('https://picture.hanbings.com/2021/11/10/b3a7219b3503d.jpg')}.upload-contrainer{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;height:360px;width:420px;border-radius:16px;background-color:white;padding-left:22px;padding-right:22px}</style><script>function upload(){var file=document.getElementById("file");var secret=document.getElementById("secret");var xhr=new XMLHttpRequest();xhr.withCredentials=true;xhr.addEventListener("readystatechange",function(){if(this.readyState===4){file.value="";console.log(this.responseText)}});xhr.open("POST","${env.ANTARES_UPLOAD_URL}");xhr.setRequestHeader('Authorization','Bearer '+secret.value);xhr.send(file.files[0])}</script></head><body><div class="contrainer bg bg-fixed bg-cover bg-center"><div class="contrainer"style="backdrop-filter: blur(8px);"><div class="upload-contrainer drop-shadow-2xl"><input id="file"type="file"class="file-input file-input-bordered file-input-primary w-full max-w-xs"/><input id="secret"type="text"placeholder="上传凭证"class="input input-bordered input-primary w-full max-w-xs"/><button class="btn btn-primary drop-shadow-xl"onclick="upload();">上传图片</button></div></div></div></body>`;
		const notfound = `<!DOCTYPE html><head><title>OwO</title><script src="https://cdn.tailwindcss.com"></script><style type="text/css">*{margin:0;padding:0}.contrainer{display:flex;flex-direction:column;justify-content:center;align-items:center;position:absolute;height:100%;width:100%}</style></head><body><div class="contrainer"><h1 class="text-3xl font-bold">OwO 没找到欸！</h1></div></body>`


		let url = new URL(request.url);

		if (request.method === 'GET') {
			// 上传页面
			if (url.pathname === '/upload') {
				let res = new Response(upload);

				res.headers.set('Content-Type', 'text/html; charset=utf-8');
				res.headers.set('Access-Control-Allow-Origin', '*');
				res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

				return res;
			}

			// 解析主路由 随机选取一张图片
			if (url.pathname === '/') {
				let config: Config = (await env.ANTARES_KV.get("config", { type: "json" })) as Config;
				let image: Image = (await env.ANTARES_KV.get(Math.floor(Math.random() * config.total) + "", { type: "json" })) as Image;

				return Response.redirect(`${env.ANTARES_STORAGE_URL}/${image.file}`, 302);
			}
		}

		if (request.method === 'POST') {
			if (url.pathname === '/upload') {
				if (request.headers.get('Authorization') !== `Bearer ${env.ANTARES_UPLOAD_SECRET}`) {
					return new Response(JSON.stringify({ error: 'request authorization.' }));
				}

				// 生成一个 UUID 作为文件名
				let uuid = e4();
				let config = (await env.ANTARES_KV.get("config", { type: "json" })) as Config;

				// 如果没有图片数量总数记录则创建
				if (config === undefined || config === null) {
					await env.ANTARES_KV.put("config", JSON.stringify(new Config(0)));
					config = (await env.ANTARES_KV.get("config", { type: "json" })) as Config;
				}

				// 生成图片记录
				let image = new Image(config.total, `${uuid}.${request.headers.get('Content-Type')?.split('/').pop()}`);

				// 上传到 R2 存储桶
				await env.ANTARES_R2.put(`${uuid}.${request.headers.get('Content-Type')?.split('/').pop()}`, request.body);

				// 上传到 KV 缓存桶
				await env.ANTARES_KV.put(`${config.total}`, JSON.stringify(image));

				// 多加一张图片
				config.total = config.total + 1;

				// 更新统计的总数
				await env.ANTARES_KV.put("config", JSON.stringify(config));

				return new Response(JSON.stringify(image));
			}
		}

		// other error
		return new Response(notfound);
	}
};

class Image {
	constructor(
		public entry: number,
		public file: string
	) { }
}

class Config {
	constructor(
		public total: number
	) { }
}