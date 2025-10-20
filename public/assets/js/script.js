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

				// Initialize any navbar interactions after loading
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

// Initialize navbar events (dropdown menus, mobile toggle, etc.)
function initNavbarEvents() {
	// Example: Mobile menu toggle
	const mobileToggle = document.querySelector(".navbar-toggle");
	const navMenu = document.querySelector(".navbar-menu");

	if (mobileToggle && navMenu) {
		mobileToggle.addEventListener("click", () => {
			navMenu.classList.toggle("active");
		});
	}

	// Example: Dropdown menus
	const dropdowns = document.querySelectorAll(".navbar-dropdown");
	dropdowns.forEach((dropdown) => {
		dropdown.addEventListener("click", (e) => {
			e.currentTarget.classList.toggle("open");
		});
	});
}

// Load everything when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
	console.log("🎩 Loading Geezzers components...");

	// Load components in order
	await loadNavbar();
	await loadHero();

	// Then initialize other features
	updateDateTicker();
	initCommentSections();
	initNewsletterSignup();

	console.log("✅ All components loaded!");
});

// Load specific blog post
async function loadBlogPost(filename, targetId) {
	const placeholder = document.getElementById(targetId);
	if (placeholder) {
		try {
			const response = await fetch(`/assets/blogs/${filename}`);
			if (response.ok) {
				const html = await response.text();
				placeholder.innerHTML = html;
			}
		} catch (error) {
			console.error(`Error loading blog ${filename}:`, error);
		}
	}
}

// Example usage
document.addEventListener("DOMContentLoaded", async () => {
	// Load blog content
	await loadBlogPost("blog1.html", "blog-placeholder-1");
	await loadBlogPost("blog2.html", "blog-placeholder-2");
});

// public/assets/js/script.js - Complete version

const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:8788/api"
		: "/api";

// Load all template components
async function loadTemplates() {
	// Load in parallel for speed
	const promises = [
		loadComponent("navbar-placeholder", "/assets/templates/navbar.html"),
		loadComponent("hero-placeholder", "/assets/templates/hero.html"),
	];

	await Promise.all(promises);
}

// Generic component loader
async function loadComponent(placeholderId, templatePath) {
	const placeholder = document.getElementById(placeholderId);
	if (!placeholder) return;

	try {
		const response = await fetch(templatePath);
		if (response.ok) {
			const html = await response.text();
			placeholder.innerHTML = html;
			console.log(`✅ Loaded: ${templatePath}`);
		}
	} catch (error) {
		console.error(`Failed to load ${templatePath}:`, error);
	}
}

// Initialize everything
document.addEventListener("DOMContentLoaded", async () => {
	// Load templates first
	await loadTemplates();

	// Then initialize features
	updateDateTicker();
	initCommentSections();
	initNavbarEvents();

	console.log("🎩 Geezzers site fully loaded!");
});

// API handler for Cloudflare Workers
addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const url = new URL(request.url);
	if (url.pathname.startsWith("/api/")) {
		return await handleAPIRequest(url);
	}
	return new Response("Not Found", { status: 404 });
}

async function handleAPIRequest(url) {
	// Implement your API logic here
}
