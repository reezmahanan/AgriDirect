import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PostLotModal({ isOpen, onClose, onSuccess, showToast }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [quantityKg, setQuantityKg] = useState('');
  const [reservePricePerKg, setReservePricePerKg] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A Premium');
  const [packagingSpecs, setPackagingSpecs] = useState('50kg Ventilated Plastic Crates');
  const [district, setDistrict] = useState('Nuwara Eliya');
  const [cityOrVillage, setCityOrVillage] = useState('Kandapola');
  const [isOrganic, setIsOrganic] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('🔒 Please sign in as a farmer to list harvest lots.', 'error');
      onClose();
      return;
    }

    if (currentUser.role !== 'farmer') {
      showToast('⚠️ Only registered farmers can list harvest lots on the exchange.', 'error');
      return;
    }

    if (!crop || !quantityKg || !reservePricePerKg) {
      showToast('Please fill in all required harvest details.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createLot({
        crop,
        category,
        quantityKg: Number(quantityKg),
        reservePricePerKg: Number(reservePricePerKg),
        qualityGrade,
        packagingSpecs,
        isOrganic,
        location: {
          district,
          cityOrVillage
        },
        farmer: {
          name: currentUser.name,
          organization: currentUser.organization || 'Local Farmer Estate',
          district,
          village: cityOrVillage,
          phone: currentUser.phone || '+94 77 123 4567',
          farmerId: currentUser._id
        }
      });
      showToast(`Harvest lot for ${crop} published to the exchange!`, 'success');
      onSuccess();
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
          <h3>List Morning Harvest Lot</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Crop / Produce Name</label>
              <input
                type="text"
                required
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Kandapola Fresh Leeks"
              />
            </div>
            <div className="form-group">
              <label>Agricultural Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
                <option value="spices">Spices</option>
                <option value="tubers">Tubers</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Harvest Volume (Kg)</label>
              <input
                type="number"
                required
                min="10"
                step="1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                placeholder="e.g. 1500"
              />
            </div>
            <div className="form-group">
              <label>Reserve Base Price (Rs. per Kg)</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={reservePricePerKg}
                onChange={(e) => setReservePricePerKg(e.target.value)}
                placeholder="e.g. 260"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quality Grading</label>
              <select value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)}>
                <option value="Grade A Premium">Grade A Premium</option>
                <option value="Grade B Commercial">Grade B Commercial</option>
                <option value="Export Standard">Export Standard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Packaging & Crating</label>
              <input
                type="text"
                value={packagingSpecs}
                onChange={(e) => setPackagingSpecs(e.target.value)}
                placeholder="e.g. 50kg ventilated crates"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Farm District</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Matale">Matale</option>
                <option value="Kandy">Kandy</option>
                <option value="Badulla">Badulla</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Polonnaruwa">Polonnaruwa</option>
                <option value="Ampara">Ampara</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Monaragala">Monaragala</option>
              </select>
            </div>
            <div className="form-group">
              <label>Village / Farm Location</label>
              <input
                type="text"
                value={cityOrVillage}
                onChange={(e) => setCityOrVillage(e.target.value)}
                placeholder="e.g. Kandapola Valley"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
              />
              <span>🌱 100% Certified Organic (Chemical-free cultivation)</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={16} />
              {loading ? 'Publishing Lot...' : 'Publish to Exchange'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
