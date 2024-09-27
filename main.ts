Deno.serve(async (req: Request) => {
	if (req.method !== "GET") {
		return new Response(null, {
			status: 500,
			statusText: "Invalid HTTP method ",
		});
	}

	if (req.headers.get("upgrade") === "websocket") {
		const { socket, response } = Deno.upgradeWebSocket(req);
		socket.onopen = async () => {
			const watcher = Deno.watchFs("index.html");
			for await (const event of watcher) {
				if (event.kind === "modify") {
					console.log("server: restarting...");
					watcher.close();
					socket.send("reload");
					console.log("server: Restarted ✅");
				}
			}
		};
		return response;
	}

	const url = new URL(req.url);
	const headers = new Headers();
	let content: Uint8Array | undefined;
	try {
		if (url.pathname === "/") {
			headers.append("content-type", "text/html");
			content = await Deno.readFile("index.html");
		} else {
			content = await Deno.readFile(url.pathname.slice(1));
		}
	} catch (err) {
		if (err.name === "NotFound") {
			return new Response("Not Found", { status: 404 });
		}
	}
	return new Response(content, { headers });
});
