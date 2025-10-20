// API Handler for all /api/* routes
export async function onRequest(context) {
	const { request, env, params } = context;
	const url = new URL(request.url);
	const apiPath = params.path ? params.path.join("/") : "";
	const method = request.method;

	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
	};

	if (method === "OPTIONS") {
		return new Response(null, { headers });
	}

	try {
		// GET /api/posts - Get all posts
		if (apiPath === "posts" && method === "GET") {
			const { results } = await env.DB.prepare(
				`
        SELECT p.*, u.username as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.status = 'published'
        ORDER BY p.published_at DESC
      `
			).all();
			return new Response(JSON.stringify(results || []), { headers });
		}

		// GET /api/posts/:id/comments - Get comments
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "GET") {
			const postId = apiPath.split("/")[1];
			const { results } = await env.DB.prepare(
				`
        SELECT * FROM comments
        WHERE post_id = ? AND status = 'approved'
        ORDER BY created_at DESC
      `
			)
				.bind(postId)
				.all();
			return new Response(JSON.stringify(results || []), { headers });
		}

		// POST /api/posts/:id/comments - Add comment
		if (apiPath.match(/^posts\/\d+\/comments$/) && method === "POST") {
			const postId = apiPath.split("/")[1];
			const body = await request.json();
			const { author_name, content } = body;

			if (!author_name || !content) {
				return new Response(
					JSON.stringify({ error: "Name and comment required" }),
					{ status: 400, headers }
				);
			}

			const isSpam = /viagra|casino/i.test(content) || content.length > 2000;
			const status = isSpam ? "pending" : "approved";

			const result = await env.DB.prepare(
				`
        INSERT INTO comments (post_id, author_name, content, status, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        RETURNING *
      `
			)
				.bind(postId, author_name, content, status)
				.first();

			if (status === "pending") {
				return new Response(
					JSON.stringify({
						message: "Your comment has been submitted for moderation.",
						comment: result,
					}),
					{ headers }
				);
			}

			return new Response(JSON.stringify(result), { headers });
		}

		// GET /api/search - Search posts
		if (apiPath === "search" && method === "GET") {
			const query = url.searchParams.get("q");
			if (!query) return new Response(JSON.stringify([]), { headers });

			const searchTerm = `%${query}%`;
			const { results } = await env.DB.prepare(
				`
        SELECT id, title, slug, excerpt, category
        FROM posts
        WHERE status = 'published'
        AND (title LIKE ? OR content LIKE ?)
        ORDER BY published_at DESC
        LIMIT 20
      `
			)
				.bind(searchTerm, searchTerm)
				.all();

			return new Response(JSON.stringify(results || []), { headers });
		}

		// GET /api/admin/comments - Get all comments for moderation
		if (apiPath === "admin/comments" && method === "GET") {
			const { results } = await env.DB.prepare(
				`
        SELECT c.*, p.title as post_title
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        ORDER BY c.created_at DESC
      `
			).all();
			return new Response(JSON.stringify(results || []), { headers });
		}

		// PATCH /api/admin/comments/:id - Update comment status
		if (apiPath.match(/^admin\/comments\/\d+$/) && method === "PATCH") {
			const commentId = apiPath.split("/")[2];
			const body = await request.json();
			const { status } = body;

			const result = await env.DB.prepare(
				`
        UPDATE comments SET status = ? WHERE id = ?
        RETURNING *
      `
			)
				.bind(status, commentId)
				.first();

			return new Response(JSON.stringify(result), { headers });
		}

		// 404 for unknown routes
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
			headers,
		});
	} catch (error) {
		console.error("API Error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers,
		});
	}
}
