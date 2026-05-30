// client/src/components/NotificationBtn.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api.js";

const NotificationBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useContext(AuthContext);

  const fetchRequests = async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data: sentData } = await api.get("/api/requests/sent", config);
      const { data: receivedData } = await api.get(
        "/api/requests/received",
        config
      );
      setSentRequests(sentData);
      setReceivedRequests(receivedData);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchRequests();
    }
    setIsOpen(!isOpen);
  };

  
  const unreadCount = receivedRequests.filter(
    (req) => req.status === "Pending"
  ).length;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative text-gray-600 hover:text-blue-500"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          ></path>
        </svg>
       
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
          <div className="p-4 font-bold border-b">Notifications</div>
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
           
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2">
                  Requests for Your Items
                </h3>
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((req) => (
                    <div key={req._id} className="p-2 border-b text-sm">
                    
                      {req.item ? (
                        <p>
                          <span className="font-bold">
                            {req.requester.name}
                          </span>{" "}
                          requested{" "}
                          <Link
                            to={`/item/${req.item._id}`}
                            className="font-bold hover:underline"
                            onClick={() => setIsOpen(false)}
                          >
                            {req.item.name}
                          </Link>
                        </p>
                      ) : (
                        <p>
                          <span className="font-bold">
                            {req.requester.name}
                          </span>{" "}
                          requested an item that has been deleted.
                        </p>
                      )}
                    
                      <p className="text-xs text-gray-500">{req.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    No one has requested your items yet.
                  </p>
                )}
              </div>

           
              <div className="p-4 bg-gray-50">
                <h3 className="font-semibold text-sm mb-2">
                  Your Sent Requests
                </h3>
                {sentRequests.length > 0 ? (
                  sentRequests.map((req) => (
                    <div key={req._id} className="p-2 border-b text-sm">
                     
                      {req.item ? (
                        <p>
                          You requested{" "}
                          <Link
                            to={`/item/${req.item._id}`}
                            className="font-bold hover:underline"
                            onClick={() => setIsOpen(false)}
                          >
                            {req.item.name}
                          </Link>{" "}
                          from{" "}
                          <span className="font-bold">{req.owner.name}</span>
                        </p>
                      ) : (
                        <p>You requested an item that has been deleted.</p>
                      )}
                     
                      <p className="text-xs text-gray-500">{req.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    You haven't requested any items.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBtn;
