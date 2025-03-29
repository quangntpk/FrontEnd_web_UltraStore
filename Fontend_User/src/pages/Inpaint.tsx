import React, { useState, useRef } from 'react';

const Inpaint: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');

  const REPLICATE_API_KEY = '';
  const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
      setProcessedImage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleInpaint = async () => {
    if (!imageFile || !prompt) {
      alert('Vui lòng chọn ảnh và nhập mô tả!');
      return;
    }

    setLoading(true);
    try {
      const base64Image = await fileToBase64(imageFile);

      const payload = {
        version: 'fb9c8e3e2b39f584d93dffa9e6dda4b974abac7098f36883e251fc7b6e75bf01',
        input: {
          image: base64Image,
          prompt: prompt,
          mask: base64Image, // Mask tạm thời
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      };

      console.log('Sending payload to Replicate:', payload);

      let response;
      try {
        response = await fetch(REPLICATE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (fetchError) {
        throw new Error(`Không thể kết nối tới Replicate API: ${fetchError.message}. Có thể do CORS hoặc mạng. Vui lòng thử lại hoặc dùng proxy server.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const prediction = await response.json();
      console.log('Prediction Response:', prediction);

      if (!prediction.id) {
        throw new Error('Không nhận được prediction ID từ Replicate');
      }

      const predictionId = prediction.id;

      let result;
      let attempts = 0;
      const maxAttempts = 30;

      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let statusResponse;
        try {
          statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
            headers: {
              'Authorization': `Token ${REPLICATE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (fetchError) {
          throw new Error(`Polling fetch failed: ${fetchError.message}`);
        }

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(`Polling error! status: ${statusResponse.status}, message: ${errorText}`);
        }

        result = await statusResponse.json();
        console.log('Polling Result:', result);
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error('Hết thời gian chờ kết quả từ Replicate');
        }
      } while (result.status !== 'succeeded' && result.status !== 'failed');

      if (result.status === 'failed') {
        throw new Error('Failed to generate image: ' + (result.error || 'Unknown error'));
      }

      if (!result.output || !result.output[0]) {
        throw new Error('Không nhận được output từ Replicate');
      }

      setProcessedImage(result.output[0]);

    } catch (error) {
      console.error('Lỗi khi xử lý:', error);
      alert(`Lỗi xử lý ảnh: ${error.message}. Hiển thị ảnh gốc.`);
      setProcessedImage(imageFile ? URL.createObjectURL(imageFile) : null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedImage && downloadRef.current) {
      downloadRef.current.href = processedImage;
      downloadRef.current.download = 'processed_image.jpg';
      downloadRef.current.click();
    }
  };

  return (
    <div className="inpaint-container">
      <h2>Inpaint với Stable Diffusion</h2>
      <div>
        <label>Chọn ảnh: </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div>
        <label>Mô tả: </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Nhập mô tả (ví dụ: 'Add a bird to the image')"
          rows={4}
          cols={50}
        />
      </div>
      <button onClick={handleInpaint} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Xử lý ảnh'}
      </button>
      {imageFile && (
        <div>
          <h3>Ảnh gốc:</h3>
          <img src={URL.createObjectURL(imageFile)} alt="Original" style={{ maxWidth: '400px' }} />
        </div>
      )}
      {processedImage && (
        <div>
          <h3>Kết quả:</h3>
          <img
            src={processedImage}
            alt="Processed"
            style={{ maxWidth: '400px' }}
            onError={(e) => console.error('Lỗi tải ảnh:', e)}
          />
          <button onClick={handleDownload}>Tải về ảnh</button>
          <a ref={downloadRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
};

export default Inpaint;