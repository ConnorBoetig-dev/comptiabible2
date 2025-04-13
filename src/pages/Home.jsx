import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ExamReview from '../components/ExamReview';
import { getSignInUrl } from '../config/auth';

function Home() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const examResults = location.state?.examResults;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [selectedExam, setSelectedExam] = useState('A1101');
  const [selectedDomain, setSelectedDomain] = useState('1.1');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [practiceExamQuestionCount, setPracticeExamQuestionCount] = useState('30');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [isPortsMode, setIsPortsMode] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('identify_protocol_from_number');
  const [isCommandsMode, setIsCommandsMode] = useState(false);
  const [isNetCommandsMode, setIsNetCommandsMode] = useState(false);
  const [selectedCommandQuestionType, setSelectedCommandQuestionType] = useState('scenario_based');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNetCommandQuestionType, setSelectedNetCommandQuestionType] = useState('scenario_based');
  const [domainContent, setDomainContent] = useState(null);
  const [resourceContent, setResourceContent] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedNoteContent, setSelectedNoteContent] = useState(null);
  const [showMobileNotes, setShowMobileNotes] = useState(false);

  const QUESTION_TYPE_LABELS = {
    'identify_protocol_from_number': 'Identify Protocol (from Port Number)',
    'identify_port_from_description': 'Identify Port (from Description)',
    'identify_protocol_from_description': 'Identify Protocol (from Description)',
    'compare_protocols': 'Compare Protocols'
  };

  const COMMAND_QUESTION_TYPES = {
    'scenario_based': 'Scenario Based',
    'command_to_description': 'Command to Description',
    'description_to_command': 'Description to Command'
  };

  const clearAllStates = () => {
    // Clear all question-related states
    setQuestions(null);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    
    // Clear all mode states
    setIsPortsMode(false);
    setIsCommandsMode(false);
    setIsNetCommandsMode(false);  // Add this line
    
    // Clear chat-related states
    setChatHistory([]);
    setIsChatLoading(false);
    
    // Clear content states
    setDomainContent(null);
    setResourceContent(null);
    
    // Reset any selected options
    setSelectedExam('A1101');
    setSelectedDomain('1.1');
    setSelectedQuestionType('identify_protocol_from_number');
    setSelectedCommandQuestionType('scenario_based');
    setSelectedNetCommandQuestionType('scenario_based');
    
    // Clear practice exam states
    setPracticeExamQuestionCount('30');
    
    // Reset navigation state
    navigate('/', { state: null }, { replace: true });
  };

  const handleAboutClick = () => {
    // Clear states
    setQuestions(null);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsPortsMode(false);
    setIsCommandsMode(false);
    setIsNetCommandsMode(false);
    setChatHistory([]);
    setIsChatLoading(false);
    
    setResourceContent({
      title: 'About TheCompTIABible',
      content: `
        <div style="line-height: 1.6; margin-bottom: 2rem;">
          <p style="margin-bottom: 1.5rem;">
            Welcome to TheCompTIABible - Your best free resource for the CompTIA Trifecta.
          </p>

          <p style="margin-bottom: 1.5rem;">
            This is a personal project, it is a free study tool designed to simply provide practice questions to prepare for CompTIA certifications including A+, Network+, and Security+.
          </p>

          <p style="margin-bottom: 1.5rem;">
            Now if my AWS and OpenAI API charges go through the roof, scratch that. Maybe very minimal ads, but nothing constraining the user.
          </p>

          <p style="margin-bottom: 1.5rem;">
            This project was made in an effort to learn AWS, where I used DynamoDB, Lambda functions, API Gateway, CloudFront, Route 53, and S3 (The list goes on of random AWS services). Aside from that, React and OpenAI's GPT-3.5 API were definitely interesting to use for the first time.
          </p>
          
          <p style="margin-bottom: 2rem;">
            This is my first project implementing this many services, and I am far from even an entry level developer. If you have any feedback, please reach out.
          </p>

          <h3 style="margin: 1.5rem 0 1rem 0;">Features:</h3>
          <ul style="list-style-type: disc; margin-left: 2rem; margin-bottom: 1.5rem;">
            <li>Practice questions from all exam domains</li>
            <li>Interactive command-line study tools</li>
            <li>Network ports and protocols training</li>
            <li>Dark/Light mode for comfortable studying</li>
            <li>Exam notes</li>
          </ul>

          <h3 style="margin: 1.5rem 0 1rem 0;">Coming Soon:</h3>
          <ul style="list-style-type: disc; margin-left: 2rem; margin-bottom: 1.5rem;">
            <li>Sign in/Daily Streaks</li>
            <li>Community chat</li>
          </ul>

          <p style="margin-bottom: 1rem;">
            <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/connor-boetig-a23678290/" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; cursor: pointer;">Connor Boetig</a>
          </p>
          <p style="margin-bottom: 1.5rem;">
            <strong>Email:</strong> connorboetig20@gmail.com
          </p>
        </div>
      `
    });

    navigate('/', { state: null });
  };

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleDomainChange = async (e) => {
    const newDomain = e.target.value;
    setSelectedDomain(newDomain);
    
    // Only attempt to load domain content if we're in the notes section
    // and resourceContent exists (meaning we're viewing notes)
    if (resourceContent && !isPortsMode && !isCommandsMode && !isNetCommandsMode) {
      try {
        const examCode = selectedExam.replace('Security+', 'Sec').replace(/\s+/g, '');
        const formattedDomain = newDomain.replace('.', '_');
        
        const domainFile = await import(`../data/${examCode}/${formattedDomain}.json`);
        setDomainContent(domainFile.default);
      } catch (error) {
        console.error('Failed to load domain content:', error);
        setDomainContent(null);
      }
    }
  };

  const generateSingleQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setDomainContent(null);
      setResourceContent(null);
      
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        throw new Error('API key not found in environment variables');
      }

      const queryParams = new URLSearchParams({
        exam: selectedExam,
        domain: selectedDomain,
        count: '1'
      });

      const response = await fetch(`${API_BASE_URL}/generate-question?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure data is in the correct format
      if (!Array.isArray(data) || !data.length || !data[0]['question-text']) {
        throw new Error('Invalid question data format received from server');
      }

      setQuestions(data);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } catch (error) {
      console.error('Error generating question:', error);
      setError(error.message);
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeExamGenerate = async () => {
    try {
      setLoading(true);
      setDomainContent(null);
      setResourceContent(null);
      // Clear exam results when starting new practice exam
      navigate('/', { state: { examResults: null } });
      
      const params = {
        exam: selectedExam,
        count: practiceExamQuestionCount
      };
      
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/generate-practice-exam?${queryString}`, {
        method: 'POST',  // Changed to POST to match other endpoints
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,  // Add API key
          'Origin': window.location.origin
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate the response data
      if (!Array.isArray(data) || !data.length) {
        throw new Error('Invalid practice exam data received');
      }
      
      // Navigate to exam page with questions
      navigate('/exam', { state: { questions: data } });
      
    } catch (error) {
      console.error('Error generating practice exam:', error);
      alert('Failed to generate practice exam questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePortsMode = async () => {
    try {
      setLoading(true);
      setDomainContent(null);
      setResourceContent(null);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsPortsMode(true);
      
      const queryParams = new URLSearchParams({
        questionType: selectedQuestionType,
        count: '1'
      });

      const response = await fetch(`${API_BASE_URL}/get-common-ports?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Origin': window.location.origin
        },
        credentials: 'include',  // Changed back to 'include' to match Allow-Credentials: true
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching ports question:', error);
      alert(`Failed to fetch ports question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommandsMode = async () => {
    try {
      setLoading(true);
      setDomainContent(null);
      setResourceContent(null);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsCommandsMode(true);

      const queryParams = new URLSearchParams({
        type: selectedCommandQuestionType,
        count: '1'
      });

      const response = await fetch(`${API_BASE_URL}/get-a-commands?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestions([data[0]]);
    } catch (error) {
      console.error('Error fetching command question:', error);
      alert('Failed to fetch command question');
    } finally {
      setLoading(false);
    }
  };

  const handleNetCommandsMode = async () => {
    try {
      setLoading(true);
      setDomainContent(null);
      setResourceContent(null);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsNetCommandsMode(true);

      const queryParams = new URLSearchParams({
        'question-type': selectedNetCommandQuestionType,
        count: '1'
      });

      const response = await fetch(`${API_BASE_URL}/get-network-commands?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestions([data[0]]);
    } catch (error) {
      console.error('Error fetching network command question:', error);
      alert('Failed to fetch network command question');
    } finally {
      setLoading(false);
    }
  };

  const generateCommandQuestion = async () => {
    // Reset answer states before generating new question
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    
    if (isCommandsMode) {
      await handleCommandsMode();
    } else if (isNetCommandsMode) {
      await handleNetCommandsMode();
    } else if (isPortsMode) {
      await handlePortsMode();
    } else {
      await generateSingleQuestion();
    }
  };

  const QuestionDisplay = ({ questions, resourceContent, generateCommandQuestion }) => {
    if (resourceContent) {
      return (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: `1px solid ${isDarkMode ? '#404040' : '#eee'}`,
        }}>
          <h2 style={{ 
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: '1.5rem'
          }}>
            {resourceContent.title}
          </h2>
          <div 
            dangerouslySetInnerHTML={{ __html: resourceContent.content }}
            style={{ 
              color: isDarkMode ? '#cccccc' : '#666666',
              lineHeight: '1.6'
            }}
          />
        </div>
      );
    }

    // Add ref for explanation section
    const explanationRef = useRef(null);

    const handleAnswerSelect = (answer) => {
      setSelectedAnswer(answer);
      setIsAnswerChecked(false);
    };

    const checkAnswer = () => {
      setIsAnswerChecked(true);
      // Add small delay to ensure explanation is rendered before scrolling
      setTimeout(() => {
        if (window.innerWidth <= 768) { // Only scroll on mobile
          explanationRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    };

    const getAnswerLetter = (index) => {
      return String.fromCharCode(65 + index); // Converts 0 -> 'A', 1 -> 'B', etc.
    };

    const currentQuestion = questions[0];
    const isPortQuestion = isPortsMode && currentQuestion;
    
    // Modify the answer checking logic to handle both types of questions
    const isCorrect = selectedAnswer && (
      isPortQuestion 
        ? selectedAnswer.toUpperCase() === currentQuestion['correct answer']?.toUpperCase()
        : selectedAnswer.toUpperCase() === currentQuestion['correct answer']?.toUpperCase()
    );

    // Only show explanation after answer is checked
    const getExplanation = () => {
      if (!isAnswerChecked || !selectedAnswer) return null;
      
      // Get explanation for the selected answer
      const explanationKey = `explanation-${selectedAnswer.toLowerCase()}`;
      return currentQuestion[explanationKey];
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
        <p style={{ 
          fontWeight: 'bold',
          marginBottom: '2rem',
          fontSize: '1.3rem',
          color: isDarkMode ? '#ffffff' : '#000000',
        }}>
          {currentQuestion['question-text']}
        </p>

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
                backgroundColor: selectedAnswer === getAnswerLetter(idx)
                  ? isAnswerChecked
                    ? (selectedAnswer === currentQuestion['correct answer']
                      ? isDarkMode ? '#1b4332' : '#e8f5e9'
                      : isDarkMode ? '#442c2c' : '#ffebee')
                    : isDarkMode ? '#363636' : '#e3f2fd'
                  : isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: '1.1rem',
                transition: 'background-color 0.2s ease',
              }}
            >
              {getAnswerLetter(idx)}) {currentQuestion[option]}
            </div>
          ))}
        </div>

        {/* Explanation section */}
        {isAnswerChecked && selectedAnswer && (
          <div 
            ref={explanationRef}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: isDarkMode ? '#363636' : '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <strong>Explanation:</strong><br/>
            {getExplanation()}
          </div>
        )}

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
              padding: '0.8rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isDarkMode ? '#28a745' : '#2e7d32',
              color: '#ffffff',
              cursor: !selectedAnswer ? 'not-allowed' : 'pointer',
              opacity: !selectedAnswer ? 0.7 : 1,
              fontSize: '1.1rem',
            }}
          >
            Check Answer
          </button>
          <button
            onClick={generateCommandQuestion}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const AIChatSection = ({ currentQuestion, selectedAnswer }) => {
    const { isDarkMode } = useTheme();
    const [localChatMessage, setLocalChatMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const chatInputRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const [isMobile] = useState(window.innerWidth <= 768);
    const fixedChatHeight = isMobile ? '300px' : '200px';

    const scrollChatToBottom = () => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    };

    const handleInputFocus = () => {
      // Optional: Add any focus handling logic here
    };

    const handleInputChange = (e) => {
      setLocalChatMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!localChatMessage.trim()) return;
      
      setIsChatLoading(true);
      const userMessage = localChatMessage;
      setLocalChatMessage('');
      setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

      try {
        const requestBody = {
          questionContext: {
            question_text: currentQuestion['question-text'],
            option_a: currentQuestion['option-a'],
            option_b: currentQuestion['option-b'],
            option_c: currentQuestion['option-c'],
            option_d: currentQuestion['option-d'],
            selected_answer: selectedAnswer || 'No answer yet',
            correct_answer: currentQuestion['correct answer']
          },
          chatHistory: chatHistory,
          userMessage: userMessage
        };

        const response = await fetch(`${API_BASE_URL}/context-gpt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_API_KEY
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      } catch (error) {
        console.error('Error in chat:', error);
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request.' 
        }]);
      } finally {
        setIsChatLoading(false);
      }
    };

    useEffect(() => {
      scrollChatToBottom();
    }, [chatHistory]);

    return (
      <div className="chat-section" style={{ 
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h4 style={{ 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ textDecoration: 'underline' }}>Need further clarification? Ask AI.</span>
          <span style={{ 
            color: isDarkMode ? '#999' : '#666',
            fontWeight: 'normal',
            fontSize: '0.9em'
          }}>
            "How is that wrong?" "I don't get the question.."
          </span>
        </h4>
        
        <div 
          ref={chatMessagesRef}
          className="chat-messages" 
          style={{ 
            height: fixedChatHeight,
            overflowY: 'auto',
            marginBottom: '10px',
            border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
            borderRadius: '4px',
            padding: '10px'
          }}
        >
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: msg.role === 'assistant' ? 
                  (isDarkMode ? '#363636' : '#f0f0f0') : 'transparent',
                borderRadius: '4px',
                wordBreak: 'break-word'
              }}
            >
              {msg.content}
            </div>
          ))}
          {isChatLoading && <div style={{ padding: '8px' }}>AI is thinking...</div>}
        </div>

        <form 
          onSubmit={handleSubmit} 
          style={{
            display: 'flex',
            gap: '8px',
            position: 'relative'
          }}
        >
          <input
            ref={chatInputRef}
            type="text"
            value={localChatMessage}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            style={{
              padding: '12px',
              borderRadius: '4px',
              border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
              backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              width: '100%',
              fontSize: '16px'
            }}
          />
          <button 
            type="submit" 
            disabled={isChatLoading || !localChatMessage.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
              color: '#ffffff',
              cursor: !localChatMessage.trim() ? 'not-allowed' : 'pointer',
              opacity: !localChatMessage.trim() ? 0.7 : 1,
              whiteSpace: 'nowrap',
              minWidth: '80px'
            }}
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  const ResourceAccordion = ({ isDarkMode, onContentSelect, isMobile }) => {
    const [openSections, setOpenSections] = useState({});
    const [openDomains, setOpenDomains] = useState({});

    // Add back the toggle functions
    const toggleSection = (exam) => {
      setOpenSections(prev => ({
        ...prev,
        [exam]: !prev[exam]
      }));
    };

    const toggleDomain = (domainKey) => {
      setOpenDomains(prev => ({
        ...prev,
        [domainKey]: !prev[domainKey]
      }));
    };

    const handleDomainItemClick = async (exam, domain) => {
      try {
        // Handle different exam codes
        let examCode = exam
          .replace('Security+', 'Sec')
          .replace('Network+', 'Net')  // Change Network+ to Net
          .replace('A+', 'A')
          .replace(/\s+/g, '');
        
        const formattedDomain = domain.split(' ')[0].replace('.', '_');
        console.log(`Attempting to load: ../data/${examCode}/${formattedDomain}.json`); // Debug log
        
        const domainFile = await import(`../data/${examCode}/${formattedDomain}.json`);
        setQuestions(null);
        onContentSelect(domainFile.default);
      } catch (error) {
        console.error('Failed to load domain content:', error);
        onContentSelect(null);
      }
    };

    const resources = {
      'A+ 1101': {
        'Domain 1: Mobile Devices': [
          '1.1 Given a scenario, install and configure laptop hardware and components',
          '1.2 Compare and contrast the display components of mobile devices',
          '1.3 Given a scenario, set up and configure accessories and ports of mobile devices',
          '1.4 Given a scenario, configure basic mobile-device network connectivity and application support'
        ],
        'Domain 2: Networking': [
          '2.1 Compare and contrast Transmission Control Protocol (TCP) and User Datagram Protocol (UDP) ports, protocols, and their purposes',
          '2.2 Compare and contrast common networking hardware',
          '2.3 Compare and contrast protocols for wireless networking',
          '2.4 Summarize services provided by networked hosts',
          '2.5 Given a scenario, install and configure basic wired/wireless small office/home office (SOHO) networks',
          '2.6 Compare and contrast common network configuration concepts',
          '2.7 Compare and contrast Internet connection types, network types, and their features',
          '2.8 Given a scenario, use networking tools'
        ],
        'Domain 3: Hardware': [
          '3.1 Explain basic cable types and their connectors, features, and purposes',
          '3.2 Given a scenario, install the appropriate RAM',
          '3.3 Given a scenario, select and install storage devices',
          '3.4 Given a scenario, install and configure motherboards, central processing units (CPUs), and add-on cards',
          '3.5 Given a scenario, install or replace the appropriate power supply',
          '3.6 Given a scenario, deploy and configure multifunction devices/printers and settings',
          '3.7 Given a scenario, install and replace printer consumables'
        ],
        'Domain 4: Virtualization and Cloud Computing': [
          '4.1 Summarize cloud-computing concepts',
          '4.2 Summarize aspects of client-side virtualization'
        ],
        'Domain 5: Hardware and Network Troubleshooting': [
          '5.1 Given a scenario, apply the best practice methodology to resolve problems',
          '5.2 Given a scenario, troubleshoot problems related to motherboards, RAM, CPU, and power',
          '5.3 Given a scenario, troubleshoot and diagnose problems with storage drives and RAID arrays',
          '5.4 Given a scenario, troubleshoot video, projector, and display issues',
          '5.5 Given a scenario, troubleshoot common issues with mobile devices',
          '5.6 Given a scenario, troubleshoot and resolve printer issues',
          '5.7 Given a scenario, troubleshoot problems with wired and wireless networks'
        ]
      },
      'A+ 1102': {
        'Domain 1: Operating Systems': [
          '1.1 Identify basic features of Microsoft Windows editions',
          '1.2 Given a scenario, use the appropriate Microsoft command-line tool',
          '1.3 Given a scenario, use features and tools of the Microsoft Windows 10 operating system (OS)',
          '1.4 Given a scenario, use the appropriate Microsoft Windows 10 Control Panel utility',
          '1.5 Given a scenario, use the appropriate Windows settings',
          '1.6 Given a scenario, configure Microsoft Windows networking features on a client/desktop',
          '1.7 Given a scenario, apply application installation and configuration concepts',
          '1.8 Explain common OS types and their purposes',
          '1.9 Given a scenario, perform OS installations and upgrades in a diverse OS environment',
          '1.10 Identify common features and tools of the macOS/desktop OS',
          '1.11 Identify common features and tools of the Linux client/desktop OS'
        ],
        'Domain 2: Security': [
          '2.1 Summarize various security measures and their purposes',
          '2.2 Compare and contrast wireless security protocols and authentication methods',
          '2.3 Given a scenario, detect, remove, and prevent malware using the appropriate tools and methods',
          '2.4 Explain common social-engineering attacks, threats, and vulnerabilities',
          '2.5 Given a scenario, manage and configure basic security settings in the Microsoft Windows OS',
          '2.6 Given a scenario, configure a workstation to meet best practices for security',
          '2.7 Explain common methods for securing mobile and embedded devices',
          '2.8 Given a scenario, use common data destruction and disposal methods',
          '2.9 Given a scenario, configure appropriate security settings on small office/home office (SOHO) wireless and wired networks',
          '2.10 Given a scenario, install and configure browsers and relevant security settings'
        ],
        'Domain 3: Software Troubleshooting': [
          '3.1 Given a scenario, troubleshoot common Windows OS problems',
          '3.2 Given a scenario, troubleshoot common personal computer (PC) security issues',
          '3.3 Given a scenario, use best practice procedures for malware removal',
          '3.4 Given a scenario, troubleshoot common mobile OS and application issues',
          '3.5 Given a scenario, troubleshoot common mobile OS and application security issues'
        ],
        'Domain 4: Operational Procedures': [
          '4.1 Given a scenario, implement best practices associated with documentation and support systems information management',
          '4.2 Explain basic change-management best practices',
          '4.3 Given a scenario, implement workstation backup and recovery methods',
          '4.4 Given a scenario, use common safety procedures',
          '4.5 Summarize environmental impacts and local environmental controls',
          '4.6 Explain the importance of prohibited content/activity and privacy, licensing, and policy concepts',
          '4.7 Given a scenario, use proper communication techniques and professionalism',
          '4.8 Identify the basics of scripting',
          '4.9 Given a scenario, use remote access technologies'
        ]
      },
      'Network+': {
        'Domain 1: Networking Concepts': [
          '1.1 Explain concepts related to the Open Systems Interconnection (OSI) reference model',
          '1.2 Compare and contrast networking appliances, applications, and functions',
          '1.3 Summarize cloud concepts and connectivity options',
          '1.4 Explain common networking ports, protocols, services, and traffic types',
          '1.5 Compare and contrast transmission media and transceivers',
          '1.6 Compare and contrast network topologies, architectures, and types',
          '1.7 Given a scenario, use appropriate IPv4 network addressing',
          '1.8 Summarize evolving use cases for modern network environments'
        ],
        'Domain 2: Network Implementation': [
          '2.1 Explain characteristics of routing technologies',
          '2.2 Given a scenario, configure switching technologies and features',
          '2.3 Given a scenario, select and configure wireless devices and technologies',
          '2.4 Explain important factors of physical installations'
        ],
        'Domain 3: Network Operations': [
          '3.1 Explain the purpose of organizational processes and procedures',
          '3.2 Given a scenario, use network monitoring technologies',
          '3.3 Explain disaster recovery (DR) concepts',
          '3.4 Given a scenario, implement IPv4 and IPv6 network services',
          '3.5 Compare and contrast network access and management methods'
        ],
        'Domain 4: Network Security': [
          '4.1 Explain the importance of basic network security concepts',
          '4.2 Summarize various types of attacks and their impact to the network',
          '4.3 Given a scenario, apply network security features, defense techniques, and solutions'
        ],
        'Domain 5: Network Troubleshooting': [
          '5.1 Explain the troubleshooting methodology',
          '5.2 Given a scenario, troubleshoot common cabling and physical interface issues',
          '5.3 Given a scenario, troubleshoot common issues with network services',
          '5.4 Given a scenario, troubleshoot common performance issues',
          '5.5 Given a scenario, use the appropriate tool or protocol to solve networking issues'
        ]
      },
      'Security+': {
        'Domain 1: General Security Concepts': [
          '1.1 Compare and contrast various types of security controls',
          '1.2 Summarize fundamental security concepts',
          '1.3 Explain the importance of change management processes and the impact to security',
          '1.4 Explain the importance of using appropriate cryptographic solutions'
        ],
        'Domain 2: Threats, Vulnerabilities, and Mitigations': [
          '2.1 Compare and contrast common threat actors and motivations',
          '2.2 Explain common threat vectors and attack surfaces',
          '2.3 Explain various types of vulnerabilities',
          '2.4 Given a scenario, analyze indicators of malicious activity',
          '2.5 Explain the purpose of mitigation techniques used to secure the enterprise'
        ],
        'Domain 3: Security Architecture': [
          '3.1 Compare and contrast security implications of different architecture models',
          '3.2 Given a scenario, apply security principles to secure enterprise infrastructure',
          '3.3 Compare and contrast concepts and strategies to protect data',
          '3.4 Explain the importance of resilience and recovery in security architecture'
        ],
        'Domain 4: Security Operations': [
          '4.1 Given a scenario, apply common security techniques to computing resources',
          '4.2 Explain the security implications of proper hardware, software, and data asset management',
          '4.3 Explain various activities associated with vulnerability management',
          '4.4 Explain security alerting and monitoring concepts and tools',
          '4.5 Given a scenario, modify enterprise capabilities to enhance security',
          '4.6 Given a scenario, implement and maintain identity and access management',
          '4.7 Explain the importance of automation and orchestration related to secure operations',
          '4.8 Explain appropriate incident response activities',
          '4.9 Given a scenario, use data sources to support an investigation'
        ],
        'Domain 5: Security Program Management and Oversight': [
          '5.1 Summarize elements of effective security governance',
          '5.2 Explain elements of the risk management process',
          '5.3 Explain the processes associated with third-party risk assessment and management',
          '5.4 Summarize elements of effective security compliance',
          '5.5 Explain types and purposes of audits and assessments',
          '5.6 Given a scenario, implement security awareness practices'
        ]
      }
    };

    return (
      <div style={{ width: '100%' }}>
        {Object.entries(resources).map(([exam, domains]) => (
          <div key={exam} style={{ marginBottom: '10px' }}>
            <div 
              onClick={() => toggleSection(exam)}
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
              <span>{exam}</span>
              <span style={{ 
                transition: 'transform 0.3s',
                transform: openSections[exam] ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '12px'
              }}>▼</span>
            </div>
            
            <div style={{
              overflow: 'hidden',
              maxHeight: openSections[exam] ? '2000px' : '0',
              transition: 'max-height 0.3s ease-in-out',
              backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
            }}>
              {Object.entries(domains).map(([domain, subDomains]) => (
                <div key={domain} style={{ borderBottom: `1px solid ${isDarkMode ? '#404040' : '#ddd'}` }}>
                  <div
                    onClick={() => toggleDomain(`${exam}-${domain}`)}
                    style={{
                      padding: '8px 24px',
                      cursor: 'pointer',
                      backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                      color: isDarkMode ? '#cccccc' : '#666666',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{domain}</span>
                    <span style={{ 
                      transition: 'transform 0.3s',
                      transform: openDomains[`${exam}-${domain}`] ? 'rotate(180deg)' : 'rotate(0deg)',
                      fontSize: '12px'
                    }}>▼</span>
                  </div>
                  <div style={{
                    overflow: 'hidden',
                    maxHeight: openDomains[`${exam}-${domain}`] ? '2000px' : '0',
                    transition: 'max-height 0.3s ease-in-out',
                    backgroundColor: isDarkMode ? '#262626' : '#f8f8f8',
                    overflowY: 'auto'
                  }}>
                    {subDomains.map((subDomain, index) => (
                      <div
                        key={index}
                        onClick={() => handleDomainItemClick(exam, subDomain)}
                        style={{
                          padding: '8px 36px',
                          borderTop: index === 0 ? `1px solid ${isDarkMode ? '#404040' : '#ddd'}` : 'none',
                          color: isDarkMode ? '#66b2ff' : '#0066cc',
                          fontSize: '0.9em',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#333333' : '#f0f0f0'
                          }
                        }}
                      >
                        {subDomain}
                      </div>
                    ))}
                  </div>
                </div>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>TheCompTIABible</h1>
        
        <button
          onClick={handleAboutClick}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s ease',
          }}
        >
          About
        </button>
      </header>

      <main style={{
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        flex: 1,
        width: '100%',
        overflow: 'hidden',
        overflowX: 'hidden',
        height: window.innerWidth <= 768 ? 'auto' : '100%',
      }}>
        <aside 
          className="sidebar"
          style={{
            width: isSidebarCollapsed ? '50px' : (isMobile ? '100%' : '250px'),
            backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
            padding: isSidebarCollapsed ? '1rem 0.5rem' : '1rem',
            borderRight: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          }}
        >
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
                width: isMobile ? '95%' : '100%',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
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
                width: isMobile ? '95%' : '100%',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              }}
            >
              Start Practice Exam
            </button>
          </section>

          {/* Ports Study section */}
          <section className="ports-study" style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}` 
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Master Ports</h2>
            
            <select
              value={selectedQuestionType}
              onChange={(e) => setSelectedQuestionType(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.25rem',
                borderRadius: '3px',
                border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#ffffff' : '#000000',
              }}
            >
              {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <button
              onClick={handlePortsMode}
              disabled={loading}
              style={{
                width: isMobile ? '95%' : '100%',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              }}
            >
              Study Ports
            </button>
          </section>

          {/* Command Study section */}
          <section className="commands-study" style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}` 
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Master Commands from A+</h2>
            
            <select
              value={selectedCommandQuestionType}
              onChange={(e) => setSelectedCommandQuestionType(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.25rem',
                borderRadius: '3px',
                border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#ffffff' : '#000000',
              }}
            >
              {Object.entries(COMMAND_QUESTION_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <button
              onClick={handleCommandsMode}
              disabled={loading}
              style={{
                width: isMobile ? '95%' : '100%',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              }}
            >
              Study Commands
            </button>
          </section>

          {/* Network Commands Study section */}
          <section className="network-commands-study" style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}` 
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>Master Commands from Network+</h2>
            
            <select
              value={selectedNetCommandQuestionType}
              onChange={(e) => setSelectedNetCommandQuestionType(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.25rem',
                borderRadius: '3px',
                border: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
                backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#ffffff' : '#000000',
              }}
            >
              {Object.entries(COMMAND_QUESTION_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <button
              onClick={handleNetCommandsMode}
              disabled={loading}
              style={{
                width: isMobile ? '95%' : '100%',
                padding: isMobile ? '0.25rem 0.5rem' : '0.25rem',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
                color: '#ffffff',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
              }}
            >
              Study Network+ Commands
            </button>
          </section>
        </aside>

        {isMobile ? (
          // Mobile content
          <>
            {isQuestionModalOpen ? (
              // Question Modal for mobile
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
                zIndex: 1000,
                padding: '1rem',
                overflow: 'auto'
              }}>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  ✕
                </button>
                <div style={{ marginTop: '2rem' }}>
                  {loading ? (
                    <LoadingSpinner isDarkMode={isDarkMode} />
                  ) : questions ? (
                    <article className="question-display">
                      <QuestionDisplay questions={questions} generateCommandQuestion={generateCommandQuestion} />
                      {questions && questions[0]?.type !== 'about' && <AIChatSection 
                        currentQuestion={questions[0]} 
                        selectedAnswer={selectedAnswer}
                      />}
                    </article>
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '80vh',
                      color: isDarkMode ? '#666' : '#999'
                    }}>
                      Generate a question to begin
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          // Desktop content - unchanged
          <section className="content-area" style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
            overflow: 'auto',
            overflowX: 'hidden',
            padding: '1rem',
            marginRight: window.innerWidth <= 768 ? 0 : (isSidebarCollapsed ? '50px' : '250px'),
            transition: 'margin-right 0.3s ease',
          }}>
            {loading ? (
              <LoadingSpinner isDarkMode={isDarkMode} />
            ) : examResults ? (
              <ExamReview examResults={examResults} isDarkMode={isDarkMode} />
            ) : !questions && !resourceContent ? (
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
                <QuestionDisplay 
                  questions={questions} 
                  resourceContent={resourceContent}
                  generateCommandQuestion={generateCommandQuestion}
                />
                {questions && questions[0]?.type !== 'about' && <AIChatSection 
                  currentQuestion={questions[0]} 
                  selectedAnswer={selectedAnswer}
                />}
              </article>
            )}
          </section>
        )}

        <aside style={{
          width: window.innerWidth <= 768 ? '100%' : (isSidebarCollapsed ? '50px' : '250px'),
          height: window.innerWidth <= 768 ? 'auto' : '100%',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          borderLeft: window.innerWidth <= 768 ? 'none' : `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          borderTop: window.innerWidth <= 768 ? `1px solid ${isDarkMode ? '#404040' : '#ddd'}` : 'none',
          overflow: 'hidden',
          padding: isSidebarCollapsed ? '1rem 0' : '1rem',
          position: window.innerWidth <= 768 ? 'relative' : 'fixed', // Change to relative on mobile
          right: 0,
          top: '64px',
          bottom: 0,
          transition: 'width 0.3s ease',
          // Remove or modify this line to show on mobile
          display: 'block',
        }}>
          {/* Add the clip button */}
          {!window.innerWidth <= 768 && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '50px',
                backgroundColor: isDarkMode ? '#404040' : '#ddd',
                border: 'none',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                fontSize: '12px',
              }}>
                ◀
              </span>
            </button>
          )}

          {/* Wrap the resources content */}
          <div style={{
            opacity: isSidebarCollapsed ? 0 : 1,
            visibility: isSidebarCollapsed ? 'hidden' : 'visible',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Take full height of parent
          }}>
            <h2 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#000000',
              padding: '8px 0',
              borderBottom: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
              flexShrink: 0, // Prevent header from shrinking
            }}>
              Notes for Exams
            </h2>
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px', // Add some padding for the scrollbar
              marginRight: '-8px', // Offset the padding to maintain alignment
            }}>
              <ResourceAccordion 
                isDarkMode={isDarkMode} 
                onContentSelect={(content) => {
                  setResourceContent(content);
                  setQuestions(null); // Clear any existing questions
                }} 
              />
            </div>
          </div>
        </aside>
      </main>

      <footer style={{
        padding: '0.5rem',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderTop: `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>© 2025 TheCompTIABible (personal project). All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
