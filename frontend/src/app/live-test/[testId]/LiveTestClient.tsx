"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/auth";
import styles from "./LiveTestClient.module.css";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

interface LiveTestClientProps {
  testId: string;
}

export default function LiveTestClient({ testId }: LiveTestClientProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const timeTakenRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Load test data from localStorage and initialize socket
  useEffect(() => {
    // MOCK DATA FOR UI TESTING
    const dummyTestData = {
      duration_minutes: 15,
      questions: [
        { questionId: 'q1', question: 'What is 2+2?', choices: ['1', '2', '3', '4'], subjectName: 'Math', difficulty: 'easy' },
        { questionId: 'q2', question: 'Capital of France?', choices: ['Paris', 'London', 'Berlin', 'Rome'], subjectName: 'Geography', difficulty: 'medium' },
        { questionId: 'q3', question: 'Which planet is known as the Red Planet?', choices: ['Earth', 'Mars', 'Jupiter', 'Saturn'], subjectName: 'Science', difficulty: 'easy' },
        { questionId: 'q4', question: 'Who wrote Hamlet?', choices: ['Shakespeare', 'Dickens', 'Tolkien', 'Austen'], subjectName: 'Literature', difficulty: 'hard' },
        { questionId: 'q5', question: 'What is the largest mammal?', choices: ['Elephant', 'Blue Whale', 'Giraffe', 'Shark'], subjectName: 'Science', difficulty: 'medium' },
      ]
    };
    
    setTestData(dummyTestData);
    setTimeRemaining(dummyTestData.duration_minutes * 60);
    setLoading(false);
    
    /* 
    // REAL BACKEND LOGIC COMMENTED OUT FOR UI TESTING
    const stored = localStorage.getItem(`test_session_${testId}`);
    if (!stored) {
      alert("Test session not found. Please start the test again from the dashboard.");
      router.push("/tests");
      return;
    }
    
    try {
      const parsed = JSON.parse(stored);
      setTestData(parsed);
      
      // Initialize Socket connection
      const token = getToken();
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3005", {
        auth: { token }
      });
      
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        newSocket.emit("join_test", { testId });
      });
      
      newSocket.on("test_joined", (data) => {
        setTimeRemaining(data.timeRemaining);
        setLoading(false);
      });
      
      newSocket.on("time_update", (data) => {
        setTimeRemaining(data.timeRemaining);
      });
      
      newSocket.on("test_submitted", (data) => {
        if (data.reason === "timeout") {
          alert("Time's up! Your test has been automatically submitted.");
        } else {
          alert("Test submitted successfully!");
        }
        localStorage.removeItem(`test_session_${testId}`);
        router.push("/results");
      });
      
      newSocket.on("error", (err) => {
        console.error("Socket error:", err);
      });

      return () => {
        newSocket.disconnect();
      };
    } catch (err) {
      console.error("Failed to parse test session:", err);
      router.push("/tests");
    }
    */
  }, [testId, router]);

  // Security: Prevent Back Navigation
  useEffect(() => {
    // Push dummy state to intercept back button
    window.history.pushState(null, "", window.location.href);
    
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      alert("You cannot go back during an active test. Please submit the test if you wish to exit.");
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Security: Prevent Refresh (F5)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your test progress might be affected.";
      return e.returnValue;
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Local Timer for UI updates and time_taken calculation
  useEffect(() => {
    if (!loading && timeRemaining !== null) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
        timeTakenRef.current += 1;
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading]); // Only re-run when loading finishes, rely on state updater function

  // Heartbeat every 30s
  useEffect(() => {
    if (!loading && socket) {
      heartbeatRef.current = setInterval(() => {
        socket.emit("heartbeat", { testId, questionIndex: currentIndex });
      }, 30000);
    }
    
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [loading, socket, testId, currentIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentIndex]: option });
  };

  const saveCurrentAnswer = () => {
    if (!testData) return;
    
    const currentQ = testData.questions[currentIndex];
    const answer = answers[currentIndex];
    
    if (answer) {
      if (socket) {
        socket.emit("answer", {
          testId,
          questionIndex: currentIndex,
          questionId: currentQ.questionId,
          answer,
          timeTaken: timeTakenRef.current
        });
      }
      // Remove from skipped if it was skipped before
      if (skipped.has(currentIndex)) {
        const newSkipped = new Set(skipped);
        newSkipped.delete(currentIndex);
        setSkipped(newSkipped);
      }
    }
    
    timeTakenRef.current = 0; // Reset local timer for the next question
  };

  const handleNext = () => {
    saveCurrentAnswer();
    if (currentIndex < testData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    saveCurrentAnswer();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!testData) return;
    
    const currentQ = testData.questions[currentIndex];
    
    if (socket) {
      socket.emit("skip", {
        testId,
        questionIndex: currentIndex,
        questionId: currentQ.questionId,
        timeTaken: timeTakenRef.current
      });
    }
    
    const newSkipped = new Set(skipped);
    newSkipped.add(currentIndex);
    setSkipped(newSkipped);
    
    timeTakenRef.current = 0;
    
    if (currentIndex < testData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      saveCurrentAnswer();
      socket?.emit("submit_test", { testId });
    }
  };

  const jumpToQuestion = (index: number) => {
    saveCurrentAnswer();
    setCurrentIndex(index);
  };

  if (loading || !testData) {
    return (
      <div className={styles.loadingScreen}>
        <LoadingSpinner />
        <p>Connecting to secure test environment...</p>
      </div>
    );
  }

  const currentQ = testData.questions[currentIndex];
  const isLastQuestion = currentIndex === testData.questions.length - 1;
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 300; // < 5 mins

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Live Test</h1>
          {timeRemaining !== null && (
            <div className={`${styles.timer} ${isTimeCritical ? styles.timerWarning : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit Test
        </button>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            Questions
            <span>{Object.keys(answers).length} / {testData.questions.length}</span>
          </h2>
          
          <div className={styles.grid}>
            {testData.questions.map((_: any, idx: number) => {
              let btnClass = styles.gridBtn;
              if (idx === currentIndex) btnClass += ` ${styles.gridBtnActive}`;
              else if (answers[idx]) btnClass += ` ${styles.gridBtnAttempted}`;
              else if (skipped.has(idx)) btnClass += ` ${styles.gridBtnSkipped}`;

              return (
                <button 
                  key={idx} 
                  className={btnClass}
                  onClick={() => jumpToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#10B981' }}></div>
              <span>Attempted</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#F59E0B' }}></div>
              <span>Skipped</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}></div>
              <span>Not Visited</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: 'transparent', border: '2px solid var(--color-primary)' }}></div>
              <span>Current</span>
            </div>
          </div>
        </aside>

        <main className={styles.mainArea}>
          <div className={styles.questionCard}>
            <div className={styles.questionMeta}>
              <span className={styles.questionNumber}>Question {currentIndex + 1} of {testData.questions.length}</span>
              <div className={styles.questionTags}>
                <span className={styles.tag}>{currentQ.subjectName}</span>
                <span className={styles.tag}>{currentQ.difficulty}</span>
              </div>
            </div>
            
            <h3 className={styles.questionText}>{currentQ.question}</h3>
            
            <div className={styles.optionsList}>
              {currentQ.choices.map((choice: string, idx: number) => (
                <label 
                  key={idx} 
                  className={`${styles.optionLabel} ${answers[currentIndex] === choice ? styles.optionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${currentIndex}`}
                    value={choice}
                    checked={answers[currentIndex] === choice}
                    onChange={() => handleOptionSelect(choice)}
                    className={styles.radio}
                  />
                  <span className={styles.optionText}>{choice}</span>
                </label>
              ))}
            </div>

            <div className={styles.actionPanel}>
              <button 
                className={styles.navBtn} 
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              
              <button 
                className={`${styles.navBtn} ${styles.skipBtn}`}
                onClick={handleSkip}
                disabled={isLastQuestion}
              >
                Skip
              </button>
              
              <button 
                className={`${styles.navBtn} ${styles.primaryBtn}`}
                onClick={isLastQuestion ? handleSubmit : handleNext}
              >
                {isLastQuestion ? 'Submit Test' : 'Next'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
