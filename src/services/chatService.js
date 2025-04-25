import axiosInstance from "./axiosInstance";

export async function getChats() {
  const response = await axiosInstance.get("/chats");
  return response.data;
}

export async function getChatById(chatId) {
  const response = await axiosInstance.get(`/chats/${chatId}`);
  return response.data;
}

export async function getChatsByUser(userId) {
  const response = await axiosInstance.get(`/chats`, { params: { participants: userId } });
  return response.data;
}

export async function createChat(buyerId, sellerId, productId) {
  const newChat = {
    participants: [buyerId, sellerId],
    messages: [], 
  };
  const response = await axiosInstance.post("/chats", newChat);
  return response.data;
}

export async function addMessageToChat(chatId, updatedChat) {
  const response = await axiosInstance.patch(`/chats/${chatId}`, {
    messages: updatedChat, 
  });
  return response.data;
}

export async function deleteChat(chatId) {
  const response = await axiosInstance.delete(`/chats/${chatId}`);
  return response.data;
}