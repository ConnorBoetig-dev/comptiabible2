import React, { useState } from 'react';

function FlagQuestionModal({ isOpen, onClose, onSubmit, isDarkMode }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reason: reason === 'Other' ? customReason : reason
    });
    setReason('');
    setCustomReason('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
      }}>
        <h3 style={{ color: isDarkMode ? '#fff' : '#000' }}>Flag Question</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            {['Incorrect answer', 'Unclear wording', 'Other'].map((option) => (
              <div key={option} style={{ marginBottom: '0.5rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: isDarkMode ? '#fff' : '#000' 
                }}>
                  <input
                    type="radio"
                    name="reason"
                    value={option}
                    checked={reason === option}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {option}
                </label>
              </div>
            ))}
            {reason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe the issue..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  backgroundColor: isDarkMode ? '#404040' : '#fff',
                  color: isDarkMode ? '#fff' : '#000',
                  border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                  borderRadius: '4px',
                }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isDarkMode ? '#404040' : '#eee',
                color: isDarkMode ? '#fff' : '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || (reason === 'Other' && !customReason)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffd700',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: (!reason || (reason === 'Other' && !customReason)) ? 0.7 : 1,
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FlagQuestionModal;