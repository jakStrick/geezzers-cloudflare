-- Cloudflare D1 Database Schema
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'author',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_badge TEXT,
    author_id INTEGER REFERENCES users(id),
    category TEXT,
    read_time TEXT,
    status TEXT DEFAULT 'published',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'approved',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- Insert default data
INSERT INTO users (id, username, email, password_hash, role) 
VALUES (1, 'geezzer1', 'admin@geezzersgazzette.com', 'temp_password', 'admin');

INSERT INTO posts (id, title, slug, content, excerpt, featured_badge, category, read_time, author_id) 
VALUES 
(
    1,
    'Presidential Powers: What are presidential powers, and how far can a president go?',
    'presidential-powers',
    '<p>Full article content goes here...</p>',
    'An examination of executive authority and constitutional limits',
    'Geezzer 1 Blog One',
    'Geezzers Executive Branch Analysis',
    '15 min read',
    1
),
(
    2,
    'NYCs Political Trajectory: Examining the Push for Expanded Government Control',
    'nyc-political-trajectory',
    '<p>New York Citys current political leadership represents a case study...</p>',
    'A deep dive into NYC politics',
    'Whats Got Us Riled Up',
    'State Politics',
    '12 min read',
    1
),
(
    3,
    'The Shifting Dynamics of Congressional Power',
    'congressional-power',
    '<p>An examination of how recent committee restructuring reflects...</p>',
    'Analysis of congressional changes',
    'The Geezzers Explain Congress',
    'Congressional Analysis',
    '8 min read',
    1
);

INSERT INTO comments (post_id, author_name, content, status) 
VALUES 
(1, 'Sarah M.', 'Interesting analysis. The comparison to historical uses of executive orders by previous presidents would add valuable context.', 'approved'),
(1, 'Constitutional Scholar', 'The Youngstown Steel case (1952) established the framework for analyzing presidential power.', 'approved'),
(1, 'Mike Johnson', 'Whether you support or oppose these policies, understanding HOW the system works is crucial.', 'approved'),
(2, 'NYC Resident', 'As someone living in NYC, I see both the benefits and drawbacks of these policies daily.', 'approved'),
(2, 'Economics Professor', 'The tension between state/local experimentation and federal constitutional limits is fascinating.', 'approved'),
(2, 'History Buff', 'The Tammany Hall era showed us how local political machines can influence national politics.', 'approved');