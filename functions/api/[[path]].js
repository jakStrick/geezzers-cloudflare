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
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
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

	// Authentication helper function
	function checkAuth(request, env) {
		const authHeader = request.headers.get("Authorization");

		if (!authHeader || !authHeader.startsWith("Basic ")) {
			return false;
		}

		try {
			const base64Credentials = authHeader.split(" ")[1];
			const credentials = atob(base64Credentials);
			const [username, password] = credentials.split(":");

			// Get admin credentials from environment variables (required)
			const adminUser = env.ADMIN_USERNAME;
			const adminPass = env.ADMIN_PASSWORD;

			// Ensure environment variables are set
			if (!adminUser || !adminPass) {
				console.error(
					"ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set"
				);
				return false;
			}

			return username === adminUser && password === adminPass;
		} catch (error) {
			return false;
		}
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

			// Enhanced spam detection
			const spamKeywords =
				/viagra|casino|lottery|crypto|bitcoin|investment|loan|mortgage|debt|weight.loss|male.enhancement|dating|singles|pharmacy|pills/i;
			const suspiciousPatterns = /http[s]?:\/\/|www\.|\.com|\.org|\.net/i;
			const excessiveUppercase =
				content.length > 20 &&
				(content.match(/[A-Z]/g) || []).length / content.length > 0.5;
			const tooLong = content.length > 2000;
			const tooShort = content.length < 10;

			const isSpam =
				spamKeywords.test(content) ||
				suspiciousPatterns.test(content) ||
				excessiveUppercase ||
				tooLong ||
				tooShort;

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

		// === ROUTE: /api/admin/comments (GET) - Get all comments for moderation ===
		if (apiPath === "admin/comments" && method === "GET") {
			console.log("Matched GET /api/admin/comments");

			// Check authentication
			if (!checkAuth(request, env)) {
				return new Response(
					JSON.stringify({ error: "Authentication required" }),
					{
						status: 401,
						headers,
					}
				);
			}

			const { results } = await env.DB.prepare(
				`
        SELECT 
          c.*,
          p.title as post_title
        FROM comments c
        LEFT JOIN posts p ON c.post_id = p.id
        ORDER BY c.created_at DESC
      `
			).all();

			return new Response(JSON.stringify(results || []), { headers });
		}

		// === ROUTE: /api/admin/comments/:id (PATCH) - Update comment status ===
		if (apiPath.match(/^admin\/comments\/\d+$/) && method === "PATCH") {
			const commentId = apiPath.split("/")[2];
			console.log(`Matched PATCH /api/admin/comments/${commentId}`);

			// Check authentication
			if (!checkAuth(request, env)) {
				return new Response(
					JSON.stringify({ error: "Authentication required" }),
					{
						status: 401,
						headers,
					}
				);
			}

			const body = await request.json();
			const { status } = body;

			if (!["approved", "rejected", "pending"].includes(status)) {
				return new Response(JSON.stringify({ error: "Invalid status" }), {
					status: 400,
					headers,
				});
			}

			await env.DB.prepare(`UPDATE comments SET status = ? WHERE id = ?`)
				.bind(status, parseInt(commentId))
				.run();

			return new Response(JSON.stringify({ success: true, status }), {
				headers,
			});
		}

		// === ROUTE: /api/admin/comments/:id (DELETE) - Delete comment ===
		if (apiPath.match(/^admin\/comments\/\d+$/) && method === "DELETE") {
			const commentId = apiPath.split("/")[2];
			console.log(`Matched DELETE /api/admin/comments/${commentId}`);

			// Check authentication
			if (!checkAuth(request, env)) {
				return new Response(
					JSON.stringify({ error: "Authentication required" }),
					{
						status: 401,
						headers,
					}
				);
			}

			await env.DB.prepare(`DELETE FROM comments WHERE id = ?`)
				.bind(parseInt(commentId))
				.run();

			return new Response(JSON.stringify({ success: true }), { headers });
		}

		// === ROUTE: /api/admin/stats (GET) - Get moderation statistics ===
		if (apiPath === "admin/stats" && method === "GET") {
			console.log("Matched GET /api/admin/stats");

			// Check authentication
			if (!checkAuth(request, env)) {
				return new Response(
					JSON.stringify({ error: "Authentication required" }),
					{
						status: 401,
						headers,
					}
				);
			}

			const stats = await env.DB.prepare(
				`
        SELECT 
          status,
          COUNT(*) as count
        FROM comments 
        GROUP BY status
      `
			).all();

			const totalComments = await env.DB.prepare(
				`SELECT COUNT(*) as total FROM comments`
			).first();

			return new Response(
				JSON.stringify({
					statusCounts: stats.results || [],
					total: totalComments.total || 0,
				}),
				{ headers }
			);
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
				availableAdminRoutes: [
					"GET /api/admin/comments",
					"PATCH /api/admin/comments/:id",
					"DELETE /api/admin/comments/:id",
					"GET /api/admin/stats",
				],
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
