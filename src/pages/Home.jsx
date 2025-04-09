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
  const API_BASE_URL = 'https://hgetzswjp8.execute-api.us-east-2.amazonaws.com/prod2';
  const [isPortsMode, setIsPortsMode] = useState(false);
  const PORTS_API_URL = 'https://aa8ph8je38.execute-api.us-east-2.amazonaws.com/prod/questions';
  const [selectedQuestionType, setSelectedQuestionType] = useState('identify_protocol_from_number');
  const [isCommandsMode, setIsCommandsMode] = useState(false);
  const COMMANDS_API_URL = 'https://lklcife942.execute-api.us-east-2.amazonaws.com/prod/CommandQuestions';
  const [selectedCommandQuestionType, setSelectedCommandQuestionType] = useState('scenario_based');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const NET_COMMANDS_API_URL = 'https://72btwlt62f.execute-api.us-east-2.amazonaws.com/prod';
  const [selectedNetCommandQuestionType, setSelectedNetCommandQuestionType] = useState('scenario_based');
  const [isNetCommandsMode, setIsNetCommandsMode] = useState(false);

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

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const generateSingleQuestion = async () => {
    try {
      setLoading(true);
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
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'  // Must be omit when using "*" for CORS
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);  // Add this for debugging
      setQuestions(data);
      
    } catch (error) {
      console.error('Full error details:', error);
      alert('Failed to fetch question');
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

  const generatePortsQuestion = async () => {
    if (isMobile) {
      setIsQuestionModalOpen(true);
    }
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsPortsMode(true);
      navigate('/', { state: { examResults: null } });
      setChatHistory([
        {
          role: 'assistant',
          content: "Ask me any questions about ports and protocols!"
        }
      ]);

      const queryParams = new URLSearchParams({
        questionType: selectedQuestionType
      }).toString();

      const response = await fetch(`${PORTS_API_URL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ports API Response:', data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No question returned from API');
      }

      setQuestions([data[0]]);

    } catch (error) {
      console.error('Error fetching ports question:', error);
      alert('Failed to fetch ports question');
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const generateCommandQuestion = async () => {
    if (isMobile) {
      setIsQuestionModalOpen(true);
    }
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsCommandsMode(true);
      navigate('/', { state: { examResults: null } });
      setChatHistory([
        {
          role: 'assistant',
          content: "Ask me any questions about A+ 1102 commands!"
        }
      ]);

      const queryParams = new URLSearchParams({
        type: selectedCommandQuestionType
      }).toString();

      const response = await fetch(`${COMMANDS_API_URL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Commands API Response:', data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No question returned from API');
      }

      setQuestions([data[0]]);

    } catch (error) {
      console.error('Error fetching command question:', error);
      alert('Failed to fetch command question');
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const generateNetCommandQuestion = async () => {
    if (isMobile) {
      setIsQuestionModalOpen(true);
    }
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsNetCommandsMode(true);
      navigate('/', { state: { examResults: null } });
      setChatHistory([
        {
          role: 'assistant',
          content: "Ask me any questions about Network+ commands!"
        }
      ]);

      const queryParams = new URLSearchParams({
        'question-type': selectedNetCommandQuestionType
      }).toString();

      const response = await fetch(`${NET_COMMANDS_API_URL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Network Commands API Response:', data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No question returned from API');
      }

      setQuestions([data[0]]);

    } catch (error) {
      console.error('Error fetching network command question:', error);
      alert('Failed to fetch network command question');
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const QuestionDisplay = ({ questions }) => {
    // Add at the beginning of the component
    if (questions[0]?.type === 'about') {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          color: isDarkMode ? '#ffffff' : '#000000',
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            color: isDarkMode ? '#ffffff' : '#000000',
          }}>
            About TheCompTIABible
          </h1>
          <div style={{
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            fontSize: '1.1rem',
          }}>
{`Welcome to TheCompTIABible - Your best free resource for the CompTIA Trifecta.

This is a personal project, it is a free study tool designed to simply provide 
practice questions to prepare for CompTIA certifications including A+, Network+, 
and Security+.

What makes it unique? I don't want anything from you. You won't see any subscription fees, 
ads, or any form of monetization. It's purely for everyone to use, as this material should be free.

Now if my AWS and OpenAI API charges go through the roof, scratch that. Maybe very minimal ads, but nothing constraining the user. 

Features:
• Practice questions from all exam domains
• Interactive command-line study tools
• Network ports and protocols training
• Dark/Light mode for comfortable studying

Coming Soon: 
• Sign in/Daily Streaks
• Community chat 

LinkedIn: `}<a href="https://www.linkedin.com/in/connor-boetig-a23678290/" target="_blank" rel="noopener noreferrer" style={{color: '#007bff', textDecoration: 'underline', cursor: 'pointer'}}>Connor Boetig</a>{`
Email: connorboetig20@gmail.com

This project was made in an effort to learn AWS, where I used DynamoDB, Lambda functions, API Gateway, CloudFront, Route 53, and S3 (The list goes on of random AWS services). Aside from that, React and OpenAI's GPT-3.5 API were definitely interesting to use for the first time.
This is my first project implementing this many services, and I am far from even an entry level developer. 
If you have any feedback, please reach out.`}</div>
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
        // Create context about the current question and answer
        const questionContext = `Question: ${currentQuestion['question-text']}\n` +
          `Options:\nA) ${currentQuestion['option-a']}\n` +
          `B) ${currentQuestion['option-b']}\n` +
          `C) ${currentQuestion['option-c']}\n` +
          `D) ${currentQuestion['option-d']}\n` +
          `User selected: ${selectedAnswer || 'No answer yet'}\n` +
          `Correct answer: ${currentQuestion['correct answer']}\n`;

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
                content: "You are a helpful AI tutor. Use the following question context to help the user understand the topic better: " + questionContext
              },
              ...chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              {
                role: "user",
                content: userMessage
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: data.choices[0].message.content 
        }]);
        scrollChatToBottom();
      } catch (error) {
        console.error('Chat error:', error);
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${error.message}. Please try again.` 
        }]);
        scrollChatToBottom();
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

  const ResourceAccordion = ({ isDarkMode }) => {
    const [openSections, setOpenSections] = useState({});
    const [openDomains, setOpenDomains] = useState({});

    const toggleSection = (section) => {
      setOpenSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const toggleDomain = (domain) => {
      setOpenDomains(prev => ({
        ...prev,
        [domain]: !prev[domain]
      }));
    };

    const resources = {
      'A+ 1101': {
        'Domain 1: Mobile Devices': [
          '1.1 Given a scenario, install and configure laptop hardware components',
          '1.2 Compare and contrast the display components of mobile devices',
          '1.3 Given a scenario, configure accessories and ports of mobile devices',
          '1.4 Given a scenario, configure basic mobile device network connectivity'
        ],
        'Domain 2: Networking': [
          '2.1 Compare and contrast TCP and UDP ports, protocols, and their purposes',
          '2.2 Compare and contrast common networking hardware devices',
          '2.3 Given a scenario, install and configure basic wired/wireless networks',
          '2.4 Compare and contrast wireless networking protocols',
          '2.5 Summarize services provided by networked hosts',
          '2.6 Explain common network configuration concepts',
          '2.7 Compare and contrast Internet connection types and features',
          '2.8 Given a scenario, use networking tools'
        ],
        'Domain 3: Hardware': [
          '3.1 Explain basic cable types and their connectors, features, and purposes',
          '3.2 Given a scenario, install RAM types',
          '3.3 Given a scenario, select and install storage devices',
          '3.4 Given a scenario, install and configure motherboards, CPUs, and add-on cards',
          '3.5 Given a scenario, install or replace the power supply',
          '3.6 Given a scenario, deploy and configure multifunction devices',
          '3.7 Given a scenario, install and replace printer consumables'
        ],
        'Domain 4: Virtualization and Cloud Computing': [
          '4.1 Compare and contrast cloud computing concepts',
          '4.2 Given a scenario, implement basic virtualization'
        ],
        'Domain 5: Hardware and Network Troubleshooting': [
          '5.1 Given a scenario, use the best practice methodology to resolve problems',
          '5.2 Given a scenario, troubleshoot problems related to motherboards, RAM, CPU, and power',
          '5.3 Given a scenario, troubleshoot hard drives and RAID arrays',
          '5.4 Given a scenario, troubleshoot video, projector, and display issues',
          '5.5 Given a scenario, troubleshoot common mobile device issues',
          '5.6 Given a scenario, troubleshoot printers',
          '5.7 Given a scenario, troubleshoot common wired and wireless network problems'
        ]
      },
      'A+ 1102': {
        'Domain 1: Operating Systems': [
          '1.1 Compare and contrast common operating system types and their purposes',
          '1.2 Compare and contrast features of Microsoft Windows versions',
          '1.3 Summarize general OS installation considerations and upgrade methods',
          '1.4 Given a scenario, use appropriate Microsoft command-line tools',
          '1.5 Given a scenario, use Microsoft operating system features and tools',
          '1.6 Given a scenario, use Microsoft Windows Control Panel utilities',
          '1.7 Given a scenario, configure Microsoft Windows networking',
          '1.8 Given a scenario, configure client-side virtualization',
          '1.9 Given a scenario, troubleshoot common OS issues',
          '1.10 Given a scenario, resolve common mobile OS and application issues',
          '1.11 Given a scenario, configure basic mobile device network connectivity'
        ],
        'Domain 2: Security': [
          '2.1 Summarize the importance of physical security measures',
          '2.2 Explain logical security concepts',
          '2.3 Compare and contrast wireless security protocols and authentication methods',
          '2.4 Given a scenario, detect, remove, and prevent malware',
          '2.5 Given a scenario, implement security best practices',
          '2.6 Given a scenario, implement appropriate data destruction and disposal methods',
          '2.7 Given a scenario, configure security on SOHO wireless and wired networks',
          '2.8 Given a scenario, use common safety procedures',
          '2.9 Given a scenario, use appropriate data destruction methods',
          '2.10 Given a scenario, configure security on client mobile devices'
        ],
        'Domain 3: Software Troubleshooting': [
          '3.1 Given a scenario, troubleshoot Microsoft Windows OS problems',
          '3.2 Given a scenario, troubleshoot and resolve PC security issues',
          '3.3 Given a scenario, use best practice procedures for malware removal',
          '3.4 Given a scenario, troubleshoot mobile OS and application issues',
          '3.5 Given a scenario, troubleshoot mobile OS and application security issues'
        ],
        'Domain 4: Operational Procedures': [
          '4.1 Compare and contrast best practices associated with types of documentation',
          '4.2 Given a scenario, implement basic change management best practices',
          '4.3 Given a scenario, implement basic disaster prevention and recovery methods',
          '4.4 Explain common safety procedures',
          '4.5 Explain environmental impacts and appropriate controls',
          '4.6 Explain the importance of prohibited content/activity and privacy, licensing, and policy concepts',
          '4.7 Given a scenario, use proper communication techniques and professionalism',
          '4.8 Identify the basics of scripting',
          '4.9 Given a scenario, use remote access technologies'
        ]
      },
      'Network+': {
        'Domain 1: Networking Concepts': [
          '1.1 Explain the purposes and uses of ports and protocols',
          '1.2 Explain devices, applications, protocols and services at their appropriate OSI layers',
          '1.3 Explain the concepts and characteristics of routing and switching',
          '1.4 Given a scenario, configure the appropriate IP addressing components',
          '1.5 Compare and contrast the characteristics of network topologies, types and technologies',
          '1.6 Given a scenario, implement the appropriate wireless technologies and configurations',
          '1.7 Summarize cloud concepts and their purposes',
          '1.8 Explain the functions of network services'
        ],
        'Domain 2: Network Implementations': [
          '2.1 Given a scenario, deploy the appropriate cabling solution',
          '2.2 Given a scenario, determine the appropriate placement of networking devices on a network and install/configure them',
          '2.3 Given a scenario, configure and deploy common Ethernet switching features',
          '2.4 Given a scenario, implement the appropriate wireless standards and technologies'
        ],
        'Domain 3: Network Operations': [
          '3.1 Given a scenario, use appropriate documentation and diagrams to manage the network',
          '3.2 Compare and contrast business continuity and disaster recovery concepts',
          '3.3 Explain common scanning, monitoring and patching processes and summarize their expected outputs',
          '3.4 Given a scenario, use remote access methods',
          '3.5 Identify policies and best practices'
        ],
        'Domain 4: Network Security': [
          '4.1 Summarize the purposes of physical security devices',
          '4.2 Explain authentication and access controls',
          '4.3 Given a scenario, secure a basic wireless network'
        ],
        'Domain 5: Network Troubleshooting': [
          '5.1 Explain the network troubleshooting methodology',
          '5.2 Given a scenario, troubleshoot common cable connectivity issues and select the appropriate tools',
          '5.3 Given a scenario, use appropriate network software tools and commands',
          '5.4 Given a scenario, troubleshoot common wireless connectivity issues',
          '5.5 Given a scenario, troubleshoot general networking issues'
        ]
      },
      'Security+': {
        'Domain 1: Attacks, Threats, and Vulnerabilities': [
          '1.1 Compare and contrast different types of social engineering techniques',
          '1.2 Given a scenario, analyze potential indicators to determine the type of attack',
          '1.3 Given a scenario, analyze potential indicators associated with application attacks',
          '1.4 Given a scenario, analyze potential indicators associated with network attacks'
        ],
        'Domain 2: Architecture and Design': [
          '2.1 Explain the importance of security concepts in an enterprise environment',
          '2.2 Summarize virtualization and cloud computing concepts',
          '2.3 Summarize secure application development and deployment concepts',
          '2.4 Summarize authentication and authorization design concepts',
          '2.5 Given a scenario, implement cybersecurity resilience'
        ],
        'Domain 3: Implementation': [
          '3.1 Given a scenario, implement secure protocols',
          '3.2 Given a scenario, implement host or application security solutions',
          '3.3 Given a scenario, implement secure network designs',
          '3.4 Given a scenario, install and configure wireless security settings'
        ],
        'Domain 4: Operations and Incident Response': [
          '4.1 Given a scenario, use the appropriate tool to assess organizational security',
          '4.2 Summarize the importance of policies, processes, and procedures for incident response',
          '4.3 Given an incident, utilize appropriate data sources to support an investigation',
          '4.4 Given an incident, apply mitigation techniques or controls to secure an environment',
          '4.5 Explain the key aspects of digital forensics'
        ],
        'Domain 5: Governance, Risk, and Compliance': [
          '5.1 Compare and contrast various types of controls',
          '5.2 Explain the importance of applicable regulations, standards, or frameworks that impact organizational security posture',
          '5.3 Explain the importance of policies to organizational security',
          '5.4 Summarize risk management processes and concepts',
          '5.5 Explain privacy and sensitive data concepts'
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
                    maxHeight: openDomains[`${exam}-${domain}`] ? '1000px' : '0',
                    transition: 'max-height 0.3s ease-in-out',
                    backgroundColor: isDarkMode ? '#262626' : '#f8f8f8',
                  }}>
                    {subDomains.map((subDomain, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px 36px',
                          borderTop: index === 0 ? `1px solid ${isDarkMode ? '#404040' : '#ddd'}` : 'none',
                          color: isDarkMode ? '#b3b3b3' : '#777777',
                          fontSize: '0.9em',
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
          onClick={() => setQuestions([{
            type: 'about',
            content: {
              title: 'About TheCompTIABible',
              description: `
                Welcome to TheCompTIABible - Your best free resource for the CompTIA Trifecta.

                This is a personal project, it is a free study tool designed to simply provide 
                practice questions to prepare for CompTIA certifications including A+, Network+, 
                and Security+.

                What makes it unique? I don't want anything from you. You won't see any subscription fees, 
                ads, or any form of monetization. It's purely for everyone to use, as this material should be free.

                Now if my AWS and OpenAI API charges go through the roof, scratch that. Maybe very minimal ads, but nothing constraining the user. 

                Features:
                • Practice questions from all exam domains
                • Interactive command-line study tools
                • Network ports and protocols training
                • Dark/Light mode for comfortable studying

                Coming Soon: 
                • Sign in/Daily Streaks
                • Community chat 

                LinkedIn: <a href="https://www.linkedin.com/in/connor-boetig-a23678290/" style="color: #007bff; text-decoration: underline; cursor: pointer;">Connor Boetig</a>
                Email: connorboetig20@gmail.com
                
                This project was made in an effort to learn AWS, where I used DynamoDB, Lambda functions, API Gateway, CloudFront, Route 53, and S3 (The list goes on of random AWS services). Aside from that, React and OpenAI's GPT-3.5 API were definitely interesting to use for the first time.
                This is my first project implementing this many services, and I am far from even an entry level developer. 
                If you have any feedback, please reach out.
              `
            }
          }])}
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
        <aside style={{
          width: window.innerWidth <= 768 ? '100%' : '250px',
          height: window.innerWidth <= 768 ? 'auto' : '100%',
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa',
          borderRight: window.innerWidth <= 768 ? 'none' : `1px solid ${isDarkMode ? '#404040' : '#ddd'}`,
          overflow: window.innerWidth <= 768 ? 'visible' : 'auto',
          padding: isMobile ? '0.5rem' : '1rem',
          position: window.innerWidth <= 768 ? 'relative' : 'static',
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
              onClick={generatePortsQuestion}
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
              onClick={generateCommandQuestion}
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
              onClick={generateNetCommandQuestion}
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
                      <QuestionDisplay questions={questions} />
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
          position: 'fixed',
          right: 0,
          top: '64px',
          bottom: 0,
          transition: 'width 0.3s ease',
          display: window.innerWidth <= 768 ? 'none' : 'block',
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
              Resources (coming soon)
            </h2>
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px', // Add some padding for the scrollbar
              marginRight: '-8px', // Offset the padding to maintain alignment
            }}>
              <ResourceAccordion isDarkMode={isDarkMode} />
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
