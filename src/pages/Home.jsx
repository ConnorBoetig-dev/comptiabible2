import { useState, useRef, useEffect } from 'react';
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
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
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
      navigate('/', { state: { examResults: null } });
      setChatHistory([]); 

      const params = {
        exam: selectedExam,
        domain: selectedDomain,
        count: 1
      };
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${API_BASE_URL}?${queryString}`;
      console.log('Fetching from URL:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      // Log the raw response
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!Array.isArray(data)) {
        throw new Error('Expected array response from API');
      }

      if (data.length === 0) {
        throw new Error('No questions returned from API');
      }

      setQuestions(data);

      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const question = data[0];
      
      // Add this check
      console.log('Question data:', {
        text: question['question-text'],
        optionA: question['option-a'],
        optionB: question['option-b'],
        optionC: question['option-c'],
        optionD: question['option-d']
      });

      // Initialize chat history with the question and its options
      setChatHistory([
        {
          role: 'assistant',
          content: "Ask me 'Hows that wrong?!' or any other questions about the problem you answered!"
        }
      ]);

    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to fetch question: ${error.message}`);
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
                  className="answer-option"
                  style={{ 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                    backgroundColor: selectedAnswer === getAnswerLetter(idx)
                      ? isDarkMode ? '#363636' : '#e3f2fd'
                      : isDarkMode ? '#2d2d2d' : 'white',
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
                className="interactive-button"
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
                className="interactive-button"
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

  const AIChatSection = ({ currentQuestion, selectedAnswer }) => {
    const inputRef = useRef(null);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;
      
      setIsChatLoading(true);
      const userMessage = chatMessage;
      setChatMessage('');
      setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a CompTIA exam tutor. The current question is: ${currentQuestion['question-text']}. 
                         The user selected answer ${selectedAnswer || 'none'}: ${selectedAnswer ? currentQuestion[`option-${selectedAnswer.toLowerCase()}`] : 'No answer selected'}.
                         The correct answer is ${currentQuestion['correct answer']}: ${currentQuestion[`option-${currentQuestion['correct answer'].toLowerCase()}`]}.
                         The explanation is: ${currentQuestion[`explanation-${currentQuestion['correct answer'].toLowerCase()}`]}
                         When the user asks why something is wrong, refer to their selected answer and explain why it's incorrect and why the correct answer is better.`
              },
              ...chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              {
                role: "user",
                content: userMessage
              }
            ]
          })
        });

        const data = await response.json();
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: data.choices[0].message.content 
        }]);
      } catch (error) {
        console.error('Chat error:', error);
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      } finally {
        setIsChatLoading(false);
        // Focus on input after submitting
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }
    };

    const handleInputChange = (e) => {
      setChatMessage(e.target.value);
      // Ensure focus stays on the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Re-focus the input whenever chatMessage changes
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [chatMessage]);

    return (
      <div className="chat-section">
        <h4>Need further clarification? Ask AI.</h4>
        
        <div className="chat-messages">
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`chat-message ${msg.role}`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {msg.content}
            </div>
          ))}
          {isChatLoading && <div className="chat-loading">AI is thinking...</div>}
        </div>

        <form onSubmit={handleSubmit} className="chat-form">
          <input
            ref={inputRef}
            type="text"
            value={chatMessage}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            className="chat-input"
            style={{
              padding: '0.75rem',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: isDarkMode ? '#363636' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
            }}
            autoComplete="off"
          />
          <button 
            type="submit" 
            disabled={isChatLoading || !chatMessage.trim()}
            className="chat-submit"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
              color: '#ffffff',
              cursor: !chatMessage.trim() ? 'not-allowed' : 'pointer',
              opacity: !chatMessage.trim() ? 0.7 : 1,
            }}
          >
            Send
          </button>
        </form>

        <style>
          {`
            .chat-section {
              margin-top: 2rem;
              padding: 1rem;
              border: 1px solid ${isDarkMode ? '#404040' : '#ddd'};
              border-radius: 8px;
              background-color: ${isDarkMode ? '#2d2d2d' : 'white'};
              color: ${isDarkMode ? '#ffffff' : '#000000'};
            }

            .chat-messages {
              max-height: 200px;
              overflow-y: auto;
              margin-bottom: 1rem;
              padding: 0.5rem;
            }

            .chat-message {
              margin-bottom: 0.5rem;
              padding: 0.5rem;
              border-radius: 4px;
            }

            .chat-message.user {
              background-color: ${isDarkMode ? '#363636' : '#f5f5f5'};
              color: ${isDarkMode ? '#999999' : '#666666'}; /* Lighter color for user messages */
            }

            .chat-message.assistant {
              color: ${isDarkMode ? '#ffffff' : '#000000'}; /* Keep AI responses bright */
            }

            .chat-loading {
              font-style: italic;
              color: ${isDarkMode ? '#999' : '#666'};
            }

            .chat-form {
              display: flex;
              gap: 0.5rem;
            }

            .chat-input {
              flex: 1;
              padding: 0.5rem;
              border-radius: 4px;
              border: 1px solid ${isDarkMode ? '#404040' : '#ddd'};
              background-color: ${isDarkMode ? '#363636' : 'white'};
              color: ${isDarkMode ? '#ffffff' : '#000000'};
            }

            .chat-input:focus {
              outline: none;
              border-color: ${isDarkMode ? '#0066cc' : '#007bff'};
            }

            .chat-submit {
              padding: 0.5rem 1rem;
              border-radius: 4px;
              border: none;
              background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
              color: #ffffff;
              cursor: pointer;
            }

            .chat-submit:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
          `}
        </style>
      </div>
    );
  };

  const ResourceAccordion = ({ isDarkMode }) => {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (section) => {
      setOpenSections(prev => {
        const newState = {...prev};
        // Close all other sections first
        Object.keys(newState).forEach(key => {
          newState[key] = false;
        });
        // Toggle the clicked section
        newState[section] = !prev[section];
        return newState;
      });
    };

    const resources = {
      'A+ 1101': [
        { title: 'Hardware Components', url: '#hardware' },
        { title: 'Mobile Devices', url: '#mobile' },
        { title: 'Networking', url: '#networking' },
        { title: 'Virtualization', url: '#virtualization' },
      ],
      'A+ 1102': [
        { title: 'Operating Systems', url: '#os' },
        { title: 'Security', url: '#security' },
        { title: 'Software', url: '#software' },
        { title: 'Operational Procedures', url: '#procedures' },
      ],
      'Network+': [
        { title: 'Network Architecture', url: '#net-arch' },
        { title: 'Network Operations', url: '#net-ops' },
        { title: 'Network Security', url: '#net-security' },
        { title: 'Troubleshooting', url: '#troubleshooting' },
      ],
      'Security+': [
        { title: 'Attacks & Threats', url: '#attacks' },
        { title: 'Architecture & Design', url: '#arch-design' },
        { title: 'Implementation', url: '#implementation' },
        { title: 'Operations', url: '#operations' },
      ],
    };

    return (
      <div style={{ width: '100%' }}>
        {Object.entries(resources).map(([section, links]) => (
          <div key={section} style={{ marginBottom: '10px' }}>
            <div 
              onClick={() => toggleSection(section)}
              style={{
                padding: '8px 12px',
                backgroundColor: isDarkMode ? '#363636' : '#f0f0f0',
                color: isDarkMode ? '#ffffff' : '#333333',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`
              }}
            >
              <span>{section}</span>
              <span style={{ 
                transition: 'transform 0.3s',
                transform: openSections[section] ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '12px'
              }}>▼</span>
            </div>
            
            <div style={{
              overflow: 'hidden',
              maxHeight: openSections[section] ? '500px' : '0',
              transition: 'max-height 0.3s ease-in-out',
              backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
              border: openSections[section] ? `1px solid ${isDarkMode ? '#404040' : '#ddd'}` : 'none',
              borderTop: 'none',
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
            }}>
              {links.map((link, index) => (
                <a 
                  key={index}
                  href={link.url}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    color: isDarkMode ? '#cccccc' : '#666666',
                    textDecoration: 'none',
                    borderBottom: index < links.length - 1 ? 
                      `1px solid ${isDarkMode ? '#333333' : '#f0f0f0'}` : 'none',
                    transition: 'background-color 0.2s, padding-left 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = isDarkMode ? '#363636' : '#f5f5f5';
                    e.target.style.paddingLeft = '20px';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.paddingLeft = '16px';
                  }}
                >
                  {link.title}
                </a>
              ))}
            </div>
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
              {questions && <AIChatSection 
                currentQuestion={questions[0]} 
                selectedAnswer={selectedAnswer}
              />}
            </article>
          )}
        </section>

        <aside style={{
          width: '250px',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          borderLeft: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          overflow: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            padding: '8px 0',
            borderBottom: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          }}>
            Resources
          </h2>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ResourceAccordion isDarkMode={isDarkMode} />
          </div>
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
