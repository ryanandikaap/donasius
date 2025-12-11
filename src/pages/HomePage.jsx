import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalDonations = async () => {
      try {
        const response = await axios.get('/api/donations/total');
        setTotalDonations(response.data.total);
        setDonationCount(response.data.count);
      } catch (error) {
        console.error('Error fetching total donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDonations();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Bersama untuk Sumatera</h1>
              <p className="hero-subtitle">
                Gerakan solidaritas ULTRAS SMEKDA untuk membantu saudara kita yang terdampak bencana alam di Sumatera
              </p>
              <Link to="/donate" className="hero-btn">
                Donasi Sekarang
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-label">Total Donasi Terkumpul</div>
                  {loading ? (
                    <div className="stat-value loading">Memuat...</div>
                  ) : (
                    <div className="stat-value">{formatCurrency(totalDonations)}</div>
                  )}
                </div>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <div className="stat-icon">🤝</div>
                <div className="stat-content">
                  <div className="stat-label">Jumlah Donatur</div>
                  {loading ? (
                    <div className="stat-value loading">Memuat...</div>
                  ) : (
                    <div className="stat-value">{donationCount} Orang</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-header">
              <h2>Misi Kami</h2>
              <p>Bantuan Darurat untuk Korban Bencana Alam Sumatera</p>
            </div>
            
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-icon">🏠</div>
                <h3>Tempat Pengungsian</h3>
                <p>Menyediakan tenda dan fasilitas darurat untuk pengungsi</p>
              </div>
              
              <div className="mission-card">
                <div className="mission-icon">🍚</div>
                <h3>Bantuan Pangan</h3>
                <p>Distribusi makanan dan kebutuhan pokok untuk korban</p>
              </div>
              
              <div className="mission-card">
                <div className="mission-icon">⚕️</div>
                <h3>Layanan Kesehatan</h3>
                <p>Obat-obatan dan perawatan medis untuk yang membutuhkan</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="why-section">
          <div className="container">
            <div className="why-content">
              <div className="why-text">
                <h2>Mengapa ULTRAS SMEKDA?</h2>
                <div className="why-list">
                  <div className="why-item">
                    <div className="why-icon">✓</div>
                    <div>
                      <h4>Solidaritas Supporter</h4>
                      <p>Gerakan bersama dari komunitas supporter untuk membantu sesama</p>
                    </div>
                  </div>
                  
                  <div className="why-item">
                    <div className="why-icon">✓</div>
                    <div>
                      <h4>Transparan & Terpercaya</h4>
                      <p>Setiap donasi tercatat dan penggunaan dana dapat diakses publik</p>
                    </div>
                  </div>
                  
                  <div className="why-item">
                    <div className="why-icon">✓</div>
                    <div>
                      <h4>Langsung ke Lokasi</h4>
                      <p>Bantuan disalurkan langsung ke lokasi bencana tanpa perantara</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="why-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">🤝</span>
                  <p>Solidaritas untuk Sumatera</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Mari Bersama Membantu</h2>
              <p>Setiap kontribusi Anda sangat berarti bagi saudara kita di Sumatera</p>
              <Link to="/donate" className="cta-btn">
                Mulai Donasi
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <h3 className="footer-logo">ULTRAS SMEKDA</h3>
              <p className="footer-tagline">Solidaritas untuk Sumatera</p>
            </div>
            
            <div className="footer-links">
              <Link to="/">Beranda</Link>
              <Link to="/donate">Donasi</Link>
            </div>
            
            <div className="footer-contact">
              <p>📧 ultrassmekda@gmail.com</p>
              <p>📞 0812-3456-7890</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2024 ULTRAS SMEKDA - Dibuat dengan ❤️ untuk Sumatera</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
