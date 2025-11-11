export const downloadFile = (
  fileName: string,
  content: string,
  contentType: string
) => {
  let blob: Blob;

  // Check if content is base64 encoded (for images and other binary data)
  const isImage = contentType.startsWith("image/");
  
  if (isImage) {
    let base64Data: string;
    
    // Check if it's a data URL (data:image/jpeg;base64,...)
    if (content.startsWith("data:")) {
      // Extract the base64 part from the data URL
      const base64Match = content.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match && base64Match[1]) {
        base64Data = base64Match[1];
      } else {
        // Fallback: just use content as-is if pattern doesn't match
        blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } else if (content.match(/^[A-Za-z0-9+/=]+$/)) {
      // It's a raw base64 string
      base64Data = content;
    } else {
      // Not base64, use as-is
      blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    
    // Decode base64 string to binary data
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    blob = new Blob([bytes], { type: contentType });
  } else {
    // For text content, use as-is
    blob = new Blob([content], { type: contentType });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
