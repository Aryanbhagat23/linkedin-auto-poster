import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Clock,
  Send,
  Linkedin,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #faf5ff)',
    padding: '24px'
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    marginBottom: '24px',
    border: '1px solid #dbeafe'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBox: {
    backgroundColor: '#2563eb',
    padding: '12px',
    borderRadius: '12px'
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '4px'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  buttonPrimary: {
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    color: 'white'
  },
  buttonBlue: {
    backgroundColor: '#2563eb',
    color: 'white'
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
    color: 'white'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },
  gridLg: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '8px',
    fontWeight: '500'
  },
  alert: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  alertSuccess: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  postPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    marginBottom: '16px'
  },
  postText: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    color: '#1f2937',
    lineHeight: '1.6'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#9ca3af'
  },
  historyItem: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginBottom: '12px'
  },
  schedulerBox: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  infoBox: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    borderRadius: '16px',
    padding: '24px'
  },
  section: {
    marginBottom: '24px'
  }
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [schedulerStatus, setSchedulerStatus] = useState({ running: false });

  useEffect(() => {
    checkAuthStatus();
    loadHistory();
    loadSchedulerStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/status`);
      setAuthenticated(response.data.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const connectLinkedIn = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/linkedin/url`);
      window.open(response.data.authUrl, '_blank');
      setStatus('Please complete LinkedIn authorization in the new window');
      
      const interval = setInterval(async () => {
        await checkAuthStatus();
        const authResponse = await axios.get(`${API_URL}/api/auth/status`);
        if (authResponse.data.authenticated) {
          clearInterval(interval);
          setStatus('✅ LinkedIn connected successfully!');
          setAuthenticated(true);
        }
      }, 2000);
    } catch (error) {
      setStatus('❌ Failed to connect LinkedIn');
    }
  };

  const generatePost = async () => {
    setLoading(true);
    setStatus('Generating post...');
    
    try {
      const response = await axios.post(`${API_URL}/api/generate`);
      if (response.data.success) {
        setPost(response.data.content);
        setStatus('✅ Post generated!');
        loadHistory();
      } else {
        setStatus('❌ Generation failed: ' + response.data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const postToLinkedIn = async () => {
    if (!post) {
      setStatus('❌ No post content to publish');
      return;
    }

    setLoading(true);
    setStatus('Posting to LinkedIn...');
    
    try {
      const response = await axios.post(`${API_URL}/api/post`, { content: post });
      if (response.data.success) {
        setStatus('✅ Posted to LinkedIn successfully!');
        loadHistory();
      } else {
        setStatus('❌ Post failed: ' + response.data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAndPost = async () => {
    setLoading(true);
    setStatus('Generating and posting...');
    
    try {
      const response = await axios.post(`${API_URL}/api/generate-and-post`);
      if (response.data.success) {
        setPost(response.data.post);
        setStatus('✅ Generated and posted successfully!');
        loadHistory();
      } else {
        setStatus('❌ Failed: ' + response.data.error);
      }
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/scheduler/status`);
      setSchedulerStatus(response.data);
    } catch (error) {
      console.error('Failed to load scheduler status:', error);
    }
  };

  const toggleScheduler = async () => {
    try {
      const endpoint = schedulerStatus.running ? 'stop' : 'start';
      await axios.post(`${API_URL}/api/scheduler/${endpoint}`);
      loadSchedulerStatus();
    } catch (error) {
      setStatus('❌ Scheduler toggle failed');
    }
  };

  const testScheduler = async () => {
    setStatus('🧪 Running test post...');
    try {
      await axios.post(`${API_URL}/api/scheduler/test`);
      setStatus('✅ Test post initiated - check history');
      setTimeout(loadHistory, 3000);
    } catch (error) {
      setStatus('❌ Test failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={styles.iconBox}>
                <Linkedin color="white" size={32} />
              </div>
              <div>
                <h1 style={styles.title}>LinkedIn Auto-Poster</h1>
                <p style={styles.subtitle}>Automated AI-powered LinkedIn content</p>
              </div>
            </div>
            
            <div>
              {authenticated ? (
                <div style={styles.statusBadge}>
                  <CheckCircle2 size={20} />
                  <span>LinkedIn Connected</span>
                </div>
              ) : (
                <button
                  onClick={connectLinkedIn}
                  style={{...styles.button, ...styles.buttonBlue}}
                >
                  <Linkedin size={20} />
                  Connect LinkedIn
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={window.innerWidth > 1024 ? styles.gridLg : styles.grid}>
          {/* Left Panel */}
          <div>
            {/* Quick Actions */}
            <div style={{...styles.card, borderColor: '#e9d5ff'}}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} />
                Quick Actions
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={generatePost}
                  disabled={loading || !authenticated}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: '100%',
                    justifyContent: 'center',
                    ...(loading || !authenticated ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Post
                    </>
                  )}
                </button>

                <button
                  onClick={postToLinkedIn}
                  disabled={loading || !authenticated || !post}
                  style={{
                    ...styles.button,
                    ...styles.buttonBlue,
                    width: '100%',
                    justifyContent: 'center',
                    ...(loading || !authenticated || !post ? styles.buttonDisabled : {})
                  }}
                >
                  <Send size={18} />
                  Post to LinkedIn
                </button>

                <button
                  onClick={generateAndPost}
                  disabled={loading || !authenticated}
                  style={{
                    ...styles.button,
                    ...styles.buttonGreen,
                    width: '100%',
                    justifyContent: 'center',
                    ...(loading || !authenticated ? styles.buttonDisabled : {})
                  }}
                >
                  <Send size={18} />
                  Generate & Post Now
                </button>
              </div>

              {status && (
                <div style={{
                  ...styles.alert,
                  ...(status.includes('❌') ? styles.alertError : styles.alertSuccess)
                }}>
                  {status}
                </div>
              )}
            </div>

            {/* Scheduler */}
            <div style={{...styles.card, marginTop: '24px'}}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} />
                Automation
              </h2>

              <div style={styles.schedulerBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '500' }}>Auto-Post Scheduler</span>
                  <button
                    onClick={toggleScheduler}
                    disabled={!authenticated}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: schedulerStatus.running ? '#16a34a' : '#4b5563',
                      color: 'white',
                      cursor: 'pointer',
                      ...(! authenticated ? styles.buttonDisabled : {})
                    }}
                  >
                    {schedulerStatus.running ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <p><strong>Status:</strong> {schedulerStatus.running ? '🟢 Running' : '🔴 Stopped'}</p>
                  <p><strong>Schedule:</strong> Daily at {schedulerStatus.schedule}</p>
                  <p><strong>Timezone:</strong> {schedulerStatus.timezone}</p>
                </div>
              </div>

              <button
                onClick={testScheduler}
                disabled={!authenticated}
                style={{
                  ...styles.button,
                  backgroundColor: '#9333ea',
                  color: 'white',
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '14px',
                  marginTop: '12px',
                  ...(!authenticated ? styles.buttonDisabled : {})
                }}
              >
                🧪 Test Scheduled Post
              </button>
            </div>

            {/* Info */}
            <div style={{...styles.infoBox, marginTop: '24px'}}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>ℹ️ How It Works</h3>
              <ul style={{ fontSize: '14px', color: '#bfdbfe', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>• AI searches trending topics daily</li>
                <li style={{ marginBottom: '8px' }}>• Generates engaging 120-180 word posts</li>
                <li style={{ marginBottom: '8px' }}>• Auto-posts to your LinkedIn</li>
                <li style={{ marginBottom: '8px' }}>• Email notifications sent</li>
                <li>• Full post history tracking</li>
              </ul>
            </div>
          </div>

          {/* Right Panel */}
          <div>
            {/* Generated Post */}
            <div style={styles.card}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Current Post Preview</h2>
              
              {post ? (
                <div>
                  <div style={styles.postPreview}>
                    <pre style={styles.postText}>{post}</pre>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                    <span>Word count: {post.split(/\s+/).length}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(post);
                        setStatus('✅ Copied to clipboard!');
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Copy Text
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <Sparkles size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>Generate a post to see preview</p>
                </div>
              )}
            </div>

            {/* Post History */}
            <div style={{...styles.card, borderColor: '#e9d5ff'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Post History</h2>
                <button
                  onClick={loadHistory}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {history.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {history.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => setPost(item.content)}
                      style={styles.historyItem}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: item.status === 'published' ? '#dcfce7' : item.status === 'failed' ? '#fee2e2' : '#dbeafe',
                          color: item.status === 'published' ? '#166534' : item.status === 'failed' ? '#991b1b' : '#1e40af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {item.status === 'published' ? (
                            <><CheckCircle2 size={12} /> Published</>
                          ) : item.status === 'failed' ? (
                            <><XCircle size={12} /> Failed</>
                          ) : (
                            'Generated'
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {item.content}
                      </div>
                      {item.wordCount && (
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                          {item.wordCount} words
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  // This is the line with the error
                  <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5}} />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;