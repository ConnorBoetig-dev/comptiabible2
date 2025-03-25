import { useState } from 'react';

function Home() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [selectedExam, setSelectedExam] = useState('A1101');
  const [selectedDomain, setSelectedDomain] = useState('1.1');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const API_BASE_URL = 'https://hgetzswjp8.execute-api.us-east-2.amazonaws.com/prod';

  const examOptions = {
    'A1101': 'A+ 1101',
    'A1102': 'A+ 1102',
    'Net09': 'Network+',    // Changed from 'Network' to 'Net09'
    'Sec701': 'Security+'   // Changed from 'Security' to 'Sec701'
  };

  const domainOptions = {
    'A1101': ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', 
              '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '4.1', '4.2', 
              '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7'],
    'A1102': ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11',
              '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10',
              '3.1', '3.2', '3.3', '3.4', '3.5',
              '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'],
    'Net09': ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8',    // Changed from 'Network' to 'Net09'
              '2.1', '2.2', '2.3', '2.4',
              '3.1', '3.2', '3.3', '3.4', '3.5',
              '4.1', '4.2', '4.3',
              '5.1', '5.2', '5.3', '5.4', '5.5'],
    'Sec701': ['1.1', '1.2', '1.3', '1.4',    // Changed from 'Security' to 'Sec701'
               '2.1', '2.2', '2.3', '2.4', '2.5',
               '3.1', '3.2', '3.3', '3.4',
               '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9',
               '5.1', '5.2', '5.3', '5.4', '5.5', '5.6']
  };

  const handleExamChange = (e) => {
    const newExam = e.target.value;
    setSelectedExam(newExam);
    setSelectedDomain(domainOptions[newExam][0]); // Set first domain as default
  };

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const generateSingleQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      const params = {
        exam: selectedExam,
        domain: selectedDomain,
        count: 1
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}?${queryString}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.error('API Response:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('No questions received from the API');
      }

      const formattedData = Array.isArray(data) ? data : [data];
      
      // Log the question format for debugging
      console.log('Question format:', formattedData[0]);
      
      const isValidQuestion = (q) => {
        const requiredFields = [
          'question-text',
          'correct answer', // API returns 'correct answer' instead of 'correct-answer'
          'option-a',
          'option-b',
          'option-c',
          'option-d'
        ];
        
        // Add some logging to help debug
        console.log('Checking question fields:', Object.keys(q));
        
        const missingFields = requiredFields.filter(field => {
          const hasField = q[field] !== undefined;
          if (!hasField) {
            console.log(`Missing field: ${field}`);
          }
          return !hasField;
        });
        
        if (missingFields.length > 0) {
          console.error('Missing fields:', missingFields);
          return false;
        }
        return true;
      };

      if (!formattedData.every(isValidQuestion)) {
        throw new Error('Invalid question format received from API');
      }

      setQuestions(formattedData);
    } catch (error) {
      console.error('Error details:', error);
      if (error.message.includes('CORS')) {
        alert('Network error: CORS policy restriction. Please check API configuration.');
      } else {
        alert(`Failed to generate question: ${error.message}`);
      }
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const QuestionDisplay = ({ questions }) => {
    // Early return if no questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return null;
    }

    const handleAnswerSelect = (answer) => {
      setSelectedAnswer(answer);
      setIsAnswerChecked(false);
    };

    const checkAnswer = () => {
      setIsAnswerChecked(true);
    };

    const getAnswerLetter = (index) => {
      return String.fromCharCode(65 + index); // Converts 0 -> 'A', 1 -> 'B', etc.
    };

    const currentQuestion = questions[0];
    
    // Safely check the answer
    const isCorrect = selectedAnswer && currentQuestion['correct answer']  // Changed from 'correct-answer'
      ? currentQuestion['correct answer'].toUpperCase() === selectedAnswer.toUpperCase()
      : false;

    // Safely get the explanation
    const selectedExplanation = selectedAnswer && currentQuestion 
      ? currentQuestion[`explanation-${selectedAnswer.toLowerCase()}`] || ''
      : '';

    return (
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white',
      }}>
        <h4>Generated Question</h4>
        {questions.map((q, index) => (
          <div key={q['question-id'] || index} style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: '1px solid #eee',
            borderRadius: '4px'
          }}>
            <p style={{ fontWeight: 'bold', textAlign: 'left' }}>
              {q['question-text']}
            </p>
            <div style={{ textAlign: 'left', marginLeft: '1rem' }}>
              {['option-a', 'option-b', 'option-c', 'option-d'].map((option, idx) => (
                <div 
                  key={option}
                  style={{ 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAnswerSelect(getAnswerLetter(idx))}
                >
                  <input
                    type="radio"
                    checked={selectedAnswer === getAnswerLetter(idx)}
                    onChange={() => {}}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>{getAnswerLetter(idx)}) {q[option]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={checkAnswer}
                disabled={!selectedAnswer}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                  opacity: selectedAnswer ? 1 : 0.7,
                }}
              >
                Check Answer
              </button>
              <button
                onClick={generateSingleQuestion}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Next
              </button>
            </div>
            {isAnswerChecked && selectedAnswer && (
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                borderRadius: '4px',
                backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                color: isCorrect ? '#155724' : '#721c24',
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  color: '#333',
                  fontSize: '0.9rem'
                }}>
                  {selectedExplanation}
                </div>
              </div>
            )}
            <p style={{ 
              marginTop: '1rem', 
              color: '#666', 
              fontSize: '0.9rem',
              textAlign: 'left' 
            }}>
              Domain: {q.domain}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Logo in top left */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '2rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      }}>
        TheCompTIABible
      </div>

      {/* Main Content Layout */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginTop: '4rem',
        height: '80vh', // Set fixed height
      }}>
        {/* Left Side - Dashboard */}
        <div style={{
          flex: '2',
          padding: '2rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          height: '100%', // Fill parent height
          minHeight: '800px', // Add minimum height to maintain expanded size
          overflow: 'auto', // Add scroll if content overflows
        }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Dashboard</h2>
          
          {/* Generator Boxes Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            padding: '1rem',
            marginBottom: '2rem', // Add space between boxes and questions
          }}>
            {/* Single Question Generator Box */}
            <div style={{
              padding: '2rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              textAlign: 'center',
            }}>
              <h3>Single Question Generator</h3>
              <div style={{ marginBottom: '1rem' }}>
                <select 
                  value={selectedExam}
                  onChange={handleExamChange}
                  style={{
                    padding: '0.5rem',
                    marginRight: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  {Object.entries(examOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select 
                  value={selectedDomain}
                  onChange={handleDomainChange}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  {domainOptions[selectedExam].map(domain => (
                    <option key={domain} value={domain}>Domain {domain}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateSingleQuestion}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Generate Question
              </button>
              {loading && <p>Generating question...</p>}
            </div>

            {/* Practice Exam Generator Box */}
            <div style={{
              padding: '2rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <h3>Practice Exam Generator</h3>
              <p>Generate full practice exams</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Coming soon...</p>
            </div>
          </div>

          {/* Display generated questions */}
          <QuestionDisplay questions={questions} />
        </div>

        {/* Right Side - Resources */}
        <div style={{
          flex: '1',
          padding: '2rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          height: '100%', // Fill parent height
        }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Resources</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>
            Useful CompTIA study resources and links will be added here soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
