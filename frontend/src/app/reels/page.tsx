"use client";
import { API_BASE } from "@/utils/api";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { REEL_CATEGORIES, ReelCategory } from "@/data/reels";
import styles from "./reels.module.css";

const API = `${API_BASE}/api/reels`;

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

const MOCK_STORIES: any[] = [];

export default function InnoReelsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ReelCategory>("For You");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dbReels, setDbReels] = useState<any[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [heartBurst, setHeartBurst] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);

  // Modals
  const [commentsOpen, setCommentsOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const [donateOpen, setDonateOpen] = useState<any>(null);
  const [creatorProfileOpen, setCreatorProfileOpen] = useState<any>(null);
  const [creatorProfileReels, setCreatorProfileReels] = useState<any[]>([]);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number>(5);
  const [donateMsg, setDonateMsg] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCat, setUploadCat] = useState("For You");
  const [uploadTags, setUploadTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [storyViewer, setStoryViewer] = useState<any>(null);

  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [creatorStats, setCreatorStats] = useState<any>(null);

  const [dbStories, setDbStories] = useState<any[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const lastTap = useRef<{ time: number; id: string }>({ time: 0, id: "" });
  let emojiId = useRef(0);

  // Fetch reels and stories
  useEffect(() => {
    (async () => {
      try {
        const [reelsRes, storiesRes] = await Promise.all([
          axios.get(`${API}?category=${activeCategory}`),
          axios.get(`${API}/stories/all`) // Use public or auth endpoint based on login status later
        ]);
        setDbReels(reelsRes.data.reels || reelsRes.data || []);
        setDbStories(storiesRes.data || []);
      } catch { 
        setDbReels([]); 
        setDbStories([]);
      }
    })();
  }, [activeCategory]);

  // Format reels
  const allReels = (() => {
    let db = dbReels.map((r: any) => ({
      id: r.id, videoUrl: r.videoUrl.startsWith('http') ? r.videoUrl : `${API_BASE}${r.videoUrl}`, title: r.title,
      description: r.description || "", creator: r.creator?.name || "Anonymous",
      creatorId: r.creatorId || r.creator?.id, handle: "@" + (r.creator?.name || "user").replace(/\s+/g,'').toLowerCase(),
      avatar: r.creator?.avatar || "/avatars/avatar_1.png", verified: r.creator?.verified,
      likes: r.likes || 0, comments: r.comments || 0, shares: r.shares || 0,
      views: r.views || 0, saves: r.saves || 0,
      category: r.category, tags: (r.tags || "").split(",").filter(Boolean),
      gradient: "linear-gradient(135deg, #18181b, #000)", icon: "🎥", isReal: true,
    }));
    return db;
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

  // Toggle Save
  const toggleSave = async (reelId: string) => {
    const token = localStorage.getItem("zilverse_token");
    const wasSaved = savedSet.has(reelId);
    setSavedSet(prev => {
      const next = new Set(prev);
      wasSaved ? next.delete(reelId) : next.add(reelId);
      return next;
    });
    if (token) {
      try { await axios.post(`${API}/${reelId}/save`, {}, { headers: { Authorization: `Bearer ${token}` } }); }
      catch { setSavedSet(prev => { const next = new Set(prev); wasSaved ? next.add(reelId) : next.delete(reelId); return next; }); }
    } else {
        alert("Login required to save");
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
  const recordShare = async (reelId: string) => {
    try {
      await axios.post(`${API}/${reelId}/share`);
    } catch (e) {
      console.error("Failed to record share");
    }
  };

  const copyLink = async (reelId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/reels?id=${reelId}`);
    setShareOpen(null);
    await recordShare(reelId);
    alert("Link copied! Share recorded.");
  };

  // Report
  const handleReport = async (reelId: string) => {
    const reason = prompt("Reason for reporting?");
    if (!reason) return;
    const token = localStorage.getItem("zilverse_token");
    if (!token) return alert("Login required to report.");
    try {
      await axios.post(`${API}/${reelId}/report`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Report submitted successfully.");
    } catch (e: any) {
      alert("Report failed: " + (e.response?.data?.error || e.message));
    }
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

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleDonate = async () => {
    if (!donateOpen) return;
    const token = localStorage.getItem("zilverse_token");
    if (!token) return alert("Login required to donate");

    const res = await loadRazorpay();
    if (!res) return alert("Failed to load Razorpay SDK");

    try {
      const orderData = await axios.post(`${API_BASE}/api/payments/razorpay/create-order`, {
        amount: donateAmount * 100, // typically paise/cents
        currency: "USD",
        receipt: `tip_${Date.now()}`
      }, { headers: { Authorization: `Bearer ${token}` } });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Sxuhmk2KLWNZx5",
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "ZilVerse InnoReels",
        description: `Tip for ${donateOpen.creator || 'Creator'}`,
        order_id: orderData.data.order_id,
        handler: async function (response: any) {
          try {
            await axios.post(`${API_BASE}/api/payments/razorpay/verify-payment`, {
              ...response,
              amount: donateAmount,
              currency: "USD",
              type: "PURCHASE",
              description: `Creator Tip: ${donateOpen.creator || 'Creator'}`,
              sellerId: donateOpen.creatorId
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            await axios.post(`${API}/donate`, {
              receiverId: donateOpen.creatorId, reelId: donateOpen.id,
              amount: donateAmount, message: donateMsg, currency: "USD"
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setDonateOpen(null); setDonateMsg("");
            alert("Donation sent successfully! 🎉");
          } catch (e) {
            alert("Payment verification failed");
          }
        },
        theme: { color: "#a855f7" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (e: any) {
      alert("Failed to initiate payment: " + (e.response?.data?.error || e.message));
    }
  };

  // Open Creator Dashboard
  const openDashboard = async () => {
    if (!user) return alert("Please login first.");
    setDashboardOpen(true);
    try {
      const r = await axios.get(`${API}/creator/${user.id}`);
      setCreatorStats(r.data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    }
  };

  const openCreatorProfile = async (creatorId: string) => {
    if (!creatorId) return;
    const token = localStorage.getItem("zilverse_token");
    try {
      const r = await axios.get(`${API}/creator/${creatorId}`);
      setCreatorProfileOpen(r.data);
      
      const r2 = await axios.get(`${API}/creator/${creatorId}/reels`);
      setCreatorProfileReels(r2.data);

      if (token) {
        const r3 = await axios.get(`${API}/follow/${creatorId}/status`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFollowingCreator(r3.data.following);
      }
    } catch (e) {
      console.error("Failed to load creator profile", e);
    }
  };

  const toggleFollowCreator = async () => {
    const token = localStorage.getItem("zilverse_token");
    if (!token) return alert("Please login to follow creators.");
    try {
      const r = await axios.post(`${API}/follow/${creatorProfileOpen.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsFollowingCreator(r.data.following);
      setCreatorProfileOpen((prev: any) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (r.data.following ? 1 : -1)
        }
      }));
    } catch (e) {
      console.error("Failed to toggle follow", e);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Nav Area */}
      <div className={styles.navArea}>
        <div className={styles.topBar}>
          <div className={styles.topBarTitle}>InnoReels</div>
          <div className={styles.topBarActions}>
            <button className={styles.iconBtn} onClick={openDashboard} title="Creator Dashboard">📊</button>
            <button className={styles.iconBtn} onClick={() => setUploadOpen(true)} title="Upload Reel">📸</button>
            <button className={styles.iconBtn} onClick={() => window.history.back()} title="Go Back">✕</button>
          </div>
        </div>

        {/* Stories Bar */}
        <div className={styles.storiesBar}>
          <div className={styles.storyItem} onClick={() => setUploadOpen(true)}>
            <div className={styles.storyAdd}>+</div>
            <span className={styles.storyName}>Your Story</span>
          </div>
          {dbStories.map(s => (
            <div key={s.user.id} className={styles.storyItem} onClick={() => setStoryViewer(s)}>
              <div className={styles.storyRing}>
                <Image src={s.user.avatar} alt={s.user.name} className={styles.storyAvatar} width={40} height={40} />
              </div>
              <span className={styles.storyName}>{s.user.name}</span>
            </div>
          ))}
        </div>

        {/* Category Pills */}
        <div className={styles.categoryBar}>
          <button 
            onClick={() => { setActiveCategory("Trending" as any); setActiveIdx(0); }}
            className={activeCategory === "Trending" ? styles.catPillActive : styles.catPill}
          >
            🔥 Trending
          </button>
          {REEL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setActiveIdx(0); }}
              className={activeCategory === cat ? styles.catPillActive : styles.catPill}>{cat}</button>
          ))}
        </div>
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
          <div key={reel.id + idx} className={styles.reelSlide} onClick={() => handleDoubleTap(reel.id, reel.creatorId)}>
            
            {/* Cinematic Background Blur */}
            <div className={styles.reelBackgroundBlurred} 
                 style={{ backgroundImage: `url(${reel.thumbnailUrl || '/assets/default-bg.png'})`, background: reel.gradient || '#0f0f11' }}>
            </div>

            <div className={styles.reelContent}>
              
              {/* Video Wrapper */}
              <div className={styles.videoWrapper}>
                {reel.isReal && reel.videoUrl ? (
                  <video src={reel.videoUrl} loop playsInline muted={idx !== activeIdx}
                    autoPlay={idx === activeIdx} preload={idx === activeIdx ? "auto" : "metadata"} className={styles.videoElement}
                    ref={el => { if (el) videoRefs.current.set(reel.id, el); }} />
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

                {/* Bottom Info inside Video Wrapper */}
                <div className={styles.bottomInfo} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.creatorRow} onClick={() => openCreatorProfile(reel.creatorId)}>
                    <img src={reel.avatar || "/avatars/avatar_1.png"} alt="" className={styles.creatorAvatarSmall} style={{cursor:'pointer'}} />
                    <div className={styles.creatorName} style={{cursor:'pointer'}}>{reel.creator || reel.handle}</div>
                    {reel.verified && <span className={styles.verifiedBadge}>✅</span>}
                  </div>
                  <div className={styles.caption}>{reel.title}</div>
                  <div className={styles.descriptionText}>{reel.description}</div>
                  <div className={styles.hashTags}>
                    {reel.tags.map((t: string) => <span key={t} className={styles.hashTag}>{t}</span>)}
                  </div>
                </div>

                <div className={styles.videoProgress}>
                  <div className={styles.videoProgressFill} style={{ width: idx === activeIdx ? '100%' : '0%' }}></div>
                </div>
              </div>

              {/* Right Sidebar Actions */}
              <div className={styles.sidebar}>
                {/* Creator Avatar */}
                <div className={styles.creatorAvatarWrapper} onClick={e => { e.stopPropagation(); openCreatorProfile(reel.creatorId); }}>
                  <img src={reel.avatar || "/avatars/avatar_1.png"} alt="" className={styles.creatorAvatarLarge} />
                  <div className={styles.followBadge}>+</div>
                </div>

                {/* Like */}
                <div className={styles.sideAction} onClick={e => { e.stopPropagation(); toggleLike(reel.id); }}>
                  <div className={likedSet.has(reel.id) ? styles.actionIconLiked : styles.actionIcon}>
                    {likedSet.has(reel.id) ? '❤️' : '🤍'}
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

                {/* Save */}
                <div className={styles.sideAction} onClick={(e) => { e.stopPropagation(); toggleSave(reel.id); }}>
                  <div className={savedSet.has(reel.id) ? styles.actionIconLiked : styles.actionIcon}>
                    {savedSet.has(reel.id) ? '🔖' : '📑'}
                  </div>
                  <span className={styles.actionCount}>{formatCount(reel.saves + (savedSet.has(reel.id) ? 1 : 0))}</span>
                </div>

                {/* Donate */}
                <div className={styles.sideAction} onClick={e => { e.stopPropagation(); setDonateOpen(reel); }}>
                  <div className={styles.actionIconDiamond}>💎</div>
                  <span className={styles.actionCount}>Tip</span>
                </div>

                {/* Report */}
                <div className={styles.sideAction} onClick={e => { e.stopPropagation(); handleReport(reel.id); }}>
                  <div className={styles.actionIcon}>🚩</div>
                  <span className={styles.actionCount}>Report</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ── Comments Drawer ── */}
      {commentsOpen && (
        <div className={styles.overlay} onClick={() => setCommentsOpen(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Comments ({comments.length})</span>
              <button className={styles.closeSheetBtn} onClick={() => setCommentsOpen(null)}>✕</button>
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
            <div className={styles.commentInputArea}>
              <input type="text" className={styles.commentInput} value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && postComment()} />
              <button className={styles.commentSendBtn} onClick={postComment}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Sheet ── */}
      {shareOpen && (
        <div className={styles.overlay} onClick={() => setShareOpen(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Share Reel</div>
              <button className={styles.closeSheetBtn} onClick={() => setShareOpen(null)}>✕</button>
            </div>
            <div className={styles.shareGrid}>
              <div className={styles.shareItem} onClick={() => copyLink(shareOpen)}>
                <div className={styles.shareIcon} style={{background:'rgba(255,255,255,0.1)'}}>🔗</div>
                <span className={styles.shareLabel}>Copy Link</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}`); recordShare(shareOpen); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#25d366'}}>💬</div>
                <span className={styles.shareLabel}>WhatsApp</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}&text=Check this out on ZilVerse!`); recordShare(shareOpen); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#1da1f2'}}>🐦</div>
                <span className={styles.shareLabel}>X / Twitter</span>
              </div>
              <div className={styles.shareItem} onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin+'/reels?id='+shareOpen)}`); recordShare(shareOpen); setShareOpen(null); }}>
                <div className={styles.shareIcon} style={{background:'#0a66c2'}}>💼</div>
                <span className={styles.shareLabel}>LinkedIn</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Donate Modal ── */}
      {donateOpen && (
        <div className={styles.overlay} onClick={() => setDonateOpen(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Support {donateOpen.creator} 💎</div>
              <button className={styles.closeSheetBtn} onClick={() => setDonateOpen(null)}>✕</button>
            </div>
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
        <div className={styles.overlay} onClick={() => setUploadOpen(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
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
            <Image src={storyViewer.user.avatar} alt="" className={styles.storyUserAvatar} width={40} height={40} />
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
      {/* ── Creator Profile Modal ── */}
      {creatorProfileOpen && (
        <div className={styles.overlay} onClick={() => setCreatorProfileOpen(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()} style={{maxWidth: '600px', padding: 0}}>
            {/* Header / Cover */}
            <div style={{height: '120px', background: 'linear-gradient(135deg, #a855f7, #0ea5e9)', position: 'relative'}}>
              <button className={styles.closeSheetBtn} onClick={() => setCreatorProfileOpen(null)} 
                style={{position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)'}}>✕</button>
            </div>
            
            <div style={{padding: '0 1.5rem 1.5rem', position: 'relative'}}>
              {/* Avatar & Follow Btn */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', marginBottom: '1rem'}}>
                <img src={creatorProfileOpen.avatar || "/avatars/avatar_1.png"} alt="" 
                  style={{width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #18181b', objectFit: 'cover'}} />
                
                <button onClick={toggleFollowCreator} style={{
                  padding: '0.6rem 1.5rem', borderRadius: '99px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                  border: isFollowingCreator ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  background: isFollowingCreator ? 'transparent' : '#fff',
                  color: isFollowingCreator ? '#fff' : '#000'
                }}>
                  {isFollowingCreator ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* Info */}
              <div style={{marginBottom: '1rem'}}>
                <h2 style={{margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  {creatorProfileOpen.name || 'Anonymous'}
                  {creatorProfileOpen.verified && <span style={{fontSize: '1rem'}}>✅</span>}
                </h2>
                <p style={{margin: '0.2rem 0', color: '#a1a1aa', fontSize: '0.9rem'}}>@{creatorProfileOpen.name?.replace(/\s+/g,'').toLowerCase() || 'user'}</p>
                <p style={{marginTop: '0.5rem', color: '#e4e4e7', fontSize: '0.95rem', lineHeight: 1.5}}>{creatorProfileOpen.bio || 'Building the future of innovation.'}</p>
              </div>

              {/* Stats */}
              <div style={{display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', marginBottom: '1.5rem'}}>
                <div style={{textAlign: 'center'}}><strong style={{color:'#fff', display:'block', fontSize:'1.1rem'}}>{formatCount(creatorProfileOpen._count?.following || 0)}</strong><span style={{color:'#a1a1aa', fontSize:'0.8rem'}}>Following</span></div>
                <div style={{textAlign: 'center'}}><strong style={{color:'#fff', display:'block', fontSize:'1.1rem'}}>{formatCount(creatorProfileOpen._count?.followers || 0)}</strong><span style={{color:'#a1a1aa', fontSize:'0.8rem'}}>Followers</span></div>
                <div style={{textAlign: 'center'}}><strong style={{color:'#fff', display:'block', fontSize:'1.1rem'}}>{formatCount(creatorProfileOpen.totalLikes || 0)}</strong><span style={{color:'#a1a1aa', fontSize:'0.8rem'}}>Likes</span></div>
                <div style={{textAlign: 'center'}}><strong style={{color:'#fff', display:'block', fontSize:'1.1rem'}}>{formatCount(creatorProfileOpen.totalViews || 0)}</strong><span style={{color:'#a1a1aa', fontSize:'0.8rem'}}>Views</span></div>
              </div>

              {/* Grid of Reels */}
              <h3 style={{color: '#fff', fontSize: '1rem', marginBottom: '1rem'}}>Reels</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', maxHeight: '40vh', overflowY: 'auto'}}>
                {creatorProfileReels.map((r: any) => (
                  <div key={r.id} style={{aspectRatio: '9/16', background: '#27272a', position: 'relative', cursor: 'pointer'}}>
                    <video src={r.videoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div style={{position: 'absolute', bottom: 4, left: 6, color: '#fff', fontSize: '0.75rem', fontWeight: 600, textShadow: '0 1px 2px #000'}}>
                      ▶ {formatCount(r.views)}
                    </div>
                  </div>
                ))}
                {creatorProfileReels.length === 0 && <p style={{gridColumn: '1 / -1', color: '#71717a', textAlign: 'center', padding: '2rem 0'}}>No reels yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Creator Dashboard ── */}
      {dashboardOpen && (
        <div className={styles.overlay} onClick={() => setDashboardOpen(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className={styles.uploadTitle}>📊 Creator Dashboard</div>
            
            {creatorStats ? (
              <div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '800', color: '#a855f7'}}>{formatCount(creatorStats.totalViews || 0)}</div>
                    <div style={{fontSize: '0.8rem', color: '#888'}}>Total Views</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '800', color: '#10b981'}}>${creatorStats.totalDonations?.toFixed(2) || "0.00"}</div>
                    <div style={{fontSize: '0.8rem', color: '#888'}}>Earnings</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '800', color: '#0ea5e9'}}>{formatCount(creatorStats._count?.followers || 0)}</div>
                    <div style={{fontSize: '0.8rem', color: '#888'}}>Followers</div>
                  </div>
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '800', color: '#f59e0b'}}>{formatCount(creatorStats.totalLikes || 0)}</div>
                    <div style={{fontSize: '0.8rem', color: '#888'}}>Total Likes</div>
                  </div>
                </div>

                <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem'}}>
                  <h4 style={{marginTop: 0, marginBottom: '1rem', color: '#ccc'}}>Recent Performance</h4>
                  <div style={{display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                    <span>Reels Published</span>
                    <strong style={{color: '#fff'}}>{creatorStats._count?.reels || 0}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                    <span>Shares Generated</span>
                    <strong style={{color: '#fff'}}>{creatorStats.totalShares || 0}</strong>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem'}}>
                    <span>Donations Received</span>
                    <strong style={{color: '#fff'}}>{creatorStats.donationCount || 0}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', color: '#888', padding: '2rem'}}>Loading analytics...</div>
            )}
            
            <button className={styles.publishBtn} onClick={() => setDashboardOpen(false)} style={{marginTop: '1.5rem'}}>
              Close Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
