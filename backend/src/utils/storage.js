const fs = require('fs').promises;
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../../data/posts.json');
const AUTH_FILE = path.join(__dirname, '../../data/auth.json');

async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '../../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function savePost(post) {
  await ensureDataDirectory();
  
  let posts = [];
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    posts = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
  }

  posts.unshift({
    ...post,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  });

  // Keep only last 100 posts
  posts = posts.slice(0, 100);

  await fs.writeFile(STORAGE_FILE, JSON.stringify(posts, null, 2));
  return posts[0];
}

async function getPosts() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveAuth(authData) {
  await ensureDataDirectory();
  await fs.writeFile(AUTH_FILE, JSON.stringify(authData, null, 2));
}

async function getAuth() {
  try {
    const data = await fs.readFile(AUTH_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

module.exports = { savePost, getPosts, saveAuth, getAuth };