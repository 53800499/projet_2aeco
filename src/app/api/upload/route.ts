import { NextResponse } from "next/server";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier envoyé." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Format accepté : JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "L’image ne doit pas dépasser 5 Mo." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "2aeco-alumni",
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto"
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Échec de l’upload Cloudinary."));
            return;
          }
          resolve(result);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    return NextResponse.json({ url: (uploadResult as any).secure_url });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur Cloudinary." }, { status: 500 });
  }
}
