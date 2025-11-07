import React, { useState } from "react";

export default function ProfilePicUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const upload = async () => {
    if (!file) return setError("Choose a file first");
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload-profile-pic", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.error || `Upload failed: ${res.status}`);
        setUploading(false);
        return;
      }

      const body = await res.json();
      setResult(body); // { url, public_id, ... }
    } catch (e: any) {
      setError(e.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onFileChange} />
      <button onClick={upload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {result && (
        <div>
          <p>Uploaded:</p>
          <img src={result.url} alt="uploaded" style={{ maxWidth: 240 }} />
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
