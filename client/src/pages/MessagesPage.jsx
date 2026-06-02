import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api.js";
import { MessageSquare, Clock } from "lucide-react";

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await api.get("/api/chat/my", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };
    fetchChats();
  }, [userInfo.token]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
          <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Messages</h1>
      </div>

      <div className="space-y-4">
        {chats.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No conversations yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start chatting with item owners to see them here.</p>
          </div>
        )}

        {chats.map((chat) => {
          const otherParticipant = chat.participants.find(p => p._id !== userInfo._id);
          const latest = chat.latestMessage;

          return (
            <Link 
              key={chat._id} 
              to={`/chat/${chat._id}`} 
              className="block group"
            >
              <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-emerald-200 dark:group-hover:border-emerald-700">
                
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  {chat.item?.imageUrl ? (
                    <img src={chat.item.imageUrl} alt={chat.item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                      {chat.item?.name || "Unknown Item"}
                    </h3>
                    {latest && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(latest.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    with {otherParticipant?.name || "Unknown User"}
                  </p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {latest ? (
                      <span className={latest.sender === userInfo._id ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}>
                        {latest.sender === userInfo._id ? "You: " : ""}
                        {latest.text}
                      </span>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesPage;
