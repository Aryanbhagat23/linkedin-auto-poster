const axios = require('axios');
const config = require('../config/config');

class LinkedInService {
  constructor() {
    this.accessToken = null;
    this.userId = null;
  }

  // Get LinkedIn authorization URL
  getAuthUrl() {
    const scope = 'openid profile w_member_social';
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.linkedin.clientId}&redirect_uri=${encodeURIComponent(config.linkedin.redirectUri)}&scope=${encodeURIComponent(scope)}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.linkedin.redirectUri,
            client_id: config.linkedin.clientId,
            client_secret: config.linkedin.clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      await this.getUserProfile();
      
      return {
        success: true,
        accessToken: this.accessToken,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('LinkedIn Auth Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      this.userId = response.data.sub;
      return response.data;
    } catch (error) {
      console.error('Get Profile Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Post to LinkedIn
  async createPost(content) {
    try {
      if (!this.accessToken || !this.userId) {
        throw new Error('Not authenticated with LinkedIn');
      }

      const postData = {
        author: `urn:li:person:${this.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        success: true,
        postId: response.data.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('LinkedIn Post Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  setAccessToken(token, userId) {
    this.accessToken = token;
    this.userId = userId;
  }
}

module.exports = new LinkedInService();