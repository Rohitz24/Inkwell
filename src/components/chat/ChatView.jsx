import React, { useState, useEffect, useRef } from "react";
import { Send, Search, CheckCheck, MessageCircle, UserCheck, Mail, Users } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function ChatView({ profile, following = [], subscribers = [], allArticles = [] }) {
  // Build dynamic real contacts from followed authors and subscribers
  const dynamicContacts = React.useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Add authors you follow
    following.forEach((authorId) => {
      if (authorId === profile?.id) return;
      seenIds.add(authorId);

      // Lookup details from articles or derive cleanly
      const foundArticle = allArticles.find(
        (a) => a.authorId === authorId || a.author_id === authorId
      );
      const name = foundArticle?.author || authorId.replace("user_", "").replace("_", " ").toUpperCase();
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      list.push({
        id: authorId,
        name: name,
        handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
        avatar: initials || "AU",
        type: "following",
        role: "Followed Writer",
      });
    });

    // 2. Add newsletter subscribers
    subscribers.forEach((email) => {
      const subscriberId = `sub_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      if (seenIds.has(subscriberId)) return;
      seenIds.add(subscriberId);

      const username = email.split("@")[0];
      const initials = username.slice(0, 2).toUpperCase();

      list.push({
        id: subscriberId,
        name: username,
        handle: email,
        avatar: initials,
        type: "subscriber",
        role: "Newsletter Subscriber",
      });
    });

    return list;
  }, [following, subscribers, allArticles, profile]);

  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("inkwell_direct_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Set default active contact when list updates
  useEffect(() => {
    if (dynamicContacts.length > 0) {
      if (!activeContact || !dynamicContacts.some((c) => c.id === activeContact.id)) {
        setActiveContact(dynamicContacts[0]);
      }
    } else {
      setActiveContact(null);
    }
  }, [dynamicContacts, activeContact]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem("inkwell_direct_messages", JSON.stringify(messages));
  }, [messages]);

  // Supabase Realtime Sync
  useEffect(() => {
    async function loadMessages() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && data) {
          setMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m.id, m));
            data.forEach((m) =>
              map.set(m.id, {
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_name,
                senderAvatar: m.sender_avatar,
                recipientId: m.recipient_id,
                content: m.content,
                time: new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })
            );
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Could not load direct messages:", err);
      }
    }

    loadMessages();

    if (!supabase) return;

    const channel = supabase
      .channel("public:direct_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const row = payload.new;
          const newMsg = {
            id: row.id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            senderAvatar: row.sender_avatar,
            recipientId: row.recipient_id,
            content: row.content,
            time: new Date(row.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeConversation = activeContact
    ? messages.filter(
        (m) =>
          (m.senderId === profile?.id && m.recipientId === activeContact.id) ||
          (m.senderId === activeContact.id && m.recipientId === profile?.id)
      )
    : [];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    const messagePayload = {
      id: `msg-${Date.now()}`,
      senderId: profile?.id || "user_rohit",
      senderName: profile?.name || "Rohit Zade",
      senderAvatar: profile?.avatar || "RZ",
      recipientId: activeContact.id,
      content: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, messagePayload]);
    setInputText("");

    if (supabase) {
      try {
        await supabase.from("direct_messages").insert([
          {
            id: messagePayload.id,
            sender_id: messagePayload.senderId,
            sender_name: messagePayload.senderName,
            sender_avatar: messagePayload.senderAvatar,
            recipient_id: messagePayload.recipientId,
            content: messagePayload.content,
          },
        ]);
      } catch (err) {
        console.warn("Could not sync direct message:", err);
      }
    }
  };

  const filteredContacts = dynamicContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-5rem)]">
      <div className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-2xl h-full flex overflow-hidden shadow-sm">
        
        {/* Left: Contact Directory */}
        <div className="w-80 border-r border-editorial-border dark:border-[#2C2C2C] flex flex-col bg-neutral-50/50 dark:bg-[#151515]">
          <div className="p-4 border-b border-editorial-border dark:border-[#2C2C2C]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Messages
              </h2>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-[#2C2C2C] px-2 py-0.5 rounded-full">
                {dynamicContacts.length} connected
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search followers & subscribers..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#202020] border border-editorial-border dark:border-[#333] rounded-lg text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-[#242424]">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 dark:text-neutral-500 space-y-2">
                <Users className="w-6 h-6 mx-auto opacity-40" />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  No connections yet
                </p>
                <p className="text-[11px] leading-relaxed">
                  Follow authors in the Feed or collect email subscribers on your articles to start chatting.
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const lastMsg = messages
                  .filter(
                    (m) =>
                      (m.senderId === profile?.id && m.recipientId === contact.id) ||
                      (m.senderId === contact.id && m.recipientId === profile?.id)
                  )
                  .slice(-1)[0];

                const isActive = activeContact?.id === contact.id;

                return (
                  <div
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-neutral-200/70 dark:bg-[#252525]"
                        : "hover:bg-neutral-100 dark:hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-serif text-xs font-bold">
                        {contact.avatar}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {contact.name}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                            {lastMsg.time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {contact.type === "following" ? (
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                            <UserCheck className="w-3 h-3" /> Followed
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                            <Mail className="w-3 h-3" /> Subscriber
                          </span>
                        )}
                        <span className="truncate font-sans">• {lastMsg ? lastMsg.content : contact.handle}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Pane */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1A1A1A]">
          {activeContact ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-editorial-border dark:border-[#2C2C2C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-serif text-xs font-bold">
                    {activeContact.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white leading-tight">
                      {activeContact.name}
                    </h3>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
                      {activeContact.handle}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-serif italic">
                  {activeContact.role}
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
                {activeConversation.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 dark:text-neutral-500 space-y-2">
                    <MessageCircle className="w-8 h-8 opacity-40" />
                    <p className="font-serif text-sm">No messages yet with {activeContact.name}.</p>
                    <span className="text-xs">
                      Send a message to discuss publications, collaboration, or feedback.
                    </span>
                  </div>
                ) : (
                  activeConversation.map((msg) => {
                    const isMe = msg.senderId === profile?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-br-none"
                              : "bg-neutral-100 dark:bg-[#262626] text-neutral-900 dark:text-neutral-100 rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 px-1">
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-neutral-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-editorial-border dark:border-[#2C2C2C] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write to ${activeContact.name}...`}
                  className="flex-1 text-xs sm:text-sm border border-editorial-border dark:border-[#333] rounded-xl px-4 py-2.5 bg-neutral-50 dark:bg-[#151515] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition shrink-0"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-neutral-500">
              <Users className="w-10 h-10 opacity-30 mb-3" />
              <h3 className="font-serif text-base text-neutral-800 dark:text-neutral-200 font-bold mb-1">
                No conversation selected
              </h3>
              <p className="text-xs max-w-sm">
                Follow writers in the Feed or get newsletter subscribers to open a chat channel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}