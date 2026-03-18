import Package from "../models/Package.model.js";
import cloudinary from "../config/cloudinary.js";

export const createPackage = async (req, res) => {
  try {
    const {
      packageType,
      location,
      daysAndNights,
      hotelName,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      packageName,
      packageDescription,
      country,
      isActive,
      status,
      activityCategory,
    } = req.body;

    const days = JSON.parse(req.body.days);

    const uploadFile = (file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "travel_packages" }, (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          })
          .end(file.buffer);
      });
    };

    // -----------------------------
    // MAIN IMAGES — URL + File Support
    // -----------------------------
    let mainImages = [];

    // existing images sent from frontend (EDIT mode)
    if (req.body.existingImages) {
      mainImages = JSON.parse(req.body.existingImages); // URLs
    }

    // new uploaded files
    const newMainFiles = req.files.filter((f) => f.fieldname === "images");

    for (const file of newMainFiles) {
      const url = await uploadFile(file);
      mainImages.push(url);
    }

    // -----------------------------
    // SLOT IMAGES — URL + File Support
    // -----------------------------
    const transformedDays = [];

    for (let d = 0; d < days.length; d++) {
      const day = days[d];
      const newSlots = [];

      for (let s = 0; s < day.slots.length; s++) {
        const slot = day.slots[s];

        const slotFile = req.files.find(
          (f) => f.fieldname === `slotImage_${d}_${s}`
        );

        let slotImageUrl = slot.imageUrl || "";

        if (slotFile) {
          slotImageUrl = await uploadFile(slotFile);
        }

        newSlots.push({
          ...slot,
          imageUrl: slotImageUrl,
        });
      }

      transformedDays.push({
        ...day,
        slots: newSlots,
      });
    }

    // SAVE PACKAGE
    if (isBestPackage && bestRank) {
      const existingPackage = await Package.findOne({ bestRank });

      if (existingPackage) {
        existingPackage.bestRank = null;
        existingPackage.isBestPackage = false;
        await existingPackage.save();
      }
    }

    // Step 4: Create new package
    const pkg = await Package.create({
      packageName,
      packageDescription,
      packageType,
      location,
      daysAndNights,
      hotelName,
      price,
      offerPrice,
      isBestPackage: isBestPackage || false,
      bestRank: bestRank || null,
      images: mainImages,
      days: transformedDays,
      country,
      isActive: isActive === 'false' ? false : true,
      status: status || 'Active',
      activityCategory: activityCategory || null,
      createdBy: req.user._id,
    });
    res.status(201).json({
      message: "Package created successfully",
      data: pkg,
    });
  } catch (error) {
    console.error("Create package error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    // 1) Parse incoming fields safely
    const {
      packageType,
      location,
      daysAndNights,
      hotelName,
      price,
      offerPrice,
      isBestPackage,
      bestRank,
      packageName,
      packageDescription,
      country,
      isActive,
      status,
      activityCategory,
    } = req.body;

    // parse days: accept object or JSON string
    let days = [];
    if (req.body.days) {
      if (typeof req.body.days === "string") {
        try {
          days = JSON.parse(req.body.days);
        } catch (e) {
          return res.status(400).json({ message: "Invalid days JSON" });
        }
      } else {
        days = req.body.days;
      }
    }

    // parse existingImages: accept array or JSON string
    let existingImages = [];
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === "string") {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch (e) {
          // If it's a single string (one URL), wrap it
          existingImages = [req.body.existingImages];
        }
      } else if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages;
      }
    }

    // 2) Build a lookup map for uploaded files (fieldname -> array of files)
    const files = Array.isArray(req.files) ? req.files : [];
    const fileMap = files.reduce((acc, file) => {
      acc[file.fieldname] = acc[file.fieldname] || [];
      acc[file.fieldname].push(file);
      return acc;
    }, {});

    // Helper: upload buffer to cloudinary using upload_stream
    const uploadFile = (file, folder) =>
      new Promise((resolve, reject) => {
        try {
          const stream = cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => {
              if (err) return reject(err);
              resolve(result && result.secure_url ? result.secure_url : null);
            }
          );
          stream.end(file.buffer);
        } catch (err) {
          reject(err);
        }
      });

    // 3) MAIN IMAGES: start with existingImages (what frontend says to keep)
    const mainImages = Array.isArray(existingImages) ? [...existingImages] : [];

    // Upload all incoming files with fieldname 'images' (could be multiple)
    const newMainFiles = fileMap["images"] || [];
    for (const f of newMainFiles) {
      try {
        const url = await uploadFile(f, "travel_packages/main");
        if (url) mainImages.push(url);
      } catch (err) {
        console.error("Main image upload failed:", err.message || err);
        // optionally continue or return error. Continue so other images/slots still process.
      }
    }

    // 4) SLOT IMAGES: iterate days and slots; replace only when new file exists
    const transformedDays = [];
    for (let d = 0; d < days.length; d++) {
      const day = days[d] || {};
      const slots = Array.isArray(day.slots) ? day.slots : [];

      const transformedSlots = [];
      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s] || {};

        // fieldname convention expected from frontend: `slotImage_${d}_${s}`
        const fieldName = `slotImage_${d}_${s}`;

        // pick first uploaded file for this slot if provided
        const slotFiles = fileMap[fieldName] || [];
        const slotFile = slotFiles[0] || null;

        // Decide slotImageUrl:
        // - If frontend provided slot.imageUrl (string), use it as baseline (could be "" to remove)
        // - If a new file was uploaded, ALWAYS replace with uploaded URL
        let slotImageUrl =
          typeof slot.imageUrl !== "undefined" ? slot.imageUrl : "";

        if (slotFile) {
          try {
            const url = await uploadFile(slotFile, "travel_packages/slots");
            if (url) slotImageUrl = url;
          } catch (err) {
            console.error(
              `Slot upload failed for ${fieldName}:`,
              err.message || err
            );
            // keep whatever slot.imageUrl was provided (or empty string)
          }
        }

        transformedSlots.push({
          ...slot,
          imageUrl: slotImageUrl || "", // ensure always string
        });
      }

      transformedDays.push({
        ...day,
        slots: transformedSlots,
      });
    }

    // 5) Perform the update
    const updatedPkg = await Package.findByIdAndUpdate(
      req.params.id,
      {
        packageName,
        packageDescription,
        packageType,
        location,
        daysAndNights,
        hotelName,
        price,
        offerPrice,
        isBestPackage,
        bestRank,
        images: mainImages,
        days: transformedDays,
        country,
        isActive: isActive === 'false' ? false : true,
        status,
        activityCategory: activityCategory || null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      message: "Package updated successfully",
      data: updatedPkg,
    });
  } catch (error) {
    console.error("Update package error:", error);
    return res.status(500).json({ error: error.message || error });
  }
};
