import Newsletter from "../models/newsletter.model.js";
import { sendEmail } from "../services/email.service.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 2. Check duplicate
    const existingUser = await Newsletter.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    // 3. Save to DB
    const newSubscriber = await Newsletter.create({ email });

    // 4. Send confirmation mail
    await sendEmail({
      to: email,
      subject: "Welcome to Our Newsletter 🎉",
      html: `
    <h2>Thanks for subscribing!</h2>
    <p>You’ve successfully subscribed to our newsletter.</p>
    <p>You’ll now receive updates, announcements, and useful information from us.</p>
    <br />
    <p>If you didn’t request this subscription, you can safely ignore this email.</p>
  `,
    });

    res.status(201).json({
      message: "Subscribed successfully",
      data: newSubscriber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
