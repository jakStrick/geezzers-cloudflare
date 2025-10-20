// Frontend JavaScript
const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:8788/api"
		: "/api";

// Update date ticker
function updateDateTicker() {
	const dateElement = document.getElementById("current-date");
	if (dateElement) {
		const now = new Date();
		const options = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		dateElement.textContent = now.toLocaleDateString("en-US", options);
	}
}

/*async function loadNavbar() {
	alert("Loading Navbar");
	try {
		const response = await fetch("/public/assets/templates/navbar.html");
		const html = await response.text();

		const placeholder = document.getElementById("navbar-placeholder");
		if (placeholder) {
			placeholder.innerHTML = html;
		}
	} catch (error) {
		console.error("Failed to load navbar:", error);
	}
}*/

// Format time ago
function formatTimeAgo(dateString) {
	const now = new Date();
	const date = new Date(dateString);
	const diffMs = now - date;
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffHours < 1) {
		return "just now";
	} else if (diffHours < 24) {
		return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	} else {
		return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
	}
}

// Load comments
async function loadComments(postId, containerElement) {
	try {
		const response = await fetch(`${API_URL}/posts/${postId}/comments`);
		const comments = await response.json();

		const existingCommentsDiv =
			containerElement.querySelector(".existing-comments");
		if (!existingCommentsDiv) return;

		existingCommentsDiv.innerHTML = "";

		if (comments.length === 0) {
			existingCommentsDiv.innerHTML =
				'<p style="color: #666;">No comments yet. Be the first!</p>';
			return;
		}

		comments.forEach((comment) => {
			const commentEl = document.createElement("div");
			commentEl.className = "comment";
			commentEl.innerHTML = `
                <div class="comment-author">
                    ${comment.author_name}
                    <span class="comment-time">${formatTimeAgo(
								comment.created_at
							)}</span>
                </div>
                <p>${comment.content}</p>
                <button class="reply-btn">Reply</button>
            `;
			existingCommentsDiv.appendChild(commentEl);
		});
	} catch (error) {
		console.error("Error loading comments:", error);
	}
}

// Submit comment
async function submitComment(postId, formElement) {
	const nameInput = formElement.querySelector(".comment-name");
	const textInput = formElement.querySelector(".comment-text");

	if (!nameInput.value.trim() || !textInput.value.trim()) {
		alert("Please enter your name and comment");
		return;
	}

	try {
		const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				author_name: nameInput.value.trim(),
				content: textInput.value.trim(),
			}),
		});

		const result = await response.json();

		if (result.message) {
			alert(result.message);
		} else {
			loadComments(postId, formElement.closest(".comments-section"));
		}

		nameInput.value = "";
		textInput.value = "";
	} catch (error) {
		alert("Failed to submit comment. Please try again.");
	}
}

// Initialize comments
function initCommentSections() {
	const articles = document.querySelectorAll(".main-article");

	articles.forEach((article, index) => {
		const commentSection = article.querySelector(".comments-section");
		if (!commentSection) return;

		const postId = index + 1;
		loadComments(postId, commentSection);

		const submitBtn = commentSection.querySelector(".comment-submit");
		const formElement = commentSection.querySelector(".comment-form");

		if (submitBtn && formElement) {
			submitBtn.addEventListener("click", () => {
				submitComment(postId, formElement);
			});
		}
	});
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
	updateDateTicker();
	setInterval(updateDateTicker, 60000);
	loadNavbar();
	initCommentSections();

	console.log("Geezzers Gazzette Cloudflare Edition loaded!");
});
