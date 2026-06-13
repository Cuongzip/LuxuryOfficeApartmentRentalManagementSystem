export const processUploadedImages = (files, existingImagesBody) => {
  let images = [];

  // 1. Process existing images (if any)
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

  // 2. Process newly uploaded files
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

  // 3. Ensure display orders are consecutive and exactly one is primary
  if (images.length > 0) {
    const hasPrimary = images.some((img) => img.isPrimary);
    images = images.map((img, index) => ({
      imagePath: img.imagePath,
      displayOrder: index + 1,
      isPrimary: hasPrimary ? img.isPrimary : index === 0,
    }));
  }

  return images;
};
