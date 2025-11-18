const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/config');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

async function generateLinkedInPost() {
  try {
    console.log('🤖 Generating LinkedIn post with Claude...');
    
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    console.log('📅 Date:', today);
    console.log('🔑 API Key present:', !!config.anthropicApiKey);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a LinkedIn thought-leadership content creator. Today is ${today}.

Your task:
1. Search for TODAY's most impactful trending topics in technology, AI, business, or innovation
2. Generate ONE compelling LinkedIn post (120-180 words) with:
   - A strong hook that captures attention
   - 1-2 specific data points or statistics
   - Expert insights and clear takeaway
   - An engagement question at the end
   - 3-5 relevant hashtags at the end

Focus on: AI developments, tech trends, business strategy, productivity tools, regulatory changes, or leadership insights.

Format the post ready to copy-paste into LinkedIn. Be specific, insightful, and avoid generic motivational content.

Return ONLY the post text, no preamble or explanation.`
      }],
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search'
      }]
    });

    console.log('✅ Claude API response received');

    // Extract text from response
    let postContent = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        postContent += block.text;
      }
    }

    const trimmedContent = postContent.trim();
    const wordCount = trimmedContent.split(/\s+/).length;

    console.log('📝 Post generated:', wordCount, 'words');

    return {
      success: true,
      content: trimmedContent,
      timestamp: new Date().toISOString(),
      wordCount: wordCount
    };
  } catch (error) {
    console.error('❌ Claude API Error:', error.message);
    console.error('Error details:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { generateLinkedInPost };