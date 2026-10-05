import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { verifyAdminSession } from "../../../lib/admin-session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderType = String(formData.get("folder") ?? "portfolio");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    if (!["portfolio", "offers", "reviews"].includes(folderType)) {
      return NextResponse.json(
        { error: "Invalid upload folder." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value || !verifyAdminSession(session.value)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (folderType === "reviews" && !isImage && !isVideo) {
      return NextResponse.json(
        { error: "Please upload an image or video file." },
        { status: 400 }
      );
    }

    if (folderType !== "reviews" && !isImage) {
      return NextResponse.json(
        { error: "Please upload an image file." },
        { status: 400 }
      );
    }

    const maxSize = isVideo
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video must be smaller than 100 MB."
            : "Image must be smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let folder = "meenakshi-bridal-studio/portfolio";

    if (folderType === "offers") {
      folder = "meenakshi-bridal-studio/offers";
    }

    if (folderType === "reviews") {
      folder = "meenakshi-bridal-studio/reviews";
    }

    const resourceType =
      folderType === "reviews" && isVideo
        ? "video"
        : "image";

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      resource_type: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}