import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlagQuestionModal from './FlagQuestionModal';

function ExamReview({ examResults, isDarkMode }) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const navigate = useNavigate();

  if (!examResults) return null;

  const { score, questions, answers } = examResults;

  const handleHomeClick = () => {
    navigate('/', { state: { examResults: null } });
  };

  const handleFlagClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setModalOpen(true);
  };

  const handleFlagSubmit = (feedback) => {
    // Mock submission - just console log for now
    console.log('Question flagged:', {
      questionId: selectedQuestionId,
      feedback
    });
    
    setModalOpen(false);
    setShowFeedbackMessage(true);
    setTimeout(() => setShowFeedbackMessage(false), 3000);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      {showFeedbackMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          zIndex: 1000,
        }}>
          Thanks for your feedback!
        </div>
      )}
      
      {!showQuestions ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {/* Score Circle */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
          }}>
            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isDarkMode ? '#444' : '#eee'}
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isDarkMode ? '#0066cc' : '#2196f3'}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: isDarkMode ? '#fff' : '#000',
              }}>
                {Math.round(score)}%
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: isDarkMode ? '#aaa' : '#666',
              }}>
                Score
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowQuestions(true)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: isDarkMode ? '#0066cc' : '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Review Questions
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}>
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question['correct answer'];
            const isCorrect = userAnswer?.toUpperCase() === correctAnswer?.toUpperCase();

            return (
              <div key={index} style={{
                padding: '1.5rem',
                backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#404040' : '#eee'}`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}>
                  <span>Question {index + 1}</span>
                  <span style={{
                    color: isCorrect 
                      ? isDarkMode ? '#4caf50' : '#2e7d32'
                      : isDarkMode ? '#f44336' : '#c62828',
                  }}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p style={{ 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}>
                  {question['question-text']}
                </p>

                {['A', 'B', 'C', 'D'].map((letter, i) => {
                  const optionKey = `option-${letter.toLowerCase()}`;
                  const isUserAnswer = userAnswer === letter;
                  const isCorrectAnswer = correctAnswer === letter;

                  // Determine background color based on answer status
                  let backgroundColor = 'transparent';
                  if (isCorrectAnswer) {
                    // Always highlight correct answer in green
                    backgroundColor = isDarkMode ? '#1b4332' : '#e8f5e9';
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    // Highlight incorrect user answer in red
                    backgroundColor = isDarkMode ? '#442c2c' : '#ffebee';
                  }

                  return (
                    <div key={letter} style={{
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor,
                      borderRadius: '4px',
                      border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                      color: isDarkMode ? '#ffffff' : '#000000',
                    }}>
                      {letter}) {question[optionKey]}
                      {isCorrectAnswer && (
                        <span style={{ 
                          marginLeft: '8px', 
                          color: isDarkMode ? '#4caf50' : '#2e7d32',
                          fontWeight: 'bold' 
                        }}>
                          ✓ Correct Answer
                        </span>
                      )}
                      {isUserAnswer && !isCorrectAnswer && (
                        <span style={{ 
                          marginLeft: '8px', 
                          color: isDarkMode ? '#f44336' : '#c62828',
                          fontWeight: 'bold' 
                        }}>
                          ✗ Your Answer
                        </span>
                      )}
                    </div>
                  );
                })}

                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: isDarkMode ? '#363636' : '#f5f5f5',
                  borderRadius: '4px',
                }}>
                  <strong>Explanation:</strong><br/>
                  {question[`explanation-${correctAnswer.toLowerCase()}`]}
                </div>

                <button
                  onClick={() => handleFlagClick(question.id || index)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ffd700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>⚠️</span>
                  Flag Question
                </button>
              </div>
            );
          })}
          {/* Add Home button at the bottom */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem',
            marginBottom: '1rem',
          }}>
            <button
              onClick={handleHomeClick}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: isDarkMode ? '#0066cc' : '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      )}
      <FlagQuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFlagSubmit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default ExamReview;



