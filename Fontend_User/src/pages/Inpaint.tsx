import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InpaintForm: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [zoom1, setZoom1] = useState<number>(1);
  const [zoom2, setZoom2] = useState<number>(1);
  const [zoomOutput, setZoomOutput] = useState<number>(1);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const selectedFile = event.dataTransfer.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      }
    }
  };

  const handleClick = (
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const selectedFile = target.files[0];
        setFile(selectedFile);
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      }
    };
    input.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleZoomIn = (setZoom: React.Dispatch<React.SetStateAction<number>>) => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = (setZoom: React.Dispatch<React.SetStateAction<number>>) => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  useEffect(() => {
    return () => {
      if (preview1) URL.revokeObjectURL(preview1);
      if (preview2) URL.revokeObjectURL(preview2);
    };
  }, [preview1, preview2]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Kết quả không phải là chuỗi'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file1 || !file2) {
      alert('Vui lòng chọn cả hai tệp hình ảnh!');
      return;
    }

    setLoading(true);
    try {
      const base64Data1 = await readFileAsBase64(file1);
      const base64Data2 = await readFileAsBase64(file2);

      const requestData = {
        cauHoi: 'Mặc cái áo này lên người này giúp tôi',
        hinhAnh: [base64Data1, base64Data2],
      };

      const response = await fetch('http://localhost:5261/api/Gemini/Response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok && data.responseCode === 201 && data.result) {
        setOutputImage(`data:image/png;base64,${data.result}`);
        setZoomOutput(1);
      } else {
        alert(data.errorMessage || 'Có lỗi xảy ra khi xử lý yêu cầu');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu đến API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          style={styles.toggleButton}
        >
          Mặc đồ thử bằng AI
          {isFormVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isFormVisible && (
        <>
          <div style={styles.inputRow}>
            <div style={styles.inputColumn}>
              <label style={styles.label}>Chọn tệp 1 (Người):</label>
              <div
                style={styles.dropZone}
                onDrop={(e) => handleDrop(e, setFile1, setPreview1)}
                onDragOver={handleDragOver}
                onClick={() => handleClick(setFile1, setPreview1)}
              >
                {preview1 ? (
                  <div style={styles.imageContainer}>
                    <img
                      src={preview1}
                      alt="Preview 1"
                      style={{ ...styles.image, transform: `scale(${zoom1})` }}
                    />
                    <button
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile1(null);
                        setPreview1(null);
                        setZoom1(1);
                      }}
                    >
                      X
                    </button>
                    <div style={styles.zoomControls}>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomIn(setZoom1);
                        }}
                      >
                        +
                      </button>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomOut(setZoom1);
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>Kéo thả hoặc nhấp để chọn ảnh</div>
                )}
              </div>
            </div>
            <div style={styles.inputColumn}>
              <label style={styles.label}>Chọn tệp 2 (Áo):</label>
              <div
                style={styles.dropZone}
                onDrop={(e) => handleDrop(e, setFile2, setPreview2)}
                onDragOver={handleDragOver}
                onClick={() => handleClick(setFile2, setPreview2)}
              >
                {preview2 ? (
                  <div style={styles.imageContainer}>
                    <img
                      src={preview2}
                      alt="Preview 2"
                      style={{ ...styles.image, transform: `scale(${zoom2})` }}
                    />
                    <button
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile2(null);
                        setPreview2(null);
                        setZoom2(1);
                      }}
                    >
                      X
                    </button>
                    <div style={styles.zoomControls}>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomIn(setZoom2);
                        }}
                      >
                        +
                      </button>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomOut(setZoom2);
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>Kéo thả hoặc nhấp để chọn ảnh</div>
                )}
              </div>
            </div>
            <div style={styles.inputColumn}>
              <label style={styles.label}>Kết quả:</label>
              <div style={styles.dropZone}>
                {loading ? (
                  <div style={styles.imagePlaceholder}>Đang xử lý...</div>
                ) : outputImage ? (
                  <div style={styles.imageContainer}>
                    <img
                      src={outputImage}
                      alt="Processed Output"
                      style={{ ...styles.image, transform: `scale(${zoomOutput})` }}
                    />
                    <div style={styles.zoomControls}>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomIn(setZoomOutput);
                        }}
                      >
                        +
                      </button>
                      <button
                        style={styles.zoomButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoomOut(setZoomOutput);
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>Chưa có kết quả</div>
                )}
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={styles.button}>
            {loading ? 'Đang xử lý...' : 'Mặc đồ thử'}
          </button>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  toggleButton: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  inputColumn: {
    flex: 1,
    margin: '0 10px',
  },
  label: {
    display: 'block',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  dropZone: {
    width: '100%',
    height: '400px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  image: {
    width: '100%',
    maxWidth: '300px',
    height: '350px',
    objectFit: 'contain',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    transition: 'transform 0.2s ease-in-out',
  },
  imagePlaceholder: {
    width: '300px',
    height: '350px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #ddd',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    fontSize: '16px',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  zoomControls: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    display: 'flex',
    gap: '5px',
  },
  zoomButton: {
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
  },
  button: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(to right, #D8BFD8, #C8A2C8)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s',
  },
};

export default InpaintForm;