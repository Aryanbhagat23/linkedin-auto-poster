const cron = require('node-cron');
const config = require('../config/config');
const { generateLinkedInPost } = require('../services/claudeService');
const linkedinService = require('../services/linkedinService');
const { sendPostNotification } = require('../services/emailService');
const { savePost, getAuth } = require('./storage');

let scheduledTask = null;

async function executeScheduledPost() {
  console.log('🚀 Starting scheduled post generation...');

  try {
    // Load authentication
    const auth = await getAuth();
    if (!auth || !auth.accessToken) {
      console.error('❌ No LinkedIn authentication found');
      return;
    }

    linkedinService.setAccessToken(auth.accessToken, auth.userId);

    // Generate post
    console.log('📝 Generating post with AI...');
    const post = await generateLinkedInPost();

    if (!post.success) {
      console.error('❌ Failed to generate post:', post.error);
      await sendPostNotification(post, 'error');
      return;
    }

    console.log('✅ Post generated successfully');

    // Post to LinkedIn
    console.log('📤 Posting to LinkedIn...');
    const result = await linkedinService.createPost(post.content);

    // Save to history
    await savePost({
      content: post.content,
      wordCount: post.wordCount,
      status: result.success ? 'published' : 'failed',
      linkedinPostId: result.postId,
      error: result.error
    });

    // Send notification
    await sendPostNotification(post, result.success ? 'success' : 'error');

    if (result.success) {
      console.log('✅ Successfully posted to LinkedIn!');
    } else {
      console.error('❌ Failed to post to LinkedIn:', result.error);
    }

  } catch (error) {
    console.error('❌ Scheduled post error:', error);
  }
}

function startScheduler() {
  if (scheduledTask) {
    console.log('⚠️ Scheduler already running');
    return;
  }

  // Parse time (format: "HH:MM")
  const [hour, minute] = config.schedule.time.split(':');
  
  // Schedule format: "minute hour * * *" (runs daily)
  const cronExpression = `${minute} ${hour} * * *`;

  scheduledTask = cron.schedule(cronExpression, executeScheduledPost, {
    timezone: config.schedule.timezone
  });

  console.log(`✅ Scheduler started: Posts will be generated daily at ${config.schedule.time} (${config.schedule.timezone})`);
}

function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('🛑 Scheduler stopped');
  }
}

function getSchedulerStatus() {
  return {
    running: scheduledTask !== null,
    schedule: config.schedule.time,
    timezone: config.schedule.timezone
  };
}

module.exports = {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  executeScheduledPost
};