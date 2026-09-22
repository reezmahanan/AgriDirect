import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', showToast }) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('buyer');
  const [regOrg, setRegOrg] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Colombo');

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email: loginEmail, password: loginPassword });
      login(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        organization: regOrg,
        phone: regPhone,
        location: { district: regDistrict }
      });
      login(data.user);
      showToast(`Registration successful! Welcome to AgriDirect.`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Register Account
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="modal-body auth-form-panel">
            <div className="auth-panel-heading">
              <h4>Welcome to AgriDirect</h4>
              <p>Access your farmer command hub or commercial procurement portal.</p>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. procurement@keells.lk"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="demo-credentials-box">
              <span className="demo-title">Demo Accounts (Password: <code>password123</code>):</span>
              <ul>
                <li>👨‍🌾 Farmer: <code>sunil@farmer.lk</code></li>
                <li>🛍️ Supermarket Buyer: <code>procurement@keells.lk</code></li>
              </ul>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <LogIn size={16} />
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="modal-body auth-form-panel">
            <div className="auth-panel-heading">
              <h4>Create Free Exchange Account</h4>
              <p>Join Sri Lanka's direct farm-to-business harvest auction exchange.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Type / Role</label>
                <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                  <option value="buyer">Commercial Buyer (Supermarket, Hotel, Kitchen)</option>
                  <option value="farmer">Agricultural Producer / Farmer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Kamal Perera"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@organization.lk"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Organization / Farm Name</label>
                <input
                  type="text"
                  required
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="e.g. Hill Country Organics Ltd"
                />
              </div>
              <div className="form-group">
                <label>Phone Contact</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label>District / Province</label>
              <select value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)}>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Kandy">Kandy</option>
                <option value="Matale">Matale</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Badulla">Badulla</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Ampara">Ampara</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Polonnaruwa">Polonnaruwa</option>
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <UserPlus size={16} />
                {loading ? 'Creating...' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
