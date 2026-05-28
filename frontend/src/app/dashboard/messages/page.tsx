"use client";
import { API_BASE } from "@/utils/api";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/utils/socket";
import styles from "./messages.module.css";

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch contacts
  const fetchContacts = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/api/chat/contacts?userId=${user.id}`);
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to load chat contacts", err);
    }
  };

  // 2. Fetch history with active contact
  const fetchHistory = async (partnerId: string) => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/api/chat/history/${partnerId}?userId=${user.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load message history", err);
    }
  };

  // Load contacts initially
  useEffect(() => {
    fetchContacts();
  }, [user]);

  // Load history when contact changes
  useEffect(() => {
    if (activeContact) {
      fetchHistory(activeContact.id);
      
      // Update unread status in local state
      setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, unread: false } : c));
    } else {
      setMessages([]);
    }
  }, [activeContact]);

  // Socket listener for real-time messages
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      console.log("[SOCKET] New chat message received:", msg);
      
      // Check if message belongs to active chat
      if (activeContact && (msg.senderId === activeContact.id || msg.senderId === user?.id)) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      
      // Refresh contact list preview
      fetchContacts();
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [activeContact, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeContact || !inputText.trim()) return;

    const text = inputText;
    setInputText("");

    try {
      await axios.post(`${API_BASE}/api/chat/send`, {
        userId: user.id,
        receiverId: activeContact.id,
        content: text
      });
      // Clear input, socket listener handles appends
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  return (
    <div className={styles.shell}>
      {/* Sidebar - Contacts List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>ZilVerse Messenger</h2>
          <input 
            type="text" 
            placeholder="Search contacts, roles..." 
            className={styles.searchBar} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.contactList}>
          {filteredContacts.map(c => {
            const isSelected = activeContact?.id === c.id;
            return (
              <div 
                key={c.id} 
                className={`${styles.contactItem} ${isSelected ? styles.activeContact : ""}`}
                onClick={() => setActiveContact(c)}
              >
                <div className={styles.avatarWrapper}>
                  <Image 
                    src={c.avatar || "/avatars/avatar_1.png"} 
                    alt={c.name}
                    width={44}
                    height={44}
                    className={styles.avatar}
                  />
                  <div className={styles.onlineBadge} />
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactName}>
                    <span>{c.name}</span>
                    <span className={styles.roleBadge}>{c.role}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <span className={styles.lastMessage}>
                      {c.lastMessage || "No messages yet"}
                    </span>
                    {c.unread && <div className={styles.unreadDot} />}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredContacts.length === 0 && (
            <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem 1rem', fontSize: '0.85rem' }}>
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className={styles.chatArea}>
        {activeContact ? (
          <>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.avatarWrapper}>
                <Image 
                  src={activeContact.avatar || "/avatars/avatar_1.png"} 
                  alt={activeContact.name}
                  width={44}
                  height={44}
                  className={styles.avatar}
                />
              </div>
              <div className={styles.chatHeaderInfo}>
                <h3>{activeContact.name}</h3>
                <span>Active Now</span>
              </div>
            </div>

            {/* Message History */}
            <div className={styles.messageHistory}>
              {messages.map(m => {
                const isSent = m.senderId === user?.id;
                return (
                  <div 
                    key={m.id} 
                    className={`${styles.messageBubbleWrapper} ${isSent ? styles.messageSent : styles.messageReceived}`}
                  >
                    <div className={`${styles.messageBubble} ${isSent ? styles.bubbleSent : styles.bubbleReceived}`}>
                      {m.content}
                    </div>
                    <span className={styles.messageTime}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form className={styles.inputArea} onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                className={styles.messageInput}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className={styles.sendButton}>Send →</button>
            </form>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>💬</div>
            <h3>Your Workspace Workspace</h3>
            <p>Select a developer or client from the list to begin collaborating.</p>
          </div>
        )}
      </div>
    </div>
  );
}
