import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const reviewUploadDir = path.resolve(currentDir, "../uploads/reviews");

fs.mkdirSync(reviewUploadDir, { recursive: true });

const allowedTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
};

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, reviewUploadDir),
    filename: (_req, file, callback) => {
        callback(null, `${randomBytes(16).toString("hex")}${allowedTypes[file.mimetype]}`);
    }
});

const upload = multer({
    storage,
    limits: {
        files: 6,
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedTypes[file.mimetype]) {
            return callback(new Error("Upload JPG, PNG, WebP, or GIF photos and MP4, WebM, or MOV videos."));
        }
        callback(null, true);
    }
}).fields([
    { name: "reviewImages", maxCount: 5 },
    { name: "reviewVideo", maxCount: 1 }
]);

export const uploadedReviewFiles = (req) => Object.values(req.files || {}).flat();

export const removeReviewUploads = (files = []) => {
    files.forEach((file) => {
        fs.unlink(file.path, (err) => {
            if (err && err.code !== "ENOENT") {
                console.error("[reviewUpload] Could not remove uploaded file:", err.message);
            }
        });
    });
};

export const handleReviewUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            removeReviewUploads(uploadedReviewFiles(req));
            const status = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(status).json({ message: err.message || "Unable to upload review media." });
        }

        const files = uploadedReviewFiles(req);
        const oversizedImage = files.find((file) => file.mimetype.startsWith("image/") && file.size > 5 * 1024 * 1024);
        if (oversizedImage) {
            removeReviewUploads(files);
            return res.status(413).json({ message: "Each review photo must be 5 MB or smaller." });
        }

        next();
    });
};
