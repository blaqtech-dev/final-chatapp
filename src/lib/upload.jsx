export const uploadImage = async (image) => {
  if (!image) return null;

  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "bolu_abiola");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/drhflo9zn/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.secure_url;
};