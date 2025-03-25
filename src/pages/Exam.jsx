import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Exam() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  
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

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
        <div>Time Remaining: {timeRemaining || 'Not started'}</div>
      </div>

      {/* Question */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '2rem' }}>
          {currentQuestion['question-text']}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['option-a', 'option-b', 'option-c', 'option-d'].map((option, idx) => (
            <div 
              key={option}
              onClick={() => handleAnswerSelect(getAnswerLetter(idx))}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedAnswers[currentQuestionIndex] === getAnswerLetter(idx) 
                  ? '#e3f2fd' 
                  : 'white'
              }}
            >
              {getAnswerLetter(idx)}) {currentQuestion[option]}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem'
      }}>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentQuestionIndex === 0 ? 0.7 : 1
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentQuestionIndex === questions.length - 1}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentQuestionIndex === questions.length - 1 ? 0.7 : 1
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Exam;