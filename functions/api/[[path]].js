// functions/api/[[path]].js - DEBUG VERSION
export async function onRequest(context) {
	const { request, env, params } = context;
	const url = new URL(request.url);
	const method = request.method;

	// DEBUG: Log everything
	console.log("=== API DEBUG ===");
	console.log("URL:", url.toString());
	console.log("Pathname:", url.pathname);
	console.log("Method:", method);
	console.log("Params:", params);
	console.log("Params.path:", params.path);

	// Get the API path - THIS IS THE KEY PART
	let apiPath = "";
	if (params.path) {
		apiPath = Array.isArray(params.path)
			? params.path.join("/")
			: params.path;
	}

	console.log("Parsed apiPath:", apiPath);

	// CORS headers
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
	};

	// Handle OPTIONS
	if (method === "OPTIONS") {
		return new Response(null, { headers });
	}

	// Check database
	if (!env.DB) {
		console.error("No database binding!");
		return new Response(
			JSON.stringify({
				error: "Database not configured",
				env: Object.keys(env),
				hasDB: !!env.DB,
			}),
			{ status: 500, headers }
		);
	}

	try {
		// === ROUTE: /api/test ===
		if (apiPath === "test" && method === "GET") {
			console.log("Matched /api/test route");

			try {
				const tables = await env.DB.prepare(
					"SELECT name FROM sqlite_master WHERE type='table'"
				).all();

				return new Response(
					JSON.stringify({
						status: "OK",
						message: "API is working!",
						tables: tables.results
							? tables.results.map((t) => t.name)
							: [],
						debug: {
							apiPath: apiPath,
							params: params,
							url: url.pathname,
						},
					}),
					{ headers }
				);
			} catch (dbError) {
				return new Response(
					JSON.stringify({
						status: "Database error",
						error: dbError.message,
					}),
					{ status: 500, headers }
				);
			}
		}

		// === ROUTE: /api/posts ===
		if (apiPath === "posts" && method === "GET") {
			console.log("Matched /api/posts route");

			const { results } = await env.DB.prepare(
				`
        SELECT * FROM posts WHERE status = 'published'
        ORDER BY published_at DESC
      `
			).all();

			return new Response(JSON.stringify(results || []), { headers });
		}

		// === ROUTE: /api/posts/:id/comments (GET) ===
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "GET") {
			const postId = apiPath.split("/")[1];
			console.log(`Matched GET /api/posts/${postId}/comments`);

			const { results } = await env.DB.prepare(
				`
        SELECT * FROM comments
        WHERE post_id = ? AND status = 'approved'
        ORDER BY created_at DESC
      `
			)
				.bind(parseInt(postId))
				.all();

			return new Response(JSON.stringify(results || []), { headers });
		}

		// === ROUTE: /api/posts/:id/comments (POST) ===
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "POST") {
			const postId = apiPath.split("/")[1];
			console.log(`Matched POST /api/posts/${postId}/comments`);

			const body = await request.json();
			const { author_name, content } = body;

			if (!author_name || !content) {
				return new Response(
					JSON.stringify({ error: "Name and comment required" }),
					{ status: 400, headers }
				);
			}

			// Check for spam
			const isSpam = /viagra|casino/i.test(content);
			const status = isSpam ? "pending" : "approved";

			// Insert comment
			const result = await env.DB.prepare(
				`
        INSERT INTO comments (post_id, author_name, content, status, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `
			)
				.bind(parseInt(postId), author_name, content, status)
				.run();

			// Get the new comment
			const newComment = await env.DB.prepare(
				`SELECT * FROM comments WHERE id = ?`
			)
				.bind(result.meta.last_row_id)
				.first();

			if (status === "pending") {
				return new Response(
					JSON.stringify({
						message: "Comment submitted for moderation",
						comment: newComment,
					}),
					{ headers }
				);
			}

			return new Response(JSON.stringify(newComment), { headers });
		}

		// === NO ROUTE MATCHED ===
		console.log("No route matched!");
		console.log("Available info:", {
			apiPath: apiPath,
			method: method,
			pathname: url.pathname,
			params: JSON.stringify(params),
		});

		return new Response(
			JSON.stringify({
				error: "Not found",
				debug: {
					apiPath: apiPath,
					method: method,
					pathname: url.pathname,
					params: params,
					hint: "Check console logs for details",
				},
			}),
			{ status: 404, headers }
		);
	} catch (error) {
		console.error("Error:", error);
		return new Response(
			JSON.stringify({
				error: "Internal server error",
				message: error.message,
				stack: error.stack,
			}),
			{ status: 500, headers }
		);
	}
}
