"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { MOCK_REELS, REEL_CATEGORIES, ReelCategory } from "@/data/reels";
import styles from "./reels.module.css";

const API = "http://localhost:5002/api/reels";

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

const MOCK_STORIES = [
  { user: { id: "s1", name: "Zille", avatar: "/avatars/avatar_1.png" }, stories: [{ id: "ms1", mediaUrl: "", mediaType: "image" }] },
  { user: { id: "s2", name: "Aisha", avatar: "/creators/creator_1.png" }, stories: [{ id: "ms2", mediaUrl: "", mediaType: "image" }] },
  { user: { id: "s3", name: "Kenji", avatar: "/avatars/hr_1.png" }, stories: [{ id: "ms3", mediaUrl: "", mediaType: "image" }] },
  { user: { id: "s4", name: "Maria", avatar: "/creators/creator_3.png" }, stories: [{ id: "ms4", mediaUrl: "", mediaType: "image" }] },
  { user: { id: "s5", name: "Amadi", avatar: "/avatars/avatar_2.png" }, stories: [{ id: "ms5", mediaUrl: "", mediaType: "image" }] },
];

export default function InnoReelsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ReelCategory>("For You");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dbReels, setDbReels] = useState<any[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [heartBurst, setHeartBurst] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);

  // Modals
  const [commentsOpen, setCommentsOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const [donateOpen, setDonateOpen] = useState<any>(null);
  const [donateAmount, setDonateAmount] = useState(5);
  const [donateMsg, setDonateMsg] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCat, setUploadCat] = useState("For You");
  const [uploadTags, setUploadTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storyViewer, setStoryViewer] = useState<any>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const lastTap = useRef<{ time: number; id: string }>({ time: 0, id: "" });
  let emojiId = useRef(0);

  // Fetch reels
  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${API}?category=${activeCategory}`);
        setDbReels(r.data.reels || r.data || []);
      } catch { setDbReels([]); }
    })();
  }, [activeCategory]);

  // Format reels
  const allReels = (() => {
    const db = dbReels.map((r: any) => ({
      id: r.id, videoUrl: `http://localhost:5002${r.videoUrl}`, title: r.title,
      description: r.description || "", creator: r.creator?.name || "Anonymous",
      creatorId: r.creatorId || r.creator?.id, handle: "@user",
      avatar: r.creator?.avatar || "/avatars/avatar_1.png", verified: r.creator?.verified,
      likes: r.likes || 0, comments: r.comments || 0, shares: r.shares || 0,
      views: r.views || 0, saves: r.saves || 0,
      category: r.category, tags: (r.tags || "").split(",").filter(Boolean),
      gradient: "linear-gradient(135deg, #18181b, #000)", icon: "🎥", isReal: true,
    }));
    const mock = MOCK_REELS.map((r: any) => ({
      ...r, creatorId: "mock", verified: false, views: Math.floor(Math.random() * 50000),
      saves: Math.floor(Math.random() * 500), isReal: false,
    }));
    const combined: any[] = [...db, ...mock];
    if (activeCategory === "For You") return combined;
    return combined.filter((r: any) => r.category === activeCategory);
  })();

  // Autoplay on scroll
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const idx = Math.round(feedRef.current.scrollTop / feedRef.current.clientHeight);
    if (idx !== activeIdx) {
      setActiveIdx(idx);
      // Pause all, play current
      videoRefs.current.forEach((v, key) => {
        if (key === allReels[idx]?.id) { v.play().catch(() => {}); }
        else { v.pause(); }
      });
      // Record view
      const reel = allReels[idx];
      if (reel?.isReal) axios.post(`${API}/${reel.id}/view`).catch(() => {});
    }
  }, [activeIdx, allReels]);

  // Double-tap like
  const handleDoubleTap = (reelId: string, creatorId: string) => {
    const now = Date.now();
    if (lastTap.current.id === reelId && now - lastTap.current.time < 400) {
      toggleLike(reelId);
      setHeartBurst(reelId);
      setTimeout(() => setHeartBurst(null), 800);
      // Floating emoji
      const id = emojiId.current++;
      setFloatingEmojis(prev => [...prev, { id, emoji: "❤️" }]);
      setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2000);
    }
    lastTap.current = { time: now, id: reelId };
  };

  // Like toggle
  const toggleLike = async (reelId: string) => {
    const token = localStorage.getItem("zilverse_token");
    const wasLiked = likedSet.has(reelId);
    setLikedSet(prev => { const s = new Set(prev); wasLiked ? s.delete(reelId) : s.add(reelId); return s; });
    if (token) {
      try { await axios.post(`${API}/${reelId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } }); }
      catch { setLikedSet(prev => { const s = new Set(prev); wasLiked ? s.add(reelId) : s.delete(reelId); return s; }); }
    }
  };

  // Comments
  const openComments = async (reelId: string) => {
    setCommentsOpen(reelId);
    try { const r = await axios.get(`${API}/${reelId}/comments`); setComments(r.data); }
    catch { setComments([]); }
  };
  const postComment = async () => {
    if (!commentText.trim() || !commentsOpen) return;
    const token = localStorage.getItem("zilverse_token");
    try {
      const r = await axios.post(`${API}/${commentsOpen}/comments`, { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => [r.data, ...prev]);
      setCommentText("");
    } catch { alert("Login required to comment"); }
  };

  // Share
  const copyLink = (reelId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/reels?id=${reelId}`);
    setShareOpen(null);
    alert("Link copied!");
  };

  // Upload
  const handlePublish = async () => {
    if (!uploadFile) return alert("Select a video first");
    setIsUploading(true);
    const fd = new FormData();
    fd.append("video", uploadFile);
    fd.append("title", uploadCaption || "New Reel");
    fd.append("description", uploadCaption);
    fd.append("category", uploadCat);
    fd.append("tags", uploadTags || "tech,startup");
    const token = localStorage.getItem("zilverse_token");
    try {
      await axios.post(`${API}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setUploadOpen(false); setUploadFile(null); setUploadCaption(""); setUploadTags("");
      // Refresh
      const r = await axios.get(`${API}?category=${activeCategory}`);
      setDbReels(r.data.reels || r.data || []);
    } catch (e: any) { alert("Upload failed: " + (e.response?.data?.error || e.message)); }
    finally { setIsUploading(false); }
  };

  // Donate
  const handleDonate = async () => {
    if (!donateOpen) return;
    const token = localStorage.getItem("zilverse_token");
    try {
      await axios.post(`${API}/donate`, {
        receiverId: donateOpen.creatorId, reelId: donateOpen.id,
        amount: donateAmount, message: donateMsg, currency: "USD"
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDonateOpen(null); setDonateMsg("");
      alert("Donation sent! 🎉");
    } catch { alert("Login required to donate"); }
  };

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>InnoReels</div>
        <div className={styles.topBarActions}>
          <button className={styles.iconBtn} onClick={() => setUploadOpen(true)}>📸</button>
          <button className={styles.iconBtn} onClick={() => window.history.back()}>✕</button>
        </div>
      </div>

      {/* Stories Bar */}
      <div className={styles.storiesBar}>
        <div className={styles.storyItem} onClick={() => setUploadOpen(true)}>
          <div className={styles.storyAdd}>+</div>
          <span className={styles.storyName}>Your Story</span>
        </div>
        {MOCK_STORIES.map(s => (
          <div key={s.user.id} className={styles.storyItem} onClick={() => setStoryViewer(s)}>
            <div className={styles.storyRing}>
              <img src={s.user.avatar} alt={s.user.name} className={styles.storyAvatar} />
            </div>
            <span className={styles.storyName}>{s.user.name}</span>
          </div>
        ))}
      </div>

      {/* Category Pills */}
      <div className={styles.categoryBar}>
        {REEL_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setActiveIdx(0); }}
            className={activeCategory === cat ? styles.catPillActive : styles.catPill}>{cat}</button>
        ))}
      </div>

      {/* Feed */}
      <div className={styles.feed} ref={feedRef} onScroll={handleScroll}>
        {allReels.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No reels in this category</h2>
            <p>Be the first to upload!</p>
            <button className={styles.publishBtn} onClick={() => setUploadOpen(true)} style={{maxWidth: 200}}>Upload Reel</button>
          </div>
        )}
        {allReels.map((reel: any, idx: number) => (
          <div key={reel.id + idx} className={styles.reelSlide}
            onClick={() => handleDoubleTap(reel.id, reel.creatorId)}>

            {/* Video / Gradient */}
            {reel.isReal && reel.videoUrl ? (
              <div className={styles.videoWrapper}>
                <video src={reel.videoUrl} loop playsInline muted={idx !== activeIdx}
                  autoPlay={idx === activeIdx}
                  ref={el => { if (el) videoRefs.current.set(reel.id, el); }} />
              </div>
            ) : (
              <div className={styles.gradientPlaceholder} style={{ background: reel.gradient }}>
                <div className={styles.placeholderIcon}>{reel.icon}</div>
                <div className={styles.playBtn}>▶</div>
              </div>
            )}

            {/* Heart Burst */}
            {heartBurst === reel.id && (
              <div className={styles.heartBurst}><span className={styles.heartIcon}>❤️</span></div>
            )}

            {/* Floating Emojis */}
            {floatingEmojis.map(e => (
              <div key={e.id} className={styles.floatingEmoji} style={{ right: 15 + Math.random() * 40 }}>{e.emoji}</div>
            ))}

            {/* Right Sidebar */}
            <div className={styles.sidebar}>
              {/* Creator Avatar */}
              <div className={styles.sideAction}>
                <img src={reel.avatar || "/avatars/avatar_1.png"} alt="" className={styles.creatorAvatar} />
                <div className={styles.followBadge}>+</div>
              </div>

              {/* Like */}
              <div className={styles.sideAction} onClick={e => { e.stopPropagation(); toggleLike(reel.id); }}>
                <div className={likedSet.has(reel.id) ? styles.actionIconLiked : styles.actionIcon}>
                  {likedSet.has(reel.id) ? "❤️" : "🤍"}
                </div>
                <span className={styles.actionCount}>{formatCount(reel.likes + (likedSet.has(reel.id) ? 1 : 0))}</span>
              </div>

              {/* Comment */}
              <div className={styles.sideAction} onClick={e => { e.stopPropagation(); openComments(reel.id); }}>
                <div className={styles.actionIcon}>💬</div>
                <span className={styles.actionCount}>{formatCount(reel.comments)}</span>
              </div>

              {/* Share */}
              <div className={styles.sideAction} onClick={e => { e.stopPropagation(); setShareOpen(reel.id); }}>
                <div className={styles.actionIcon}>↗️</div>
                <span className={styles.actionCount}>{formatCount(reel.shares)}</span>
              </div>

              {/* Donate */}
              <div className={styles.sideAction} onClick={e => { e.stopPropagation(); setDonateOpen(reel); }}>
                <div className={styles.actionIcon}>💎</div>
                <span className={styles.actionCount}>Tip</span>
              </div>

              {/* Save */}
              <div className={styles.sideAction} onClick={e => e.stopPropagation()}>
                <div className={styles.actionIcon}>🔖</div>
                <span className={styles.actionCount}>{formatCount(reel.saves || 0)}</span>
              </div>
            </div>

            {/* Bottom Info */}
            <div className={styles.bottomInfo}>
              <div className={styles.creatorRow}>
                <span className={styles.creatorName}>{reel.creator}</span>
                {reel.verified && <span className={styles.verifiedBadge}>✅</span>}
                <span className={styles.followTag}>Follow</span>
              </div>
              <p className={styles.caption}>{reel.title} — {reel.description}</p>
              <div className={styles.hashTags}>
                {reel.tags?.map((t: string, i: number) => (
                  <span key={i} className={styles.hashTag}>#{t.replace("#","")}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Comments Drawer ── */}
      {commentsOpen && (
        <div className={styles.commentsOverlay} onClick={() => setCommentsOpen(null)}>
          <div className={styles.commentsDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.commentsHeader}>
              <span className={styles.commentsTitle}>Comments ({comments.length})</span>
              <button className={styles.iconBtn} onClick={() => setCommentsOpen(null)} style={{width:32,height:32,fontSize:'0.9rem'}}>✕</button>
            </div>
            <div className={styles.commentsList}>
              {comments.length === 0 && <p style={{color:'#555',textAlign:'center',padding:'2rem 0'}}>No comments yet. Be the first!</p>}
              {comments.map((c: any) => (
                <div key={c.id} className={styles.commentItem}>
                  <img src={c.user?.avatar || "/avatars/avatar_1.png"} alt="" className={styles.commentAvatar} />
                  <div className={styles.commentBody}>
                    <span className={styles.commentUser}>{c.user?.name || "User"}</span>
                    <span className={styles.commentText}>{c.content}</span>
                    <div className={styles.commentMeta}>
                      <span>{timeAgo(c.createdAt)}</span>
                      <span>❤️ {c.likes || 0}</span>
                      <button className={styles.commentReplyBtn}>Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.commentInput}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && postComment()} />
              <button className={styles.commentSendBtn} onClick={postComment}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Sheet ── */}
      {shareOpen && (
        <div className={styles.shareOverlay} onClick={() => setShareOpen(null)}>
          <div className={styles.shareSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.shareTitle}>Share Reel</div>
            <div className={styles.shareGrid}>
              <div className={styles.shareItem} onClick={() => copyLink(shareOpen)}>
                <div className={styles.shareIcon} style={{background:'rgba(255,255,255,0.1)'}}>🔗</div>
                <span className={styles.shareLabel}>Copy Link</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}`); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#25d366'}}>💬</div>
                <span className={styles.shareLabel}>WhatsApp</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}&text=Check this out on ZilVerse!`); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#1da1f2'}}>🐦</div>
                <span className={styles.shareLabel}>X / Twitter</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}`); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#0a66c2'}}>💼</div>
                <span className={styles.shareLabel}>LinkedIn</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Donate Modal ── */}
      {donateOpen && (
        <div className={styles.donateOverlay} onClick={() => setDonateOpen(null)}>
          <div className={styles.donateSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.donateTitle}>💎 Support {donateOpen.creator}</div>
            <div className={styles.donateSubtitle}>Show your love with a donation</div>
            <div className={styles.donateAmounts}>
              {[2, 5, 10, 25, 50, 100].map(a => (
                <div key={a} onClick={() => setDonateAmount(a)}
                  className={donateAmount === a ? styles.donateAmountActive : styles.donateAmount}>${a}</div>
              ))}
            </div>
            <input className={styles.donateInput} placeholder="Leave a message (optional)"
              value={donateMsg} onChange={e => setDonateMsg(e.target.value)} />
            <button className={styles.donateBtn} onClick={handleDonate}>
              Send ${donateAmount} Donation 💎
            </button>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadOpen && (
        <div className={styles.uploadOverlay} onClick={() => setUploadOpen(false)}>
          <div className={styles.uploadModal} onClick={e => e.stopPropagation()}>
            <div className={styles.uploadTitle}>📸 Create New Reel</div>
            <input type="file" accept="video/*" ref={fileRef} style={{display:'none'}}
              onChange={e => e.target.files?.[0] && setUploadFile(e.target.files[0])} />
            <div className={uploadFile ? styles.dropzoneReady : styles.dropzone}
              onClick={() => fileRef.current?.click()}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>{uploadFile ? '✅' : '🎥'}</div>
              <div style={{color:'#fff',fontWeight:600,marginBottom:'0.25rem'}}>
                {uploadFile ? uploadFile.name : 'Tap to select video'}
              </div>
              <div style={{color:'#666',fontSize:'0.8rem'}}>MP4, WebM, MOV (Max 100MB)</div>
            </div>
            <input className={styles.uploadField} placeholder="Caption your reel..."
              value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} />
            <input className={styles.uploadField} placeholder="Tags (comma separated)"
              value={uploadTags} onChange={e => setUploadTags(e.target.value)} />
            <select className={styles.uploadField} value={uploadCat} onChange={e => setUploadCat(e.target.value)}>
              {REEL_CATEGORIES.filter(c => c !== "For You").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className={styles.publishBtn} onClick={handlePublish} disabled={isUploading}>
              {isUploading ? "Publishing..." : "🚀 Publish Reel"}
            </button>
          </div>
        </div>
      )}

      {/* ── Story Viewer ── */}
      {storyViewer && (
        <div className={styles.storyViewer} onClick={() => setStoryViewer(null)}>
          <div className={styles.storyProgress}>
            {storyViewer.stories.map((_: any, i: number) => (
              <div key={i} className={styles.storyProgressBar}>
                <div className={styles.storyProgressFill} style={{width:'100%'}} />
              </div>
            ))}
          </div>
          <div className={styles.storyUserInfo}>
            <img src={storyViewer.user.avatar} alt="" className={styles.storyUserAvatar} />
            <div>
              <div className={styles.storyUserName}>{storyViewer.user.name}</div>
              <div className={styles.storyTimeAgo}>2h ago</div>
            </div>
          </div>
          <div style={{position:'absolute',top:18,right:16,zIndex:10}}>
            <button className={styles.iconBtn} onClick={() => setStoryViewer(null)}>✕</button>
          </div>
          <div style={{
            width:'100%',height:'100%',
            background: `linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)`,
            display:'flex',alignItems:'center',justifyContent:'center',
            flexDirection:'column',gap:'1rem'
          }}>
            <div style={{fontSize:'4rem'}}>📸</div>
            <div style={{color:'#fff',fontWeight:700,fontSize:'1.1rem'}}>{storyViewer.user.name}&apos;s Story</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.85rem'}}>Tap to view next</div>
          </div>
        </div>
      )}
    </div>
  );
}
