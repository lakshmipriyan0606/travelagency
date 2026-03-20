import https from "https";

/**
 * Service to send WhatsApp messages using the Meta WhatsApp Graph API.
 * Supports both custom text and template-based messages.
 */
export const sendWhatsAppMessage = async (to, message, type = "text", templateOptions = {}) => {
  return new Promise((resolve, reject) => {
    // If credentials are not provided, we just log the message for development
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log(`\n--- 📱 WHATSAPP MESSAGE (DEVELOPMENT MODE) ---`);
      console.log(`To: ${to}`);
      console.log(`Type: ${type}`);
      console.log(`Message: ${message}`);
      if (type === "template") console.log(`Template:`, templateOptions);
      console.log(`-------------------------------------------\n`);
      return resolve({ success: true, mode: "development" });
    }

    const version = process.env.WHATSAPP_VERSION || "v22.0";
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    // Format phone number (must be in international format without +)
    const formattedTo = to.replace(/\D/g, "");

    let messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedTo,
      type: type,
    };

    if (type === "template") {
      messageData.template = {
        name: templateOptions.name || "hello_world",
        language: {
          code: templateOptions.languageCode || "en_US",
        },
        components: templateOptions.components || [],
      };
    } else {
      messageData.text = {
        preview_url: false,
        body: message,
      };
    }

    const data = JSON.stringify(messageData);

    const options = {
      hostname: "graph.facebook.com",
      path: `/${version}/${phoneNumberId}/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: parsed });
          } else {
            console.error("❌ Meta API Error:", JSON.stringify(parsed, null, 2));
            resolve({ success: false, error: parsed });
          }
        } catch (e) {
          resolve({ success: false, error: "Failed to parse response" });
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ WhatsApp Service Error:", error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};
