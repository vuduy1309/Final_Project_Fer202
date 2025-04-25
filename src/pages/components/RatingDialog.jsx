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
import { Star } from "lucide-react";

import { rateProduct } from "../../services/orderService";

export default function RatingDialog({
    open,
    selectedProduct,
    onClose,
}) {
    const { order, productId, productTitle } = selectedProduct;
    const { user } = useAuth();

    const [rating, setRating] = useState(0);

    const [comment, setComment] = useState("");

    const handleRating = (value) => {
        setRating(value);
    };

    const handleSubmit = async () => {
        const updatedItems = order.items.map((item) =>
            item.productId === productId
                ? { ...item, rating, comment }
                : item
        );
        const updatedOrder = { ...order, items: updatedItems };
        await rateProduct(order.id, updatedOrder, productId, rating, comment, user.name, user.avatarUrl);
        setRating(0);
        setComment("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rate {productTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                            key={value}
                            className="w-6 h-6 cursor-pointer transition-colors"
                            onClick={() => handleRating(value)}
                            fill={rating >= value ? "#facc15" : "none"}
                            stroke={rating >= value ? "#facc15" : "currentColor"}
                        />
                    ))}
                </div>
                <Textarea
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={rating === 0}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
