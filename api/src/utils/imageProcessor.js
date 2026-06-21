import fs from "fs";
import path from "path";
import generateId from "./generateId.js";
import { ID_PREFIXES } from "../constants/index.js";

export const processUploadedImages = (files, existingImagesBody) => {
  let images = [];

  if (existingImagesBody) {
    try {
      const parsed = typeof existingImagesBody === "string"
        ? JSON.parse(existingImagesBody)
        : existingImagesBody;

      if (Array.isArray(parsed)) {
        images = parsed.map((img, index) => {
          const imgObj = typeof img === "string" ? { imagePath: img } : img;
          return {
            imagePath: imgObj.imagePath,
            displayOrder: imgObj.displayOrder !== undefined ? imgObj.displayOrder : index + 1,
            isPrimary: imgObj.isPrimary !== undefined ? imgObj.isPrimary : index === 0,
          };
        });
      } else if (parsed && typeof parsed === "object") {
        const imgObj = parsed;
        images.push({
          imagePath: imgObj.imagePath,
          displayOrder: imgObj.displayOrder !== undefined ? imgObj.displayOrder : 1,
          isPrimary: imgObj.isPrimary !== undefined ? imgObj.isPrimary : true,
        });
      }
    } catch (error) {
      if (typeof existingImagesBody === "string" && existingImagesBody.trim()) {
        images.push({
          imagePath: existingImagesBody.trim(),
          displayOrder: 1,
          isPrimary: true,
        });
      }
    }
  }

  if (files && files.length > 0) {
    const startOrder = images.length;
    files.forEach((file, index) => {
      images.push({
        imagePath: `/static/uploads/${file.filename}`,
        displayOrder: startOrder + index + 1,
        isPrimary: startOrder + index === 0,
      });
    });
  }

  if (images.length > 0) {
    let primaryIndex = images.findIndex((img) => img.isPrimary);
    if (primaryIndex === -1) {
      primaryIndex = 0;
    }
    images = images.map((img, index) => ({
      imagePath: img.imagePath,
      displayOrder: index + 1,
      isPrimary: index === primaryIndex,
    }));
  }

  return images;
};

export const deletePhysicalImages = (imagePaths) => {
  if (!imagePaths || imagePaths.length === 0) return;
  for (const imgPath of imagePaths) {
    const physicalPath = path.join("src/resources/public", imgPath.replace(/^\/static\//, ""));
    try {
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    } catch (err) {
      // Silent
    }
  }
};

export const prepareImagesData = (images) => {
  if (!images || images.length === 0) return [];
  return images.map((img, index) => {
    const imgObj = typeof img === "string" ? { imagePath: img } : img;
    return {
      id: generateId(ID_PREFIXES.IMAGE),
      imagePath: imgObj.imagePath,
      displayOrder: imgObj.displayOrder !== undefined ? imgObj.displayOrder : index + 1,
      isPrimary: imgObj.isPrimary !== undefined ? imgObj.isPrimary : index === 0,
    };
  });
};
