import { useState, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null); // Ref for the file input

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages(files);
  };

  // Handle file selection via input
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages(files);
  };

  // Trigger file input when the drag-and-drop area is clicked
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Compress an image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions to the image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0);

          // Compress the image
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.7 // Adjust compression quality (0.7 = 70%)
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Process all images and create a zip file
  const handleCompressAndDownload = async () => {
    setIsProcessing(true);
    const zip = new JSZip();

    for (const file of images) {
      const compressedFile = await compressImage(file);
      zip.file(compressedFile.name, compressedFile);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "compressed-images.zip");
      setIsProcessing(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 text-center cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick} // Trigger file input on click
      >
        <p className="text-gray-600">
          Drag & drop images here, or click to select files
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          ref={fileInputRef} // Attach the ref to the file input
        />
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleCompressAndDownload}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isProcessing ? "Processing..." : "Compress & Download"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;