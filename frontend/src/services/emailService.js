import emailjs from "@emailjs/browser";

// Replace these with your actual EmailJS credentials
const SERVICE_ID = "service_zlnxltq";
const TEMPLATE_ID_ORDER_STATUS = "template_2ox9e3r";
const TEMPLATE_ID_ORDER_SUCCESS = "template_y2ex3ly";
const PUBLIC_KEY = "04iRwwkF3zpZhSmep";

// Hàm mới để lấy thông tin người dùng từ ID
const getUserEmailById = async (userId) => {
  try {
    const response = await fetch(`http://localhost:9999/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Không thể lấy thông tin người dùng: ${response.status}`);
    }
    const userData = await response.json();
    
    if (!userData || !userData.email) {
      throw new Error(`Không tìm thấy email của người dùng với ID: ${userId}`);
    }
    
    return userData.email;
  } catch (error) {
    console.error("Lỗi khi lấy email người dùng:", error);
    throw error;
  }
};

export const sendOrderSuccessEmail = async (
  userEmail,
  orderDetails,
  paymentMethod
) => {
  try {
    console.log("Attempting to send email with params:", {
      userEmail,
      orderDetails,
      paymentMethod
    });

    if (!userEmail && !orderDetails.user_id) {
      console.error("Missing both userEmail and user_id:", { userEmail, orderDetails });
      throw new Error("No user email or user ID provided");
    }

    const emailToUse = userEmail || await getUserEmailById(orderDetails.user_id);
    console.log("Email address to use:", emailToUse);
    
    if (!emailToUse) {
      throw new Error("Could not determine recipient email address");
    }

    if (!orderDetails.order_id) {
      throw new Error("Order ID is required");
    }

    const templateParams = {
      to_name: "Customer",  // Add recipient name
      email: emailToUse,    // Changed from to_email to email
      from_name: "Fashion Store", 
      order_id: orderDetails.order_id,
      payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'PayPal',
      items: orderDetails.items?.map((item) => item.product_name).join(", ") || "",
      total: `$${orderDetails.total_amount?.toFixed(2) || "0.00"}`,
      shipping_address: orderDetails.shipping_address ? 
        `${orderDetails.shipping_address.street || ""}, ${orderDetails.shipping_address.city || ""}` : "",
      reply_to: emailToUse  // Add reply_to field
    };

    console.log("Sending email with template params:", templateParams);

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_ORDER_SUCCESS,
      templateParams,
      PUBLIC_KEY
    );

    console.log("Order success email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send order success email:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      text: error.text
    });
    throw error;
  }
};

export const sendOrderStatusEmail = async (
  userEmail,
  orderDetails,
  newStatus
) => {
  try {
    if (!userEmail && !orderDetails.user_id) {
      throw new Error("No user email or user ID provided");
    }

    const emailToUse = userEmail || await getUserEmailById(orderDetails.user_id);
    
    if (!emailToUse) {
      throw new Error("Could not determine recipient email address");
    }

    const templateParams = {
      to_name: "Customer",  // Add recipient name
      email: emailToUse,    // Changed from to_email to email
      from_name: "Fashion Store",
      order_id: orderDetails.order_id,
      status: newStatus,
      items: orderDetails.items?.map((item) => item.product_name).join(", ") || "",
      total: `$${orderDetails.total_amount?.toFixed(2) || "0.00"}`,
      shipping_address: orderDetails.shipping_address ? 
        `${orderDetails.shipping_address.street || ""}, ${orderDetails.shipping_address.city || ""}` : "",
      reply_to: emailToUse  // Add reply_to field
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_ORDER_STATUS,
      templateParams,
      PUBLIC_KEY
    );

    console.log("Email status update sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send status update email:", error);
    throw error;
  }
};
