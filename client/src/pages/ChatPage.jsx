import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api.js";
import { Send, ArrowLeft } from "lucide-react";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMsgs = async () => {
      try {
        const { data } = await api.get(`/api/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };
    
    // Also fetch chat info for the header (we can just pull it from /my and filter, or a new endpoint if we had one. Let's just pull from /my for now as a quick hack)
    const fetchInfo = async () => {
      try {
        const { data } = await api.get("/api/chat/my", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const currentChat = data.find(c => c._id === chatId);
        if (currentChat) setChatInfo(currentChat);
      } catch (e) {
        console.error(e);
      }
    };

    fetchMsgs();
    fetchInfo();
  }, [chatId, userInfo.token]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", chatId);

    const handler = (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new-message", handler);
    return () => socket.off("new-message", handler);
  }, [socket, chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const { data } = await api.post(
        `/api/chat/${chatId}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      socket?.emit("send-message", {
        roomId: chatId, 
        chatId,
        text: data.text,
        sender: { _id: userInfo._id, name: userInfo.name },
        createdAt: data.createdAt,
      });

      setMessages((prev) => [...prev, data]); 
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const otherParticipant = chatInfo?.participants?.find(p => p._id !== userInfo._id);

  return (
    <div className="container mx-auto p-2 md:p-6 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 z-10 relative">
        <button onClick={() => navigate("/messages")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {chatInfo?.item?.imageUrl && (
          <img src={chatInfo.item.imageUrl} alt="item" className="w-12 h-12 rounded-lg object-cover" />
        )}
        <div>
          <h2 className="font-bold text-gray-900 dark:text-gray-100">{chatInfo?.item?.name || "Loading..."}</h2>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">with {otherParticipant?.name || "..."}</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-gray-50 dark:bg-gray-900 border-x border-gray-100 dark:border-gray-700 p-4 overflow-y-auto space-y-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">No messages yet. Say hi!</p>
          </div>
        )}
        {messages.map((m) => {
          // Socket messages might have nested sender object, DB messages just have the populated object or ID string
          const senderId = m.sender?._id || m.sender;
          const isMe = senderId === userInfo._id;
          
          return (
            <div key={m._id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                isMe 
                  ? 'bg-emerald-600 text-white rounded-br-sm' 
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
              }`}>
                <p className="break-words">{m.text}</p>
                <span className={`text-[10px] mt-1 block ${isMe ? 'text-emerald-100 text-right' : 'text-gray-400 dark:text-gray-500'}`}>
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={send} className="flex gap-2 relative">
          <input
            className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-full pl-4 pr-12 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 top-1.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
