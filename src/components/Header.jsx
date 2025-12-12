import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const Header = () => {
  const [showDonationUsage, setShowDonationUsage] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [fundUsage, setFundUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  
  // Fetch donations from backend
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get('/api/donations');
        // Sort by date descending (newest first) and take last 10
        const sortedHistory = response.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
        setDonationHistory(sortedHistory);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching donations:', error);
        setLoading(false);
      }
    };

    fetchDonations();

    // Refresh every 10 seconds to get new donations
    const interval = setInterval(fetchDonations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch fund usage from backend
  useEffect(() => {
    const fetchFundUsage = async () => {
      try {
        const response = await axios.get('/api/fund-usage');
        setFundUsage(response.data);
        setUsageLoading(false);
      } catch (error) {
        console.error('Error fetching fund usage:', error);
        setUsageLoading(false);
      }
    };

    fetchFundUsage();

    // Refresh every 30 seconds
    const interval = setInterval(fetchFundUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total fund usage
  const totalFundUsage = fundUsage.reduce((sum, item) => sum + item.amount, 0);

  // Calculate percentage for each item
  const fundUsageWithPercentage = fundUsage.map(item => ({
    ...item,
    percentage: totalFundUsage > 0 ? ((item.amount / totalFundUsage) * 100).toFixed(1) : 0
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="header">
      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="logo-text">
                  <h1 className="logo">ULTRAS SMEKDA</h1>
                  <p className="tagline">Solidaritas untuk Sumatera</p>
                </div>
                <img src="/usss.png" alt="ULTRAS SMEKDA Logo" className="header-logo-img" />
              </div>
            </div>
            
            <nav className="nav-menu">
              <Link to="/" className="nav-link">Beranda</Link>
              <Link to="/donate" className="nav-link nav-link-donate">Donasi Sekarang</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Info Tabs */}
      <div className="header-tabs">
        <div className="container">
          <div className="tabs-wrapper">
            <button 
              className={`tab-btn ${showDonationUsage ? 'active' : ''}`}
              onClick={() => {
                setShowDonationUsage(!showDonationUsage);
                setShowHistory(false);
              }}
            >
              <span className="tab-icon">📊</span>
              <span>Penggunaan Dana</span>
            </button>
            
            <button 
              className={`tab-btn ${showHistory ? 'active' : ''}`}
              onClick={() => {
                setShowHistory(!showHistory);
                setShowDonationUsage(false);
              }}
            >
              <span className="tab-icon">📝</span>
              <span>Riwayat Donasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage Panel */}
      {showDonationUsage && (
        <div className="info-panel">
          <div className="container">
            <div className="panel-header">
              <h3>Transparansi Penggunaan Dana</h3>
              <p>Setiap rupiah yang Anda donasikan dikelola dengan penuh tanggung jawab</p>
            </div>
            
            {usageLoading ? (
              <div className="loading-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Memuat data penggunaan dana...
              </div>
            ) : fundUsageWithPercentage.length === 0 ? (
              <div className="empty-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Belum ada data penggunaan dana. Admin akan menambahkan segera.
              </div>
            ) : (
              <div className="usage-grid">
                {fundUsageWithPercentage.map((item) => (
                  <div key={item.id} className="usage-item">
                    <div className="usage-bar">
                      <div className="usage-fill" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <div className="usage-info">
                      <div className="usage-category">{item.category}</div>
                      {item.description && (
                        <div className="usage-description">{item.description}</div>
                      )}
                      <div className="usage-details">
                        <span className="usage-percentage">{item.percentage}%</span>
                        <span className="usage-amount">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="info-panel">
          <div className="container">
            <div className="panel-header">
              <h3>Donatur Terbaru</h3>
              <p>Terima kasih kepada para donatur yang telah berkontribusi</p>
            </div>
            
            {loading ? (
              <div className="loading-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Memuat riwayat donasi...
              </div>
            ) : donationHistory.length === 0 ? (
              <div className="empty-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Belum ada donasi. Jadilah yang pertama!
              </div>
            ) : (
              <div className="history-grid">
                {donationHistory.map((donation) => (
                  <div key={donation.id} className="history-item">
                    <div className="history-avatar">
                      {donation.name === 'Anonim' ? '🎭' : donation.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="history-content">
                      <div className="history-name">{donation.name}</div>
                      <div className="history-message">{donation.message || 'Tidak ada pesan'}</div>
                      <div className="history-meta">
                        <span className="history-amount">{formatCurrency(donation.amount)}</span>
                        <span className="history-date">{formatDate(donation.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
