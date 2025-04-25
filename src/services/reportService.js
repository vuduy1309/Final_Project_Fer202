import axiosInstance from "./axiosInstance";

export async function getReports() {
  const response = await axiosInstance.get("/reports");
  return response.data;
}

export async function getSenderReports(userId) {
  const response = await axiosInstance.get("/reports?senderId=" + userId);
  return response.data;
}

export async function getReceiverReports(userId) {
  const response = await axiosInstance.get("/reports?receiverId=" + userId);
  return response.data;
}

export async function createReport(newReport) {
  const response = await axiosInstance.post("/reports", newReport);
  return response.data;
}

export async function updateReport(reportId, updateStatus) {
  const response = await axiosInstance.patch(`/reports/${reportId}`, {
    status: updateStatus, 
  });
  return response.data;
}
