import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { useAuth } from "@/contexts/AuthContext";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  import { useState } from "react";
  import { createReport } from "@/services/reportService"; // Giả sử bạn để API ở đây
  
  export default function ReportDialog({ open, selectedProduct, onClose }) {
    const { user } = useAuth();
    const [reportText, setReportText] = useState("");
  
    if (!selectedProduct) return null;
  
    const { order, productId, title: productTitle } = selectedProduct;
    const receiverId = order.products.find((el) => el.product.id === productId).product.sellerId;
    if(!receiverId) return null;

    const handleSubmit = async () => {
      const newReport = {
        receiverId: receiverId,
        senderId: user.id,
        orderId: order.id,
        productId,
        report: reportText,
        status: "sent",
      };
  
      try {
        await createReport(newReport);
        setReportText("");
        onClose();
      } catch (error) {
        console.error("Failed to send report:", error);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue with "{productTitle}"</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Describe the problem with the product..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={!reportText.trim()}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  