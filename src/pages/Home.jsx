import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ExamReview from '../components/ExamReview';

function Home() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const examResults = location.state?.examResults;
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [selectedExam, setSelectedExam] = useState('A1101');
  const [selectedDomain, setSelectedDomain] = useState('1.1');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [practiceExamQuestionCount, setPracticeExamQuestionCount] = useState('30');
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

  const questionCountOptions = ['5', '15', '30', '60', '90'];

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
      // Clear exam results when generating new question
      navigate('/', { state: { examResults: null } });
      
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

  const handlePracticeExamGenerate = async () => {
    try {
      setLoading(true);
      // Clear exam results when starting new practice exam
      navigate('/', { state: { examResults: null } });
      
      const params = {
        exam: selectedExam,
        count: practiceExamQuestionCount
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to exam page with questions
      navigate('/exam', { state: { questions: data } });
      
    } catch (error) {
      console.error('Error generating practice exam:', error);
      alert('Failed to generate practice exam questions');
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
        border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
        borderRadius: '8px',
        backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
        color: isDarkMode ? '#ffffff' : '#000000',
      }}>
        <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Generated Question</h4>
        {questions.map((q, index) => (
          <div key={q['question-id'] || index} style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: `1px solid ${isDarkMode ? '#404040' : '#eee'}`,
            borderRadius: '4px',
            backgroundColor: isDarkMode ? '#363636' : 'white',
          }}>
            <p style={{ 
              fontWeight: 'bold', 
              textAlign: 'left',
              color: isDarkMode ? '#ffffff' : '#000000',
            }}>
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
                    color: isDarkMode ? '#ffffff' : '#000000',
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

            {/* Check Answer and Next buttons container */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
            }}>
              <button
                onClick={checkAnswer}
                disabled={!selectedAnswer}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isDarkMode ? '#0066cc' : '#28a745',
                  color: '#ffffff',
                  cursor: !selectedAnswer ? 'not-allowed' : 'pointer',
                  opacity: !selectedAnswer ? 0.7 : 1,
                }}
              >
                Check Answer
              </button>
              <button
                onClick={generateSingleQuestion}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                  color: '#ffffff',
                  cursor: 'pointer',
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
                backgroundColor: isDarkMode 
                  ? (isCorrect ? '#1b4332' : '#442c2c')
                  : (isCorrect ? '#d4edda' : '#f8d7da'),
                color: isDarkMode
                  ? '#ffffff'
                  : (isCorrect ? '#155724' : '#721c24'),
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  color: isDarkMode ? '#cccccc' : '#333333',
                  fontSize: '0.9rem'
                }}>
                  {selectedExplanation}
                </div>
              </div>
            )}
            
            <p style={{ 
              marginTop: '1rem', 
              color: isDarkMode ? '#999999' : '#666666', 
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
    <div className="app-container" style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      color: isDarkMode ? '#ffffff' : '#000000',
      overflow: 'hidden',
    }}>
      <header style={{
        padding: '0.5rem 1rem',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>TheCompTIABible</h1>
      </header>

      <nav style={{
        backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
        padding: '0.5rem 1rem',
        color: '#ffffff',
      }}>
        <div>Navigation</div>
      </nav>

      <main style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        overflow: 'hidden', // Add scroll to individual sections if needed
      }}>
        <aside style={{
          width: '250px',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          borderRight: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          overflow: 'auto',
          padding: '1rem',
        }}>
          <section className="question-generator">
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Single Question Generator</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <select 
                value={selectedExam}
                onChange={handleExamChange}
                style={{
                  width: '100%',
                  marginBottom: '0.5rem',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                  backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                  color: isDarkMode ? '#ffffff' : '#000000',
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
                  width: '100%',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                  backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                  color: isDarkMode ? '#ffffff' : '#000000',
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
                width: '100%',
                padding: '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Generate Question
            </button>
          </section>

          <section className="practice-exam" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}` }}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Practice Exam Generator</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <select 
                value={selectedExam}
                onChange={handleExamChange}
                style={{
                  width: '100%',
                  marginBottom: '0.5rem',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                  backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              >
                {Object.entries(examOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select 
                value={practiceExamQuestionCount}
                onChange={(e) => setPracticeExamQuestionCount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.25rem',
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                  backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              >
                {questionCountOptions.map(count => (
                  <option key={count} value={count}>{count} Questions</option>
                ))}
              </select>
            </div>
            <button
              onClick={handlePracticeExamGenerate}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Start Practice Exam
            </button>
          </section>
        </aside>

        <section className="content-area" style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
          overflow: 'auto',
          padding: '1rem',
        }}>
          {loading ? (
            <LoadingSpinner isDarkMode={isDarkMode} />
          ) : examResults ? (
            <ExamReview examResults={examResults} isDarkMode={isDarkMode} />
          ) : !questions ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: isDarkMode ? '#666' : '#999'
            }}>
              Generate a question to begin
            </div>
          ) : (
            <article className="question-display">
              <QuestionDisplay questions={questions} />
            </article>
          )}
        </section>

        <aside style={{
          width: '250px',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          borderLeft: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          overflow: 'auto',
          padding: '1rem',
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Resources</h2>
          <p style={{ 
            color: isDarkMode ? '#cccccc' : '#666666',
            fontSize: '0.9rem',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Useful CompTIA study resources and links will be added here soon.
          </p>
        </aside>
      </main>

      <footer style={{
        padding: '0.5rem',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>© 2024 TheCompTIABible. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
