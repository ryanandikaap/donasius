import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DonationFormPage.css';

const DonationFormPage = () => {
  const navigate = useNavigate();
  
  // State untuk form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    paymentMethod: 'digital-payment',
    isAnonymous: false,
    message: ''
  });

  const [proofImage, setProofImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Jumlah preset
  const presetAmounts = [50000, 100000, 250000, 500000, 1000000];
  
  // Format mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File terlalu besar! Maksimal 5MB');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Hanya file gambar (JPEG, PNG) yang diperbolehkan');
      return;
    }
    
    setProofImage(file);
    setErrorMessage('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validasi
    if (!formData.amount) {
      setErrorMessage('Harap pilih jumlah donasi');
      return;
    }
    
    if (!formData.isAnonymous && !formData.name) {
      setErrorMessage('Harap isi nama atau pilih donasi anonim');
      return;
    }
    
    if (!proofImage) {
      setErrorMessage('Harap upload bukti transfer untuk melanjutkan donasi');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.isAnonymous ? 'Anonim' : formData.name);
      formDataToSend.append('email', formData.email || 'anonim@ultrassmekda.org');
      formDataToSend.append('phone', formData.phone || '0000000000');
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('message', formData.message);
      
      if (proofImage) {
        formDataToSend.append('proofImage', proofImage);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        }
      };
      
      const response = await axios.post('/api/donations', formDataToSend, config);
      
      console.log('Response:', response.data);
      setIsSubmitting(false);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error:', error);
      
      let errorMsg = 'Gagal mengirim donasi';
      if (error.response) {
        errorMsg = error.response.data.error || errorMsg;
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Tidak bisa terhubung ke server';
      }
      
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      amount: '',
      paymentMethod: 'digital-payment',
      isAnonymous: false,
      message: ''
    });
    setProofImage(null);
    setPreviewImage(null);
    setCurrentStep(1);
  };

  // Next step
  const nextStep = () => {
    if (currentStep === 1 && !formData.amount) {
      setErrorMessage('Pilih jumlah donasi terlebih dahulu');
      return;
    }
    if (currentStep === 2 && !formData.isAnonymous && !formData.name) {
      setErrorMessage('Isi nama atau pilih donasi anonim');
      return;
    }
    setErrorMessage('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setErrorMessage('');
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="donation-form-page">
      {/* Header */}
      <div className="form-header">
        <div className="container">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Kembali
          </button>
          <h1 className="form-title">Donasi untuk Sumatera</h1>
          <p className="form-subtitle">ULTRAS SMEKDA - Solidaritas untuk Sesama</p>
        </div>
      </div>
      
      <main className="form-main">
        <div className="container">
          {isSubmitted ? (
            /* Success Message */
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2>Terima Kasih atas Donasi Anda!</h2>
              <p className="success-message">
                Donasi sebesar <strong>{formatCurrency(parseInt(formData.amount))}</strong> telah berhasil dikirim.
              </p>
              <p>Terima kasih atas kontribusi Anda untuk korban bencana Sumatera.</p>
              
              <div className="success-actions">
                <button onClick={resetForm} className="btn-primary">Donasi Lagi</button>
                <button onClick={() => navigate('/')} className="btn-secondary">Kembali ke Beranda</button>
              </div>
            </div>
          ) : (
            /* Donation Form */
            <div className="form-content">
              {/* Progress Steps */}
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Jumlah</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Data Diri</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Pembayaran</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="donation-form">
                {/* Step 1: Amount */}
                {currentStep === 1 && (
                  <div className="form-step">
                    <h2 className="step-title">Pilih Jumlah Donasi</h2>
                    
                    <div className="amount-grid">
                      {presetAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className={`amount-card ${formData.amount === amount.toString() ? 'selected' : ''}`}
                          onClick={() => setFormData(prev => ({...prev, amount: amount.toString()}))}
                        >
                          <div className="amount-value">{formatCurrency(amount)}</div>
                        </button>
                      ))}
                    </div>

                    <div className="custom-amount-section">
                      <label className="input-label">Atau masukkan jumlah lain:</label>
                      <div className="amount-input-wrapper">
                        <span className="currency-prefix">Rp</span>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="Masukkan jumlah"
                          min="10000"
                          className="amount-input"
                        />
                      </div>
                      <p className="input-hint">Minimal donasi Rp 10.000</p>
                    </div>

                    <button type="button" onClick={nextStep} className="btn-next">
                      Lanjutkan →
                    </button>
                  </div>
                )}

                {/* Step 2: Personal Info */}
                {currentStep === 2 && (
                  <div className="form-step">
                    <h2 className="step-title">Identitas Donatur</h2>
                    
                    <div className="anonymous-option">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={formData.isAnonymous}
                          onChange={handleInputChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">🎭 Donasi sebagai Anonim</span>
                      </label>
                      <p className="anonymous-hint">Nama Anda tidak akan ditampilkan di daftar donatur</p>
                    </div>

                    {!formData.isAnonymous && (
                      <>
                        <div className="input-group">
                          <label className="input-label">Nama Donatur *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama Anda"
                            className="text-input"
                            required={!formData.isAnonymous}
                          />
                          <p className="input-hint">Nama akan ditampilkan di daftar donatur</p>
                        </div>

                        <div className="input-group">
                          <label className="input-label">Email (Opsional)</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                            className="text-input"
                          />
                          <p className="input-hint">Untuk konfirmasi donasi</p>
                        </div>

                        <div className="input-group">
                          <label className="input-label">No. Telepon (Opsional)</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="08xx-xxxx-xxxx"
                            className="text-input"
                          />
                          <p className="input-hint">Untuk keperluan verifikasi</p>
                        </div>
                      </>
                    )}

                    <div className="input-group">
                      <label className="input-label">Pesan untuk Korban Bencana (Opsional)</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tulis pesan dukungan atau doa untuk saudara kita di Sumatera..."
                        rows="4"
                        className="textarea-input"
                      />
                      <p className="input-hint">Pesan Anda akan memberikan semangat bagi mereka</p>
                    </div>

                    <div className="step-actions">
                      <button type="button" onClick={prevStep} className="btn-prev">
                        ← Kembali
                      </button>
                      <button type="button" onClick={nextStep} className="btn-next">
                        Lanjutkan →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="form-step">
                    <h2 className="step-title">Metode Pembayaran</h2>
                    
                    <div className="payment-options">
                      <label className={`payment-card ${formData.paymentMethod === 'digital-payment' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="digital-payment"
                          checked={formData.paymentMethod === 'digital-payment'}
                          onChange={handleInputChange}
                          className="radio-input"
                        />
                        <div className="payment-content">
                          <div className="payment-icon">📱</div>
                          <div className="payment-info">
                            <h4>Pembayaran Digital</h4>
                            <p>Dana, GoPay, OVO, LinkAja</p>
                          </div>
                        </div>
                      </label>

                      <label className={`payment-card ${formData.paymentMethod === 'bank-transfer' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank-transfer"
                          checked={formData.paymentMethod === 'bank-transfer'}
                          onChange={handleInputChange}
                          className="radio-input"
                        />
                        <div className="payment-content">
                          <div className="payment-icon">🏦</div>
                          <div className="payment-info">
                            <h4>Transfer Bank</h4>
                            <p>BCA, Mandiri, BRI</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Payment Details */}
                    <div className="payment-details">
                      <h3 className="details-title">
                        {formData.paymentMethod === 'digital-payment' ? 'Nomor Pembayaran Digital' : 'Rekening Tujuan'}
                      </h3>
                      
                      {formData.paymentMethod === 'digital-payment' ? (
                        <div className="account-grid">
                          <div className="account-item">
                            <div className="account-icon">💰</div>
                            <div className="account-info">
                              <div className="account-name">Dana</div>
                              <div className="account-number">0812-3456-7890</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                          <div className="account-item">
                            <div className="account-icon">💚</div>
                            <div className="account-info">
                              <div className="account-name">GoPay</div>
                              <div className="account-number">0812-3456-7891</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                          <div className="account-item">
                            <div className="account-icon">💙</div>
                            <div className="account-info">
                              <div className="account-name">OVO</div>
                              <div className="account-number">0812-3456-7892</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                          <div className="account-item">
                            <div className="account-icon">🔴</div>
                            <div className="account-info">
                              <div className="account-name">LinkAja</div>
                              <div className="account-number">0812-3456-7893</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="account-grid">
                          <div className="account-item">
                            <div className="account-icon">🏦</div>
                            <div className="account-info">
                              <div className="account-name">Bank BCA</div>
                              <div className="account-number">1234567890</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                          <div className="account-item">
                            <div className="account-icon">🏦</div>
                            <div className="account-info">
                              <div className="account-name">Bank Mandiri</div>
                              <div className="account-number">9876543210</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                          <div className="account-item">
                            <div className="account-icon">🏦</div>
                            <div className="account-info">
                              <div className="account-name">Bank BRI</div>
                              <div className="account-number">5555666677</div>
                              <div className="account-holder">a.n. ULTRAS SMEKDA</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Proof */}
                    <div className="upload-section">
                      <h3 className="upload-title">Upload Bukti Transfer *</h3>
                      <div className="upload-area">
                        <input
                          type="file"
                          id="proofUpload"
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="file-input"
                          required
                        />
                        
                        {previewImage ? (
                          <div className="preview-box">
                            <img src={previewImage} alt="Preview" className="preview-img" />
                            <button
                              type="button"
                              onClick={() => {
                                setProofImage(null);
                                setPreviewImage(null);
                              }}
                              className="btn-remove"
                            >
                              ✕ Hapus
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="proofUpload" className="upload-box">
                            <div className="upload-icon">📤</div>
                            <p className="upload-text">Klik untuk upload bukti transfer</p>
                            <p className="upload-hint">JPG, PNG (maks. 5MB)</p>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="donation-summary">
                      <h3 className="summary-title">Ringkasan Donasi</h3>
                      <div className="summary-row">
                        <span>Nama</span>
                        <span>{formData.isAnonymous ? 'Anonim' : formData.name || '-'}</span>
                      </div>
                      <div className="summary-row">
                        <span>Jumlah Donasi</span>
                        <span className="summary-amount">{formatCurrency(parseInt(formData.amount) || 0)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Metode</span>
                        <span>{formData.paymentMethod === 'digital-payment' ? 'Pembayaran Digital' : 'Transfer Bank'}</span>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="error-box">⚠️ {errorMessage}</div>
                    )}

                    {isSubmitting && (
                      <div className="progress-box">
                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                        <p className="progress-text">Mengupload: {uploadProgress}%</p>
                      </div>
                    )}

                    <div className="step-actions">
                      <button type="button" onClick={prevStep} className="btn-prev" disabled={isSubmitting}>
                        ← Kembali
                      </button>
                      <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Donasi'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </main>
      
      <footer className="form-footer">
        <div className="container">
          <p>© 2024 ULTRAS SMEKDA - Solidaritas untuk Sumatera</p>
          <p>📧 ultrassmekda@gmail.com | 📞 0812-3456-7890</p>
        </div>
      </footer>
    </div>
  );
};

export default DonationFormPage;
