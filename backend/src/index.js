const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { generateLinkedInPost } = require('./services/claudeService');
const linkedinService = require('./services/linkedinService');
const { sendPostNotification } = require('./services/emailService');
const { savePost, getPosts, saveAuth, getAuth } = require('./utils/storage');
const { 
  startScheduler, 
  stopScheduler, 
  getSchedulerStatus,
  executeScheduledPost 
} = require('./utils/scheduler');

const app = express();

// CORS configuration
// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://your-app.vercel.app', // Replace with your actual Vercel URL
  process.env.FRONTEND_URL // Add environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get LinkedIn auth URL
app.get('/api/auth/linkedin/url', (req, res) => {
  const authUrl = linkedinService.getAuthUrl();
  res.json({ authUrl });
});

// Handle LinkedIn callback
app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth Error:', error, error_description);
    return res.send(`
      <html>
        <body>
          <h2>❌ LinkedIn Connection Failed</h2>
          <p>Error: ${error_description || error}</p>
          <p>You can close this window and try again.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send(`
      <html>
        <body>
          <h2>❌ No Authorization Code</h2>
          <p>You can close this window and try again.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }

  const result = await linkedinService.getAccessToken(code);

  if (result.success) {
    // Save authentication
    await saveAuth({
      accessToken: result.accessToken,
      userId: linkedinService.userId,
      timestamp: new Date().toISOString()
    });

    res.send(`
      <html>
        <body>
          <h2>✅ LinkedIn Connected Successfully!</h2>
          <p>You can close this window now.</p>
          <script>
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } else {
    console.error('Token exchange failed:', result.error);
    res.send(`
      <html>
        <body>
          <h2>❌ LinkedIn Connection Failed</h2>
          <p>Error: ${result.error}</p>
          <p>Please try again.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }
});

// Check auth status
app.get('/api/auth/status', async (req, res) => {
  const auth = await getAuth();
  res.json({ 
    authenticated: !!auth,
    userId: auth?.userId 
  });
});

// Generate post manually
app.post('/api/generate', async (req, res) => {
  try {
    const post = await generateLinkedInPost();
    
    if (post.success) {
      await savePost({
        content: post.content,
        wordCount: post.wordCount,
        status: 'generated'
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Post to LinkedIn
app.post('/api/post', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    // Load authentication
    const auth = await getAuth();
    if (!auth) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated with LinkedIn' 
      });
    }

    linkedinService.setAccessToken(auth.accessToken, auth.userId);

    const result = await linkedinService.createPost(content);

    if (result.success) {
      await savePost({
        content,
        status: 'published',
        linkedinPostId: result.postId
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate and post (one-click)
app.post('/api/generate-and-post', async (req, res) => {
  try {
    // Load authentication
    const auth = await getAuth();
    if (!auth) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated with LinkedIn' 
      });
    }

    linkedinService.setAccessToken(auth.accessToken, auth.userId);

    // Generate
    const post = await generateLinkedInPost();
    if (!post.success) {
      return res.status(500).json(post);
    }

    // Post to LinkedIn
    const result = await linkedinService.createPost(post.content);

    // Save
    await savePost({
      content: post.content,
      wordCount: post.wordCount,
      status: result.success ? 'published' : 'failed',
      linkedinPostId: result.postId,
      error: result.error
    });

    // Send notification
    await sendPostNotification(post, result.success ? 'success' : 'error');

    res.json({
      success: result.success,
      post: post.content,
      linkedinPostId: result.postId,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get post history
app.get('/api/posts', async (req, res) => {
  const posts = await getPosts();
  res.json(posts);
});

// Scheduler endpoints
app.post('/api/scheduler/start', (req, res) => {
  startScheduler();
  res.json(getSchedulerStatus());
});

app.post('/api/scheduler/stop', (req, res) => {
  stopScheduler();
  res.json(getSchedulerStatus());
});

app.get('/api/scheduler/status', (req, res) => {
  res.json(getSchedulerStatus());
});

app.post('/api/scheduler/test', async (req, res) => {
  res.json({ message: 'Test post initiated' });
  executeScheduledPost(); // Run async
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📅 Scheduled posts: ${config.schedule.time} (${config.schedule.timezone})`);
  
  // Auto-start scheduler
  startScheduler();
});