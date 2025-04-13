import React, { useState } from 'react';
import FlagQuestionModal from './FlagQuestionModal';

const QuestionDisplay = ({ questions, resourceContent, generateCommandQuestion }) => {
  // Handle loading state
  if (!questions) {
    return <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: isDarkMode ? '#666' : '#999'
    }}>
      Loading question...
    </div>;
  }

  // Handle empty questions array
  if (!Array.isArray(questions) || questions.length === 0) {
    return <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: isDarkMode ? '#666' : '#999'
    }}>
      No questions available
    </div>;
  }

  const currentQuestion = questions[0];
  
  // Validate question format
  if (!currentQuestion || !currentQuestion['question-text']) {
    return <div style={{
      textAlign: 'center',
      padding: '2rem',
      color: isDarkMode ? '#666' : '#999'
    }}>
      Invalid question format
    </div>;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleFlagClick = () => {
    setIsModalOpen(true);
  };

  const handleFlagSubmit = (feedback) => {
    console.log('Question flagged:', {
      questionId: questions[0].id, // Assuming first question
      feedback
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `1px solid ${isDarkMode ? '#404040' : '#eee'}`,
    }}>
      {/* ... existing question display code ... */}

      {/* Add flag button before the Check Answer and Next buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
      }}>
        <button
          onClick={handleFlagClick}
          style={{
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
        
        {/* Existing Check Answer and Next buttons */}
        <button onClick={checkAnswer} /* ... existing props ... */}>
          Check Answer
        </button>
        <button onClick={generateCommandQuestion} /* ... existing props ... */}>
          Next
        </button>
      </div>

      <FlagQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFlagSubmit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
