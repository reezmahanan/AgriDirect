import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { api } from '../../services/api';

export default function EditLotModal({ isOpen, onClose, lot, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const [quantityKg, setQuantityKg] = useState('');
  const [reservePricePerKg, setReservePricePerKg] = useState('');
  const [packagingSpecs, setPackagingSpecs] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A Premium');
  const [isOrganic, setIsOrganic] = useState(false);

  useEffect(() => {
    if (lot) {
      setQuantityKg(lot.quantityKg || '');
      setReservePricePerKg(lot.basePricePerKg || lot.reservePricePerKg || '');
      setPackagingSpecs(lot.specifications?.packaging || lot.packagingSpecs || '');
      setQualityGrade(lot.specifications?.grade || lot.qualityGrade || 'Grade A Premium');
      setIsOrganic(Boolean(lot.specifications?.organicCertified ?? lot.isOrganic));
    }
  }, [lot]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateLot(lot._id, {
        quantityKg: Number(quantityKg),
        basePricePerKg: Number(reservePricePerKg),
        reservePricePerKg: Number(reservePricePerKg),
        packagingSpecs,
        qualityGrade,
        isOrganic
      });
      showToast(`Harvest lot for ${lot.crop} updated successfully!`, 'success');
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
          <h3>Edit Harvest Lot ({lot.crop})</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Harvest Volume (Kg)</label>
              <input
                type="number"
                required
                min="10"
                step="1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
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
              <label>Packaging Specifications</label>
              <input
                type="text"
                value={packagingSpecs}
                onChange={(e) => setPackagingSpecs(e.target.value)}
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
              <span>🌱 100% Certified Organic</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Update Harvest Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
