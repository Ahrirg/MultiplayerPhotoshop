import React, { useState, useCallback, useEffect } from "react";

interface ImageDropOverlayProps {
  src: string;
  sessionIp: string;
  onDropFile: (file: File) => void;
}

export const ImageDropOverlay: React.FC<ImageDropOverlayProps> = ({
  src,
  sessionIp,
  onDropFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!sessionIp) return;

    let dragCounter = 0;

    const onWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };

    const onWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) setIsDragging(false);
    };

    const onWindowDragOver = (e: DragEvent) => {
      e.preventDefault(); // needed to allow drop
    };

    const onWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
    };

    window.addEventListener("dragenter", onWindowDragEnter);
    window.addEventListener("dragleave", onWindowDragLeave);
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("drop", onWindowDrop);

    return () => {
      window.removeEventListener("dragenter", onWindowDragEnter);
      window.removeEventListener("dragleave", onWindowDragLeave);
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("drop", onWindowDrop);
    };
  }, [sessionIp]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) onDropFile(file);
    },
    [onDropFile]
  );

  if (!sessionIp) return null;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: isDragging ? "all" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDragging ? "rgba(0,0,0,0.5)" : "transparent",
        transition: "background 0.15s ease",
      }}
    >
      {isDragging && (
        <img
          src={src}
          alt="Drop here"
          style={{ maxWidth: "300px", maxHeight: "300px" }}
        />
      )}
    </div>
  );
};