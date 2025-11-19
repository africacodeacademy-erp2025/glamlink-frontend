import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { NextResponse } from "next/server";

// Configure Cloudinary at request time to avoid capturing build-time env vars
function ensureCloudinaryConfigured() {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  // Log the cloud_name being used (without exposing sensitive keys)
  console.log("Configuring Cloudinary with cloud_name:", config.cloud_name);
  console.log(
    "Expected upload URL format:",
    `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`
  );

  cloudinary.config(config);
}

// Sanity check: cloud name should be a plain identifier, not a URL.
const _configuredCloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
if (
  _configuredCloudName &&
  (_configuredCloudName.includes("http") ||
    _configuredCloudName.includes("/") ||
    _configuredCloudName.includes(":"))
) {
  console.error(
    "CLOUDINARY_CLOUD_NAME looks like a URL or contains invalid characters. This will cause the SDK to call the wrong host:",
    _configuredCloudName
  );
}

// Guard: ensure required Cloudinary env vars are present in the runtime.
const _requiredCloudinaryVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const _missing = _requiredCloudinaryVars.filter((k) => !process.env[k]);
if (_missing.length) {
  // In server runtime this will log to container logs / host logs
  console.error("Missing Cloudinary environment variables:", _missing);
}

// Diagnostic: log presence (not values) of Cloudinary env vars so container logs show whether they exist
try {
  const presence = _requiredCloudinaryVars.reduce(
    (acc: Record<string, string>, k) => {
      acc[k] = process.env[k] ? "SET" : "MISSING";
      return acc;
    },
    {} as Record<string, string>
  );
  console.info("Cloudinary env vars:", presence);
} catch (e) {
  // swallow any logging errors
}

async function uploadBufferToCloudinary(buffer: Buffer) {
  // Convert buffer to base64 data URI for direct upload
  const base64Data = `data:image/png;base64,${buffer.toString("base64")}`;

  console.log("Attempting upload with buffer size:", buffer.length, "bytes");

  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: process.env.CLOUDINARY_FOLDER || "glamlink_profiles",
      timeout: 60000,
      resource_type: "auto",
    });

    console.log("Upload successful:", result.public_id);
    return result;
  } catch (error) {
    console.error("Upload method failed, error details:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  // If env vars are missing, fail fast with a helpful JSON response.
  if (_missing.length) {
    return NextResponse.json(
      { error: "Missing Cloudinary environment variables", missing: _missing },
      { status: 500 }
    );
  }

  // Ensure Cloudinary uses the current runtime env values (not build-time values)
  ensureCloudinaryConfigured();

  // Additional validation: Check if cloud_name looks valid
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  if (!cloudName || cloudName.trim() === "") {
    return NextResponse.json(
      { error: "CLOUDINARY_CLOUD_NAME is empty or invalid" },
      { status: 500 }
    );
  }

  // Test Cloudinary connectivity
  try {
    console.log("Testing Cloudinary API connectivity...");
    const testResult = await cloudinary.api.ping();
    console.log("Cloudinary API ping successful:", testResult);
  } catch (pingError: any) {
    console.error("Cloudinary API ping failed:", pingError);
    console.error("Ping error details:", {
      message: pingError?.message,
      http_code: pingError?.http_code,
      name: pingError?.name,
    });
  }

  try {
    // Expect a multipart/form-data request with a field named 'file'
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (accept only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    // Convert the File -> ArrayBuffer -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(buffer);

    // Return the relevant metadata to the client
    return NextResponse.json(
      {
        url: result.secure_url || result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log full error details (including non-enumerable props) to help diagnose
    try {
      console.error(
        "Cloudinary upload failed:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      // Additional diagnostics
      try {
        const e = error as any;
        if (e && e.http_code)
          console.error("Cloudinary http_code:", e.http_code);
        if (e && e.request) {
          console.error("Cloudinary request object:", {
            url: e.request.url,
            href: e.request.href,
            host: e.request.host,
            hostname: e.request.hostname,
            path: e.request.path,
            protocol: e.request.protocol,
          });
        }
        if (e && e.stack) console.error("Cloudinary stack:", e.stack);
        // If Cloudinary provides an http_body (often contains error HTML or JSON), log a truncated preview
        try {
          if (e && e.http_body) {
            const bodyPreview = String(e.http_body).slice(0, 2000);
            console.error("Cloudinary http_body (preview):", bodyPreview);
          }
        } catch (inner) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error(
        "Cloudinary upload failed (stringify error):",
        String(error)
      );
    }

    // Provide a concise, safe JSON response to the client with a short error snippet
    const snippet =
      typeof error === "string"
        ? error
        : (error as any)?.message || String(error);
    return NextResponse.json(
      { error: "Upload failed", details: String(snippet).slice(0, 1000) },
      { status: 500 }
    );
  }
}
