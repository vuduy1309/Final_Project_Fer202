import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByUser } from "@/services/orderService";
import { getProductById } from "@/services/productService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, User, Package, Settings, Star } from "lucide-react";
import { getSenderReports, getReceiverReports, updateReport } from "@/services/reportService";
import RatingDialog from "./components/RatingDialog";
import ReportDialog from "./components/ReportDialog";
import { getUserById } from "@/services/authService";

export default function UserProfile() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listUserReports, setListUserReports] = useState([]);
  const [listProductsReports, setListProductsReports] = useState([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userOrders = await getOrdersByUser(user.id);
        const ordersWithProducts = await Promise.all(
          userOrders.map(async (order) => {
            const productsPromises = order.items.map(async (item) => {
              try {
                const product = await getProductById(item.productId);
                return { product: product || null, quantity: item.quantity };
              } catch (error) {
                console.error(
                  `Error fetching product ${item.productId}:`,
                  error
                );
                return { product: null, quantity: item.quantity };
              }
            });
            const products = await Promise.all(productsPromises);
            return { ...order, products };
          })
        );
        setOrders(ordersWithProducts);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchUserReports = async () => {
      if (!user) return;
      setLoading(true);
      try {
        var listReports = [];
        if (user.role != "seller") {
          listReports = await getSenderReports(user.id);
        } else {
          listReports = await getReceiverReports(user.id);

          const listUserReportsData = await Promise.all(
            listReports.map((report) => getUserById(report.senderId))
          );
          const listProductsReportsData = await Promise.all(
            listReports.map((report) => getProductById(report.productId))
          );

          setListUserReports(listUserReportsData);
          setListProductsReports(listProductsReportsData);
        }
        setReports(listReports);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
    fetchUserReports();
  }, [user]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleOpenRating = (order, productId, title) => {
    setSelectedProduct({ productId, title, order });
    setIsRatingOpen(true);
  };

  const handleOpenReport = (order, productId, title) => {
    setSelectedProduct({ productId, title, order });
    setIsReportOpen(true);
  };

  const handleResolveReport = async (report) => {
    try {
      await updateReport(report.id, "resolved");
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Tabs defaultValue="profile">
        <TabsList className={`grid ${user.role == "seller" ? "grid-cols-4" : "grid-cols-3"} w-full md:w-auto`}>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile {user.role}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          {
            user.role == "seller" && (
              <TabsTrigger value="reports" className="relative">
                <Settings className="mr-2 h-4 w-4" />
                Reports
                {reports.filter((report) => report.status === "sent").length > 0 && (
                  <span className="absolute -top-2 right-6 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {reports.filter((report) => report.status === "sent").length}
                  </span>
                )}
              </TabsTrigger>
            )
          }
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="w-[25%] mx-auto border shadow-sm rounded-lg p-4 items-center">
              <div className="flex items-center w-full justify-between pb-4">
                <Avatar className="w-20 h-20 border-1">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-semibold">{user.name}</h3>
                  <Badge className="mt-2 px-3 py-1 text-sm">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              <hr></hr>
              <div className="flex gap-6 p-4 justify-between">
                <div>
                  <p className="text-sm text-muted-foreground italics font-semibold">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {user.role === "seller" && user.storeInfo && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Store Name</p>
                      <p className="font-medium">{user.storeInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Store Description</p>
                      <p className="font-medium">{user.storeInfo.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Store Rating</p>
                      <div className="flex items-center font-medium">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{user.storeInfo.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="font-medium">{user.storeInfo.totalSales} items sold</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your past orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    You haven't placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="bg-muted p-4">
                        <div className="flex flex-wrap justify-between items-center">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                order.orderStatus === "Delivered"
                                  ? "default"
                                  : order.orderStatus === "Shipped"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {order.orderStatus}
                            </Badge>
                            <Badge
                              variant={
                                order.paymentStatus === "Paid"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          {order.products.map(({ product, quantity }, index) =>
                            product ? (
                              <div
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                    <span>🖼️</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {product.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    ${(product.price * quantity).toFixed(2)}
                                  </p>
                                  {order.orderStatus === "Delivered" &&
                                    <>
                                      {(order.items.find(item => item.productId === product.id).total_rate) ? (
                                        [1, 2, 3, 4, 5].map((value) => (
                                          <Star
                                            key={value}
                                            className="w-6 h-6 cursor-pointer transition-colors"
                                            fill={order.items.find(item => item.productId === product.id).total_rate / order.items.find(item => item.productId === product.id).sold >= value ? "#facc15" : "none"}
                                            stroke={order.items.find(item => item.productId === product.id).total_rate / order.items.find(item => item.productId === product.id).sold >= value ? "#facc15" : "currentColor"}
                                          />
                                        ))
                                      ) : <Button
                                        size="sm"
                                        onClick={() => handleOpenRating(order, product.id, product.title)}
                                      >
                                        Rate
                                      </Button>}
                                      {
                                        reports?.some(report => report.orderId === order.id && report.productId === product.id) ?
                                          (
                                            <div className="text-xl text-red-500 font-bold italic">Reported</div>
                                          ) : (
                                            <Button
                                              size="sm"
                                              onClick={() => handleOpenReport(order, product.id, product.title)}
                                            >
                                              Report
                                            </Button>
                                          )
                                      }
                                    </>
                                  }
                                </div>
                              </div>
                            ) : (
                              <div
                                key={index}
                                className="text-muted-foreground italic"
                              >
                                Product no longer available
                              </div>
                            )
                          )}
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-bold">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Shipping Address</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.name},{" "}
                            {order.shippingAddress.street},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode},{" "}
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Account settings functionality coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {
          user.role === "seller" && (
            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>
                    View reports submitted by users about your products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        No reports have been submitted yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reports.map((report) => {
                        const productReport = listProductsReports.find(
                          (product) => product?.id === report.productId
                        );
                        const userReport = listUserReports.find(
                          (user) => user?.id === report.senderId
                        );

                        return (
                          <div
                            key={report.id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted p-4">
                              <div className="flex flex-wrap justify-end items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{report.status == "sent" ? "Pending" : "Resolved"}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <Avatar className="w-16 h-16">
                                    <AvatarImage
                                      src={productReport?.images[0] || ""}
                                      alt={productReport?.title || "Product"}
                                    />
                                    <AvatarFallback>🖼️</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {productReport?.title || "Unknown Product"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Sent by: {userReport?.email || "Unknown User"}
                                    </p>
                                  </div>
                                </div>

                                {
                                  report.status == "sent" &&
                                  (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        className="bg-green-400 hover:bg-green-500 cursor-pointer"
                                        onClick={() => handleResolveReport(report)}
                                      >
                                        Resolve
                                      </Button>
                                    </div>
                                  )
                                }
                              </div>
                              <Separator />
                              <p className="font-medium">Report Details</p>
                              <p className="text-sm text-muted-foreground">
                                {report.report}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        }
      </Tabs>
      {selectedProduct && (
        <>
          <RatingDialog
            open={isRatingOpen}
            selectedProduct={selectedProduct}
            onClose={() => setIsRatingOpen(false)}
          />
          <ReportDialog
            open={isReportOpen}
            selectedProduct={selectedProduct}
            onClose={() => setIsReportOpen(false)}
          />
        </>
      )}
    </div>
  );
}
