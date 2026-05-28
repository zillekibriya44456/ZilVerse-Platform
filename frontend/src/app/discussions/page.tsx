"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./discussions.module.css";

const DEMO_POSTS = [
  { id: "1", title: "Best architecture for a global chat app?", content: "Should I use WebSockets with Redis Pub/Sub, or something like Socket.io?", category: "System Design", author: "Alex Chen", upvotes: 42 },
  { id: "2", title: "React vs Next.js for dashboard?", content: "I am building a complex B2B dashboard. Is Next.js overkill if I don't need SEO?", category: "Frontend", author: "Sarah Jenkins", upvotes: 28 },
  { id: "3", title: "Supabase vs Firebase in 2026", content: "PostgreSQL is amazing, but Firebase's realtime DB is so easy. Thoughts?", category: "Backend", author: "Mike Ross", upvotes: 89 }
];

export default function DiscussionsPage() {
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [isUploading, setIsUploading] = useState(false);

  // Reply State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/discussions`)
      .then(res => setDbPosts(res.data))
      .catch(err => console.error("Failed to fetch discussions", err));
  }, []);

  const handlePost = async () => {
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE}/api/discussions/create`, newPost);
      setIsModalOpen(false);
      const res = await axios.get(`${API_BASE}/api/discussions`);
      setDbPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      await axios.post(`${API_BASE}/api/discussions/reply`, {
        postId,
        content: replyContent
      });
      setReplyingToId(null);
      setReplyContent('');
      const res = await axios.get(`${API_BASE}/api/discussions`);
      setDbPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const formattedDbPosts = dbPosts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    author: p.author?.name || "Anonymous",
    upvotes: p.upvotes,
    replies: p.replies || []
  }));

  const POSTS = [...formattedDbPosts, ...DEMO_POSTS.map(p => ({ ...p, replies: [] }))];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.badgeLabel}>Global Forums</div>
          <h1 className={styles.title}>Developer Discussions</h1>
          <p className={styles.subtitle}>
            Join the conversation. Ask questions, share architectures, and debate the latest tech trends with verified engineers.
          </p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '2rem' }}>
            + Start Discussion
          </button>
        </div>

        <div className={styles.grid}>
          {POSTS.map(post => (
            <div key={post.id} className={`glass-panel ${styles.postCard}`}>
              <div className={styles.postHeader}>
                <span className={styles.categoryBadge}>{post.category}</span>
                <span className={styles.upvotes}>👍 {post.upvotes}</span>
              </div>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postContent}>{post.content}</p>
              
              {/* Render Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className={styles.repliesSection} style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                  {post.replies.map((reply: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.8rem' }}>
                      <p style={{ color: '#d4d4d8', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{reply.content}</p>
                      <span style={{ color: '#71717a', fontSize: '0.75rem' }}>- {reply.author?.name || 'Anonymous'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.postFooter}>
                <span className={styles.author}>Posted by <strong>{post.author}</strong></span>
                <button 
                  className={`btn btn-secondary ${styles.replyBtn}`}
                  onClick={() => { setReplyingToId(replyingToId === post.id ? null : post.id); setReplyContent(''); }}
                >
                  {replyingToId === post.id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {/* Reply Input Form */}
              {replyingToId === post.id && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Write a reply..." 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                  />
                  <button 
                    onClick={() => handleReplySubmit(String(post.id))} 
                    disabled={isReplying}
                    style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {isReplying ? '...' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Start a Discussion</h2>
            <input 
              type="text" 
              placeholder="Discussion Title" 
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            />
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
            >
              <option>General</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>System Design</option>
            </select>
            <textarea 
              placeholder="What's on your mind?" 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '100px' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePost} disabled={isUploading} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isUploading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
