import * as newsletterService from "./newsletter.service.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const newSubscriber = await newsletterService.subscribeNewsletterService(email);
    return res.status(201).json({
      message: "Subscribed successfully",
      data: newSubscriber,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Server error" });
  }
};
