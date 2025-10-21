// public/assets/js/script.js - FIXED VERSION
// Frontend JavaScript for Geezzers Gazzette

// API Configuration
const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:8788/api"
		: "/api";

// ============ TEMPLATE LOADING ============

// Load navbar component
async function loadNavbar() {
	const placeholder = document.getElementById("navbar-placeholder");
	if (placeholder) {
		try {
			const response = await fetch("/assets/templates/navbar.html");
			if (response.ok) {
				const html = await response.text();
				placeholder.innerHTML = html;
				console.log("✅ Navbar loaded");
				initNavbarEvents();
			} else {
				console.error("Failed to load navbar:", response.status);
			}
		} catch (error) {
			console.error("Error loading navbar:", error);
		}
	}
}

// Load hero component
async function loadHero() {
	const placeholder = document.getElementById("hero-placeholder");
	if (placeholder) {
		try {
			const response = await fetch("/assets/templates/hero.html");
			if (response.ok) {
				const html = await response.text();
				placeholder.innerHTML = html;
				console.log("✅ Hero loaded");
			}
		} catch (error) {
			console.error("Error loading hero:", error);
		}
	}
}

// Load blog posts
async function loadBlogPost(filename, targetId) {
	const placeholder = document.getElementById(targetId);
	if (placeholder) {
		try {
			const response = await fetch(`/assets/blogs/${filename}`);
			if (response.ok) {
				const html = await response.text();
				placeholder.innerHTML = html;
				console.log(`✅ Blog loaded: ${filename}`);
			}
		} catch (error) {
			console.error(`Error loading blog ${filename}:`, error);
		}
	}
}

// ============ NAVBAR FUNCTIONS ============

function initNavbarEvents() {
	// Mobile menu toggle
	const mobileToggle = document.querySelector(".navbar-toggle");
	const navMenu = document.querySelector(".navbar-menu");

	if (mobileToggle && navMenu) {
		mobileToggle.addEventListener("click", () => {
			navMenu.classList.toggle("active");
		});
	}

	// Dropdown menus
	const dropdowns = document.querySelectorAll(".navbar-dropdown");
	dropdowns.forEach((dropdown) => {
		dropdown.addEventListener("click", (e) => {
			e.currentTarget.classList.toggle("open");
		});
	});
}

// ============ DATE TICKER ============

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

// ============ COMMENT SYSTEM ============

// Format relative time
function formatTimeAgo(dateString) {
	const now = new Date();
	const date = new Date(dateString);
	const diffMs = now - date;
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) {
		return "just now";
	} else if (diffMins < 60) {
		return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
	} else if (diffHours < 24) {
		return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	} else if (diffDays < 30) {
		return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
	} else {
		return date.toLocaleDateString();
	}
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// Load comments for a post
async function loadComments(postId, containerElement) {
	try {
		const response = await fetch(`${API_URL}/posts/${postId}/comments`);

		if (!response.ok) {
			console.error("Failed to load comments:", response.status);
			return;
		}

		const comments = await response.json();

		const existingCommentsDiv =
			containerElement.querySelector(".existing-comments");
		if (!existingCommentsDiv) return;

		existingCommentsDiv.innerHTML = "";

		if (comments.length === 0) {
			existingCommentsDiv.innerHTML =
				'<p style="color: #666; font-style: italic;">No comments yet. Be the first to share your thoughts!</p>';
			return;
		}

		comments.forEach((comment) => {
			const commentEl = createCommentElement(comment);
			existingCommentsDiv.appendChild(commentEl);
		});
	} catch (error) {
		console.error("Error loading comments:", error);
	}
}

// Create comment element
function createCommentElement(comment) {
	const div = document.createElement("div");
	div.className = "comment";
	div.innerHTML = `
        <div class="comment-author">
            ${escapeHtml(comment.author_name)}
            <span class="comment-time">${formatTimeAgo(
					comment.created_at
				)}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
        <button class="reply-btn">Reply</button>
    `;

	const replyBtn = div.querySelector(".reply-btn");
	replyBtn.addEventListener("click", () => {
		alert("Reply feature coming soon!");
	});

	return div;
}

// Submit a comment
async function submitComment(postId, formElement) {
	const nameInput = formElement.querySelector(".comment-name");
	const textInput = formElement.querySelector(".comment-text");
	const submitBtn = formElement.querySelector(".comment-submit");

	const name = nameInput.value.trim();
	const text = textInput.value.trim();

	if (!name || !text) {
		alert("Please enter both your name and comment!");
		return;
	}

	if (text.length > 2000) {
		alert("Comment is too long! Keep it under 2000 characters.");
		return;
	}

	// Disable button to prevent double-posting
	submitBtn.disabled = true;
	submitBtn.textContent = "Posting...";

	try {
		const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				author_name: name,
				content: text,
			}),
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}

		const result = await response.json();

		if (result.message) {
			// Comment pending moderation
			alert(result.message);
		} else {
			// Comment approved - reload comments to show it
			await loadComments(postId, formElement.closest(".comments-section"));

			// Show success
			const msgDiv = document.createElement("div");
			msgDiv.style.cssText =
				"background: #d4edda; color: #155724; padding: 10px; margin: 10px 0; border-radius: 4px;";
			msgDiv.textContent = "Comment posted successfully!";
			formElement.parentNode.insertBefore(msgDiv, formElement);
			setTimeout(() => msgDiv.remove(), 3000);
		}

		// Clear form
		nameInput.value = "";
		textInput.value = "";
	} catch (error) {
		console.error("Error submitting comment:", error);
		alert("Failed to submit comment. Please try again!");
	} finally {
		// Re-enable button
		submitBtn.disabled = false;
		submitBtn.textContent = "Post Comment";
	}
}

// Initialize all comment sections
function initCommentSections() {
	console.log("Initializing comment sections...");

	// Find all comment sections
	const commentSections = document.querySelectorAll(".comments-section");

	if (commentSections.length === 0) {
		console.log("No comment sections found");
		return;
	}

	commentSections.forEach((section, index) => {
		// Determine post ID
		// You can set data-post-id on each section, or use index + 1
		const postId = section.dataset.postId || index + 1;

		console.log(`Setting up comments for post ${postId}`);

		// Load existing comments
		loadComments(postId, section);

		// Setup form submission
		const formElement = section.querySelector(".comment-form");
		const submitBtn = section.querySelector(".comment-submit");
		const textArea = section.querySelector(".comment-text");

		if (submitBtn && formElement) {
			// Remove any existing listeners
			const newSubmitBtn = submitBtn.cloneNode(true);
			submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

			// Add click listener
			newSubmitBtn.addEventListener("click", (e) => {
				e.preventDefault();
				console.log(`Submit clicked for post ${postId}`);
				submitComment(postId, formElement);
			});

			// Also allow Ctrl+Enter to submit
			if (textArea) {
				textArea.addEventListener("keydown", (e) => {
					if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
						e.preventDefault();
						submitComment(postId, formElement);
					}
				});
			}
		} else {
			console.warn(`Missing form elements for section ${index}`);
		}
	});
}

// ============ NEWSLETTER ============

function initNewsletterSignup() {
	const newsletterBtn = document.querySelector(".sidebar-section button");
	const emailInput = document.querySelector(
		'.sidebar-section input[type="email"]'
	);

	if (
		newsletterBtn &&
		emailInput &&
		newsletterBtn.textContent.includes("Join")
	) {
		newsletterBtn.addEventListener("click", async (e) => {
			e.preventDefault();

			const email = emailInput.value.trim();
			if (!email || !email.includes("@")) {
				alert("Please enter a valid email address");
				return;
			}

			try {
				const response = await fetch(`${API_URL}/newsletter`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (response.ok) {
					alert("Thanks for subscribing to the Geezzers' Dispatch!");
					emailInput.value = "";
				}
			} catch (error) {
				console.error("Newsletter error:", error);
			}
		});
	}
}

// ============ MAIN INITIALIZATION ============

// Single DOMContentLoaded listener - ONLY ONE!
document.addEventListener("DOMContentLoaded", async () => {
	console.log("🎩 Initializing Geezzers' Gazzette...");

	try {
		// Load templates first
		await loadNavbar();
		await loadHero();

		// Load any blog content
		if (document.getElementById("blog-placeholder-1")) {
			await loadBlogPost("blog1.html", "blog-placeholder-1");
		}
		if (document.getElementById("blog-placeholder-2")) {
			await loadBlogPost("blog2.html", "blog-placeholder-2");
		}

		// Initialize features
		updateDateTicker();
		setInterval(updateDateTicker, 60000); // Update every minute

		// Initialize interactive features
		initCommentSections();
		initNewsletterSignup();

		console.log("✅ Geezzers' Gazzette fully loaded!");
	} catch (error) {
		console.error("Initialization error:", error);
	}
});

// ============ DEBUG HELPERS ============

window.GeezzersDebug = {
	API_URL,
	testComment: async function () {
		const testData = {
			author_name: "Test User",
			content: "This is a test comment",
		};

		try {
			const response = await fetch(`${API_URL}/posts/1/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(testData),
			});
			const result = await response.json();
			console.log("Test comment result:", result);
			return result;
		} catch (error) {
			console.error("Test failed:", error);
		}
	},
	reloadComments: function () {
		initCommentSections();
	},
};
// End of script.js
