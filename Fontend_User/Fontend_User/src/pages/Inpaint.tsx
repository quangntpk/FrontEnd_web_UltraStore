import React, { useState } from 'react';
import axios from 'axios';

// Định nghĩa interface cho yêu cầu gửi đến API
interface InpaintRequest {
    key: string;
    prompt: string;
    negativePrompt?: string;
    initImage: string; // Chuỗi base64 của ảnh gốc
    maskImage?: string; // Chuỗi base64 của mask (tùy chọn)
    width: string;
    height: string;
    samples: string;
    numInferenceSteps: string;
    safetyChecker: string;
    enhancePrompt: string;
    guidanceScale: number;
    strength: number;
    base64: string;
    seed?: number;
    webhook?: string;
    trackId?: string;
}

const Inpaint: React.FC = () => {
    // Khởi tạo state cho yêu cầu inpainting với các giá trị mặc định
    const [request, setRequest] = useState<InpaintRequest>({
        key: 'sk-ojcyoSQtQjjnATJ16pg4HxPVAtZl9yWn40GfZo5CjEGwkOeA', // Thay bằng API key thực tế
        prompt: '',
        negativePrompt: '',
        initImage: '',
        maskImage: '',
        width: '512',
        height: '512',
        samples: '1',
        numInferenceSteps: '30',
        safetyChecker: 'no',
        enhancePrompt: 'yes',
        guidanceScale: 7.5,
        strength: 0.7,
        base64: 'no',
        seed: undefined,
        webhook: '',
        trackId: ''
    });

    // Các state bổ sung cho giao diện
    const [response, setResponse] = useState<string | null>(null); // Kết quả từ API
    const [loading, setLoading] = useState<boolean>(false); // Trạng thái đang xử lý
    const [error, setError] = useState<string | null>(null); // Thông báo lỗi
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false); // Hiển thị tùy chọn nâng cao

    // Xử lý khi người dùng chọn file ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setRequest({ ...request, initImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý khi người dùng chọn file mask
    const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setRequest({ ...request, maskImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý gửi yêu cầu đến API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.initImage) {
            setError('Vui lòng tải lên ảnh.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5261/api/Inpaint', request); // Thay bằng endpoint thực tế
            if (res.data.status === 'success') {
                setResponse(res.data.output); // Giả định API trả về trường 'output'
            } else {
                setError(res.data.message || 'Đã xảy ra lỗi không xác định.');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Inpaint Image</h1>
            <form onSubmit={handleSubmit}>
                {/* API Key */}
                <div style={{ marginBottom: '15px' }}>
                    <label>API Key:</label><br />
                    <input
                        type="text"
                        value={request.key}
                        onChange={(e) => setRequest({ ...request, key: e.target.value })}
                        placeholder="Nhập API Key"
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {/* Prompt */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Prompt:</label><br />
                    <input
                        type="text"
                        value={request.prompt}
                        onChange={(e) => setRequest({ ...request, prompt: e.target.value })}
                        placeholder="Mô tả nội dung muốn inpaint"
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {/* Negative Prompt */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Negative Prompt (tùy chọn):</label><br />
                    <input
                        type="text"
                        value={request.negativePrompt || ''}
                        onChange={(e) => setRequest({ ...request, negativePrompt: e.target.value })}
                        placeholder="Những gì không muốn xuất hiện"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {/* Upload Image */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Upload Image:</label><br />
                    <input type="file" onChange={handleImageChange} accept="image/*" required />
                    {request.initImage && (
                        <div style={{ marginTop: '10px' }}>
                            <h3>Ảnh đã chọn:</h3>
                            <img src={request.initImage} alt="Selected Image" style={{ maxWidth: '300px' }} />
                        </div>
                    )}
                </div>

                {/* Upload Mask */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Upload Mask (tùy chọn):</label><br />
                    <input type="file" onChange={handleMaskChange} accept="image/*" />
                    {request.maskImage && (
                        <div style={{ marginTop: '10px' }}>
                            <h3>Mask đã chọn:</h3>
                            <img src={request.maskImage} alt="Selected Mask" style={{ maxWidth: '300px' }} />
                        </div>
                    )}
                </div>

                {/* Nút hiển thị/ẩn tùy chọn nâng cao */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ marginBottom: '15px', padding: '8px 16px' }}
                >
                    {showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiện tùy chọn nâng cao'}
                </button>

                {/* Tùy chọn nâng cao */}
                {showAdvanced && (
                    <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc' }}>
                        <h2>Tùy chọn nâng cao</h2>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Width:</label><br />
                            <input
                                type="text"
                                value={request.width}
                                onChange={(e) => setRequest({ ...request, width: e.target.value })}
                                placeholder="e.g., 512"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Height:</label><br />
                            <input
                                type="text"
                                value={request.height}
                                onChange={(e) => setRequest({ ...request, height: e.target.value })}
                                placeholder="e.g., 512"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Samples:</label><br />
                            <input
                                type="text"
                                value={request.samples}
                                onChange={(e) => setRequest({ ...request, samples: e.target.value })}
                                placeholder="e.g., 1"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Num Inference Steps:</label><br />
                            <input
                                type="text"
                                value={request.numInferenceSteps}
                                onChange={(e) => setRequest({ ...request, numInferenceSteps: e.target.value })}
                                placeholder="e.g., 30"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Safety Checker:</label><br />
                            <select
                                value={request.safetyChecker}
                                onChange={(e) => setRequest({ ...request, safetyChecker: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Enhance Prompt:</label><br />
                            <select
                                value={request.enhancePrompt}
                                onChange={(e) => setRequest({ ...request, enhancePrompt: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Guidance Scale:</label><br />
                            <input
                                type="number"
                                step="0.1"
                                value={request.guidanceScale}
                                onChange={(e) => setRequest({ ...request, guidanceScale: parseFloat(e.target.value) })}
                                placeholder="e.g., 7.5"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Strength:</label><br />
                            <input
                                type="number"
                                step="0.1"
                                value={request.strength}
                                onChange={(e) => setRequest({ ...request, strength: parseFloat(e.target.value) })}
                                placeholder="e.g., 0.7"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Base64:</label><br />
                            <select
                                value={request.base64}
                                onChange={(e) => setRequest({ ...request, base64: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Seed:</label><br />
                            <input
                                type="number"
                                value={request.seed || ''}
                                onChange={(e) => setRequest({ ...request, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                                placeholder="Tùy chọn"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Webhook:</label><br />
                            <input
                                type="text"
                                value={request.webhook || ''}
                                onChange={(e) => setRequest({ ...request, webhook: e.target.value })}
                                placeholder="Tùy chọn"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Track ID:</label><br />
                            <input
                                type="text"
                                value={request.trackId || ''}
                                onChange={(e) => setRequest({ ...request, trackId: e.target.value })}
                                placeholder="Tùy chọn"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Nút gửi */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#007bff', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Đang xử lý...' : 'Inpaint'}
                </button>
            </form>

            {/* Hiển thị lỗi */}
            {error && (
                <div style={{ color: 'red', marginTop: '15px' }}>
                    {error}
                </div>
            )}

            {/* Hiển thị kết quả */}
            {response && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Kết quả:</h3>
                    <img
                        src={request.base64 === 'yes' ? `data:image/png;base64,${response}` : response}
                        alt="Inpainted Image"
                        style={{ maxWidth: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default Inpaint;