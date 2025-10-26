// public/assets/js/script.js - FIXED VERSION
// Frontend JavaScript for Geezzers Gazzette

// API Configuration
const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:8788/api"
		: "/api";

// ============ TEMPLATES ============
const TEMPLATES = {
	navbar: `<nav>
		<div class="geezzers-wrapper">
			<div class="geezzers">
				<img src="./assets/images/img1.png" alt="Old Geezer 1" />
				<img src="./assets/images/img2.png" alt="Old Geezer 2" />
			</div>
			<div class="logo">
				The Geezzers
				<span class="chronicles" data-text="Chronicles">Gazzette</span>
			</div>
		</div>
		<div class="tagline-wrapper">
			<div class="tagline">
				Where A Couple Geezzers Talk Politics • Two Old Guys Who've Seen A Lot
				of Shit!
			</div>
			<div class="established">Observing Politics Since Adam and Eve</div>
		</div>

		<ul class="nav-links">
			<li><a href="https://www.geezzersgazzette.com">Home</a></li>
			<li><a href="https://www.house.gov/" target="_blank">House</a></li>
			<li><a href="https://www.senate.gov/" target="_blank">Senate</a></li>
			<li>
				<a href="https://www.whitehouse.gov/" target="_blank">White House</a>
			</li>
			<li>
				<a href="https://www.supremecourt.gov/" target="_blank">SCOTUS</a>
			</li>
			<li><a href="#opinion">Opinion</a></li>
			<li><a href="#about">About</a></li>
		</ul>
	</nav>

	<!-- Hamburger menu button -->
	<button class="hamburger" id="hamburger" aria-label="Toggle navigation">
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
	</button>`,

	hero: `<!-- Mission Statement Hero Section -->
	<section class="mission-hero">
		<div class="mission-container">
			<div class="mission-quote">
				<span class="quote-mark">"</span>
				A republic, if you can keep it.
				<span class="quote-mark">"</span>
				<div class="quote-attribution">— Benjamin Franklin, 1787</div>
			</div>

			<div class="mission-content">
				<h1>Welcome to The Geezzers' Gazzette</h1>
				<div class="mission-divider"></div>

				<p class="mission-lead">
					B. Franklin understood some shit we seem to have lost sight of
					today. He understood that a Republic requires an educated and
					engaged citizenry—geezzers and all to survive. Today, we face a
					crisis of certain civic knowledge that a couple of geezzers hope to
					help restore. Yup, just two old geezzers who've watched too much TV,
					played one too many video games, drank too much wine, coffee,
					whiskey and sat back and watched this country devolve into a crap
					fest while we were too busy having fun. But lucky for you, we feel
					we still have some thoughts-- our geezzer ideas, to share and hope
					to still be relevant.
				</p>

				<p class="mission-lead">
					<strong>Geezzers' Warning:</strong> One of the easiest ways for a
					politician to get your vote is to promise you things for free. Think
					about it... why wouldn't it be? And have you ever asked yourself
					what does "free" really mean? Who's paying for all this free stuff?
				</p>

				<p>
					<strong>This blog exists to learn:</strong> Here, two geezzers
					(Geezzers 1 and 2) explore the mechanics of American government our
					constitutional republic—the three branches, their checks and
					balances, and how they work. Our goal is to make these complex
					systems understandable through plain language and geezzers'
					analysis.
				</p>

				<p>
					<strong>What you'll find here:</strong> In an effort to educate you
					youngens, we provide some explanation of our constitutional
					republic. Examination of current political events by the two
					geezzers, and we try to remember how things used to be in hopes we
					can provide some context, insight and balance to the world around us
					to help put things into perspective.
				</p>

				<p>
					<strong>What you won't find here:</strong> Hate speech, personal
					attacks, or conspiracy theories (like QAnon, Kings and TDS etc.). We
					can disagree about geezzer stuff civilly. We've been disagreeing
					with each other since Adam and Eve but still remain cordial.
				</p>

				<p class="mission-cta">
					Whether you're a political newcomer or a fellow old-timer, join a
					couple geezzers talking about things they can remember. Because
					understanding our constitutional republic isn't just academic—it's
					essential to preserving it for everyone.
				</p>

				<div class="mission-signature">
					<em
						>OK--now let's have some fun and dive in and rediscover what
						makes our system of government work so well.</em
					>
					<br /><br />
				</div>
			</div>
		</div>
	</section>`,
};

// ============ TEMPLATE LOADING ============

// Load navbar component
function loadNavbar() {
	const placeholder = document.getElementById("navbar-placeholder");
	if (placeholder) {
		placeholder.innerHTML = TEMPLATES.navbar;
		console.log("✅ Navbar loaded");
		initNavbarEvents();
	}
}

// Load hero component
function loadHero() {
	const placeholder = document.getElementById("hero-placeholder");
	if (placeholder) {
		placeholder.innerHTML = TEMPLATES.hero;
		console.log("✅ Hero loaded");
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
		console.log(
			`🔍 Loading comments for post ${postId} from: ${API_URL}/posts/${postId}/comments`
		);
		const response = await fetch(`${API_URL}/posts/${postId}/comments`);
		console.log(`🔍 Comments response status: ${response.status}`);

		if (!response.ok) {
			console.error("❌ Failed to load comments:", response.status);
			return;
		}

		const comments = await response.json();
		console.log(`🔍 Loaded ${comments.length} comments:`, comments);

		const existingCommentsDiv =
			containerElement.querySelector(".existing-comments");
		if (!existingCommentsDiv) {
			console.log("❌ No existing-comments div found");
			return;
		}

		existingCommentsDiv.innerHTML = "";

		if (comments.length === 0) {
			existingCommentsDiv.innerHTML =
				'<p style="color: #666; font-style: italic;">No comments yet. Be the first to share your thoughts!</p>';
			console.log("✅ No comments - showing placeholder");
			return;
		}

		comments.forEach((comment) => {
			const commentEl = createCommentElement(comment);
			existingCommentsDiv.appendChild(commentEl);
		});
		console.log("✅ Comments rendered successfully");
	} catch (error) {
		console.error("❌ Error loading comments:", error);
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
	console.log("🔍 Initializing comment sections...");

	// Find all comment sections
	const commentSections = document.querySelectorAll(".comments-section");
	console.log("🔍 Found comment sections:", commentSections.length);

	if (commentSections.length === 0) {
		console.log("❌ No comment sections found");
		return;
	}

	commentSections.forEach((section, index) => {
		// Determine post ID
		// You can set data-post-id on each section, or use index + 1
		const postId = section.dataset.postId || index + 1;

		console.log(`🔍 Setting up comments for post ${postId}`);

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
document.addEventListener("DOMContentLoaded", () => {
	console.log("🎩 Initializing Geezzers' Gazzette...");

	try {
		// Load templates first
		loadNavbar();
		loadHero();

		// Load any blog content
		if (document.getElementById("blog-placeholder-1")) {
			loadBlogPost("blog1.html", "blog-placeholder-1");
		}
		if (document.getElementById("blog-placeholder-2")) {
			loadBlogPost("blog2.html", "blog-placeholder-2");
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
