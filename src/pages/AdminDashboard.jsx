import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  // Password sederhana (dalam production sebaiknya gunakan auth yang lebih aman)
  const ADMIN_PASSWORD = 'ultrassmekdacak1912';

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchDonations();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      fetchDonations();
      setError('');
    } else {
      setError('Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setPassword('');
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/donations');
      const donationData = response.data || [];
      setDonations(donationData);
      
      // Calculate stats
      const total = donationData.reduce((sum, d) => sum + (d.amount || 0), 0);
      setStats({ total, count: donationData.length });
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Gagal memuat data donasi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/donations?id=${id}`);
      setDonations(donations.filter(d => d.id !== id));
      setDeleteConfirm(null);
      
      // Recalculate stats
      const newDonations = donations.filter(d => d.id !== id);
      const total = newDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      setStats({ total, count: newDonations.length });
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError('Gagal menghapus donasi');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>🔐 Admin Dashboard</h1>
            <p>ULTRAS SMEKDA - Donasi Sumatera</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Password Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="login-input"
                autoFocus
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-btn">
              Masuk
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="back-btn"
            >
              ← Kembali ke Beranda
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📊 Admin Dashboard</h1>
            <p>Kelola Donasi Sumatera</p>
          </div>
          <div className="header-right">
            <button onClick={() => navigate('/')} className="btn-home">
              🏠 Beranda
            </button>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Donasi</div>
            <div className="stat-value">{formatCurrency(stats.total)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-info">
            <div className="stat-label">Jumlah Donatur</div>
            <div className="stat-value">{stats.count} Orang</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-label">Status</div>
            <div className="stat-value">Aktif</div>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>📝 Daftar Donasi</h2>
          <button onClick={fetchDonations} className="btn-refresh" disabled={loading}>
            {loading ? '⏳ Memuat...' : '🔄 Refresh'}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Memuat data donasi...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Belum Ada Donasi</h3>
            <p>Donasi akan muncul di sini setelah ada yang berdonasi</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="donations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Telepon</th>
                  <th>Jumlah</th>
                  <th>Metode</th>
                  <th>Tanggal</th>
                  <th>Bukti</th>
                  <th>Pesan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>#{donation.id}</td>
                    <td className="donor-name">{donation.name}</td>
                    <td>{donation.email}</td>
                    <td>{donation.phone || '-'}</td>
                    <td className="amount">{formatCurrency(donation.amount)}</td>
                    <td>
                      <span className="payment-badge">
                        {donation.paymentMethod === 'bank-transfer' ? '🏦 Bank' : '📱 Digital'}
                      </span>
                    </td>
                    <td className="date">{formatDate(donation.date)}</td>
                    <td>
                      {donation.proofImage ? (
                        <button
                          onClick={() => setSelectedImage(donation.proofImage)}
                          className="btn-view-proof"
                        >
                          👁️ Lihat
                        </button>
                      ) : (
                        <span className="no-proof">-</span>
                      )}
                    </td>
                    <td className="message-cell">
                      {donation.message ? (
                        <span className="message-preview" title={donation.message}>
                          {donation.message.substring(0, 30)}
                          {donation.message.length > 30 ? '...' : ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteConfirm(donation.id)}
                        className="btn-delete"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bukti Transfer</h3>
              <button onClick={() => setSelectedImage(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <img src={selectedImage} alt="Bukti Transfer" className="proof-image" />
            </div>
            <div className="modal-footer">
              <a 
                href={selectedImage} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-download"
              >
                📥 Download
              </a>
              <button onClick={() => setSelectedImage(null)} className="btn-close">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Konfirmasi Hapus</h3>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menghapus donasi ini?</p>
              <p className="warning-text">Tindakan ini tidak dapat dibatalkan!</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => handleDelete(deleteConfirm)} 
                className="btn-confirm-delete"
              >
                Ya, Hapus
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="btn-cancel"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="admin-footer">
        <p>© 2025 ULTRAS SMEKDA - Admin Dashboard</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
