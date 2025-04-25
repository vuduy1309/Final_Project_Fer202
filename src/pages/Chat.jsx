import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, PlusCircle } from "lucide-react";
import { getChatsByUser, addMessageToChat, getChatById, createChat } from "@/services/chatService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {getUserById} from "@/services/authService"
import { getUsersByEmail, getUsers } from "../services/authService";
import { useLocation } from "react-router-dom";

export default function Chat() {
  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const chatIdFromQuery = queryParams.get("chatId");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [newChatUserIdentifier, setNewChatUserIdentifier] = useState("");
  const { user } = useAuth();
  const [otherUsersInfo, setOtherUsersInfo] = useState({});
  const [chatUser, setChatUser] = useState(null);
  const [listUsers, setListUsers] = useState([]);

  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        const users = await getUsers();
        const listIdRemove = chats.map((c) => c.participants.flatMap((p) => p)).flat();
        listIdRemove.push(user.id);
        setListUsers(users.filter((u) => !listIdRemove.includes(u.id)));
      } catch (error) {
        console.error("Error fetching chat user:", error);
      }
    };  
    fetchChatUser();
    }
  ,[chats])

  useEffect(() => {
    const fetchOtherUsers = async () => {
      if (chats && user?.id) {
        const participantIds = new Set();
        chats.forEach((chat) => {
          chat.participants.forEach((participantId) => {
            if (participantId !== user.id) {
              participantIds.add(participantId);
            }
          });
        });

        const usersInfo = {};
        for (const id of participantIds) {
          try {
            const otherUser = await getUserById(id);
            if (otherUser) {
              usersInfo[id] = otherUser;
            }
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
        setOtherUsersInfo(usersInfo);
      }
    };

    fetchOtherUsers();
  }, [chats, user?.id]);
  
  useEffect(() => {
    const fetchUserChats = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user && user.id) {
          const userChats = await getChatsByUser(user.id);
          setChats(userChats.filter((chat) => chat.participants.includes(user.id)));
        }
      } catch (err) {
        console.error("Error fetching user chats:", err);
        setError("Failed to load user chats");
      } finally {
        setLoading(false);
      }
    };

    fetchUserChats();
  }, [user?.id, activeChatId]);

  useEffect(() => {
    let intervalId;
  
    const fetchChatMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const chatData = await getChatById(activeChatId);
        if (chatData && chatData.messages) {
          setMessages(chatData.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching chat messages:", err);
        setError("Failed to load chat messages");
      } finally {
        setLoading(false);
      }
    };
  
    if (activeChatId) {
      fetchChatMessages();
      intervalId = setInterval(fetchChatMessages, 1000); 
    }
  
    return () => {
      clearInterval(intervalId);
    };
  }, [activeChatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeChatId) {
      try {
        const updatedChat = [...messages, {
          senderId: user.id,
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
        }]
        const response = await addMessageToChat(activeChatId, updatedChat);
        if (response && response.messages) {
          setMessages(response.messages);
          setNewMessage("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleCreateNewChat = async () => {
    if (newChatUserIdentifier.email.trim()) {
      try {
        const otherUser = await getUsersByEmail(newChatUserIdentifier.email);
        if (!otherUser) {
          toast.error("User not found");
          return;
        }

        const newChat = await createChat(user.id, otherUser[0].id, "someProductId");
        if (newChat && newChat.id) {
          setChats([...chats, newChat]);
          setActiveChatId(newChat.id);
          setOtherUsersInfo(otherUser[0]);
          setNewChatUserIdentifier("");
          toast.success("Chat created");
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to create chat");
      }
    }
  };

  useEffect(() => {
    if (chatIdFromQuery) {
      setActiveChatId(chatIdFromQuery);
    }
  }, [chatIdFromQuery]);

  return (
    <div className="flex h-[70vh]">
      <div className="w-80 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        
        <div className="mb-4">
          <select
            value={newChatUserIdentifier.id || ""}
            onChange={(e) => setNewChatUserIdentifier(listUsers.find((user) => user.id === e.target.value))}
            className="mb-2 w-full p-2 border rounded-md"
          >
            <option value="">Select User</option>
            {listUsers.map((otherUser) => (
              <option key={otherUser.id} value={otherUser.id}>
                {otherUser.name} ({otherUser.email})
              </option>
            ))}
          </select>
          <Button
            onClick={handleCreateNewChat}
            disabled={!newChatUserIdentifier.id}
            size="sm"
            className="w-full"
          >
            <PlusCircle className="mr-2" size={16} /> New Chat
          </Button>
        </div>
        {chats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chats yet.</p>
        ) : (
          chats?.map((chat) => {
            const otherParticipantId = chat.participants.find((id) => id !== user?.id);
            const otherUser = otherUsersInfo[otherParticipantId];
            const otherUserName = otherUser?.name || "Unknown User";
            const otherUserAvatarUrl = otherUser?.avatarUrl || "";

            return (
              <div
                key={chat.id} // Đảm bảo key là duy nhất, thường là chat.id
                className={`p-2 rounded-md hover:bg-gray-200 cursor-pointer ${activeChatId === chat.id ? "bg-gray-200" : ""
                  }`}
                onClick={() => {
                  setActiveChatId(chat.id);
                   setChatUser(otherUser); 
                }}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6 p-4 border-1">
                    <AvatarImage src={otherUserAvatarUrl} alt={otherUserName} />
                    <AvatarFallback>{otherUserName?.substring(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{otherUser?.email}</p>
                </div>
              </div>
            );
          })
        )}

      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          {activeChatId ? (
            <h1 className="text-xl font-bold">Chat</h1>
          ) : (
            <h1 className="text-xl font-bold">Select a Chat</h1>
          )}
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
            >
              {msg.senderId !== user?.id && (
                <Avatar className="w-8 h-8 mr-2 border-1">
                  <AvatarImage src={chatUser?.avatarUrl} alt="Other User" />
                  <AvatarFallback>{chatUser?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-md p-2 text-sm ${msg.senderId === user?.id ? "bg-primary-foreground text-primary" : "bg-secondary-foreground text-secondary"
                  }`}
              >
                {msg.content}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {msg.senderId === user?.id && (
                <Avatar className="w-8 h-8 ml-2 border-1">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        {activeChatId && (
          <div className="p-4 border-t">
            <div className="flex items-center">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message..."
                className="flex-grow mr-2"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="mr-2" size={16} /> Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}