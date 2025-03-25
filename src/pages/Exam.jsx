import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Exam() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get questions from navigation state
  const questions = location.state?.questions || [];
  
  // Redirect to home if no questions
  useEffect(() => {
    if (!questions.length) {
      navigate('/');
    }
  }, [questions, navigate]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const getAnswerLetter = (index) => {
    return String.fromCharCode(65 + index); // Converts 0 -> 'A', 1 -> 'B', etc.
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  const handleNavigation = async (direction) => {
    setLoading(true);
    const newIndex = direction === 'next' 
      ? Math.min(questions.length - 1, currentQuestionIndex + 1)
      : Math.max(0, currentQuestionIndex - 1);
    
    setCurrentQuestionIndex(newIndex);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    setLoading(false);
  };

  const handleExamComplete = () => {
    const results = {
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      answers: selectedAnswers,
      questions: questions,
      score: calculateScore(),
    };
    
    // Save to localStorage
    const previousExams = JSON.parse(localStorage.getItem('examResults') || '[]');
    localStorage.setItem('examResults', JSON.stringify([...previousExams, results]));
    
    // Navigate back to home with results
    navigate('/', { state: { examResults: results } });
  };

  const calculateScore = () => {
    const correct = Object.entries(selectedAnswers).filter(([index, answer]) => {
      return answer === questions[index]['correct answer'];
    }).length;
    return (correct / questions.length) * 100;
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      color: isDarkMode ? '#ffffff' : '#000000',
      overflow: 'auto'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        {/* Header */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '1.2rem',
          color: isDarkMode ? '#ffffff' : '#000000',
        }}>
          <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
          <div>Time Remaining: {timeRemaining || 'Not started'}</div>
        </div>

        {/* Question */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          padding: '3rem',
          backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
          color: isDarkMode ? '#ffffff' : '#000000',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 4px 6px rgba(0,0,0,0.4)' 
            : '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '400px', // Add minimum height to prevent layout shift
        }}>
          {loading ? (
            <LoadingSpinner isDarkMode={isDarkMode} />
          ) : (
            <>
              <p style={{ 
                fontWeight: 'bold', 
                marginBottom: '2rem',
                fontSize: '1.3rem',
                color: isDarkMode ? '#ffffff' : '#000000',
              }}>
                {currentQuestion['question-text']}
              </p>

              {/* Options */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.2rem'
              }}>
                {['option-a', 'option-b', 'option-c', 'option-d'].map((option, idx) => (
                  <div 
                    key={option}
                    onClick={() => handleAnswerSelect(getAnswerLetter(idx))}
                    style={{
                      padding: '1.2rem',
                      border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedAnswers[currentQuestionIndex] === getAnswerLetter(idx)
                        ? isDarkMode ? '#363636' : '#e3f2fd'
                        : isDarkMode ? '#2d2d2d' : 'white',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontSize: '1.1rem',
                      transition: 'background-color 0.2s ease',
                      ':hover': {
                        backgroundColor: isDarkMode ? '#404040' : '#f5f5f5'
                      }
                    }}
                  >
                    {getAnswerLetter(idx)}) {currentQuestion[option]}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => handleNavigation('prev')}
            disabled={currentQuestionIndex === 0 || loading}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
              color: '#ffffff',
              cursor: currentQuestionIndex === 0 || loading ? 'not-allowed' : 'pointer',
              opacity: (currentQuestionIndex === 0 || loading) ? 0.7 : 1,
              fontSize: '1.1rem',
            }}
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleExamComplete}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isDarkMode ? '#28a745' : '#2e7d32',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '1.1rem',
              }}
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => handleNavigation('next')}
              disabled={currentQuestionIndex === questions.length - 1 || loading}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: currentQuestionIndex === questions.length - 1 || loading ? 'not-allowed' : 'pointer',
                opacity: (currentQuestionIndex === questions.length - 1 || loading) ? 0.7 : 1,
                fontSize: '1.1rem',
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;





