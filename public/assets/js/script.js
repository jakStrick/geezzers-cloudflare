// functions/api/[[path]].js - WITH DEBUGGING
export async function onRequest(context) {
	const { request, env, params } = context;
	const url = new URL(request.url);

	// Get the path after /api/
	const apiPath = params.path ? params.path.join("/") : "";
	const method = request.method;

	console.log(`API Request: ${method} /api/${apiPath}`);

	// CORS headers
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
	};

	// Handle CORS preflight
	if (method === "OPTIONS") {
		return new Response(null, { headers });
	}

	// Check if DB is available
	if (!env.DB) {
		console.error("Database binding not found!");
		return new Response(
			JSON.stringify({
				error: "Database not configured",
				hint: "Make sure to run: wrangler pages dev ./public --local --d1=geezzers-db",
			}),
			{ status: 500, headers }
		);
	}

	try {
		// Route: GET /api/posts/:id/comments
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "GET") {
			const postId = apiPath.split("/")[1];
			console.log(`Fetching comments for post ${postId}`);

			try {
				// First check if the table exists
				const tableCheck = await env.DB.prepare(
					"SELECT name FROM sqlite_master WHERE type='table' AND name='comments'"
				).first();

				if (!tableCheck) {
					console.error("Comments table does not exist!");
					return new Response(
						JSON.stringify({
							error: "Database not initialized",
							hint: "Run: wrangler d1 execute geezzers-db --local --file=./database-schema.sql",
						}),
						{ status: 500, headers }
					);
				}

				// Now get the comments
				const { results } = await env.DB.prepare(
					`
          SELECT 
            id,
            post_id,
            author_name,
            content,
            status,
            created_at
          FROM comments
          WHERE post_id = ? AND status = 'approved'
          ORDER BY created_at DESC
        `
				)
					.bind(parseInt(postId))
					.all();

				console.log(`Found ${results ? results.length : 0} comments`);
				return new Response(JSON.stringify(results || []), { headers });
			} catch (dbError) {
				console.error("Database query error:", dbError);
				return new Response(
					JSON.stringify({
						error: "Database query failed",
						details: dbError.message,
						query: "SELECT from comments",
						postId: postId,
					}),
					{ status: 500, headers }
				);
			}
		}

		// Route: POST /api/posts/:id/comments
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "POST") {
			const postId = apiPath.split("/")[1];
			const body = await request.json();
			const { author_name, content } = body;

			console.log(`Adding comment to post ${postId}`);

			if (!author_name || !content) {
				return new Response(
					JSON.stringify({ error: "Name and comment are required" }),
					{ status: 400, headers }
				);
			}

			try {
				// Check for spam
				const isSpam =
					/viagra|casino|lottery/i.test(content) || content.length > 2000;
				const status = isSpam ? "pending" : "approved";

				// Insert the comment
				const result = await env.DB.prepare(
					`
          INSERT INTO comments (post_id, author_name, content, status, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `
				)
					.bind(
						parseInt(postId),
						author_name.substring(0, 100),
						content.substring(0, 2000),
						status
					)
					.run();

				console.log("Comment inserted, ID:", result.meta.last_row_id);

				// Get the inserted comment
				const newComment = await env.DB.prepare(
					`
          SELECT * FROM comments WHERE id = ?
        `
				)
					.bind(result.meta.last_row_id)
					.first();

				if (status === "pending") {
					return new Response(
						JSON.stringify({
							message: "Your comment has been submitted for moderation.",
							comment: newComment,
						}),
						{ headers }
					);
				}

				return new Response(JSON.stringify(newComment), { headers });
			} catch (dbError) {
				console.error("Insert error:", dbError);
				return new Response(
					JSON.stringify({
						error: "Failed to add comment",
						details: dbError.message,
					}),
					{ status: 500, headers }
				);
			}
		}

		// Route: GET /api/posts - Get all posts
		if (apiPath === "posts" && method === "GET") {
			console.log("Fetching all posts");

			try {
				const { results } = await env.DB.prepare(
					`
          SELECT 
            p.*,
            u.username as author_name
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          WHERE p.status = 'published'
          ORDER BY p.published_at DESC
        `
				).all();

				console.log(`Found ${results ? results.length : 0} posts`);
				return new Response(JSON.stringify(results || []), { headers });
			} catch (dbError) {
				console.error("Posts query error:", dbError);
				return new Response(
					JSON.stringify({
						error: "Failed to fetch posts",
						details: dbError.message,
					}),
					{ status: 500, headers }
				);
			}
		}

		// Route: GET /api/test - Test database connection
		if (apiPath === "test" && method === "GET") {
			try {
				// Test database connection
				const tables = await env.DB.prepare(
					"SELECT name FROM sqlite_master WHERE type='table'"
				).all();

				return new Response(
					JSON.stringify({
						status: "Database connected",
						tables: tables.results.map((t) => t.name),
					}),
					{ headers }
				);
			} catch (error) {
				return new Response(
					JSON.stringify({
						status: "Database error",
						error: error.message,
					}),
					{ status: 500, headers }
				);
			}
		}

		// 404 for unknown routes
		return new Response(
			JSON.stringify({
				error: "API endpoint not found",
				path: apiPath,
				method: method,
				availableRoutes: [
					"GET /api/test",
					"GET /api/posts",
					"GET /api/posts/:id/comments",
					"POST /api/posts/:id/comments",
				],
			}),
			{ status: 404, headers }
		);
	} catch (error) {
		console.error("Unexpected error:", error);
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
