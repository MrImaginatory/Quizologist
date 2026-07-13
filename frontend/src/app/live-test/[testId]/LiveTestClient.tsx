"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import { capitalize } from "@/utils/helpers";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { testService } from "@/lib/testService";
import styles from "./LiveTestClient.module.css";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

interface LiveTestClientProps {
  testId: string;
}

export default function LiveTestClient({ testId }: LiveTestClientProps) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "reconnecting" | "error">("connecting");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const timeTakenRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Scroll active item into view on mobile
    if (gridRef.current && window.innerWidth <= 768) {
      const activeBtn = gridRef.current.querySelector(`.${styles.gridBtnActive}`) as HTMLButtonElement;
      if (activeBtn) {
        const containerWidth = gridRef.current.clientWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.clientWidth;
        gridRef.current.scrollTo({
          left: btnLeft - containerWidth / 2 + btnWidth / 2 - 16, // -16 for padding
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Initialize test data from localStorage
  useEffect(() => {
    // URL may decode the testId differently, try both raw and decoded
    const key = `test_session_${testId}`;
    const decodedKey = `test_session_${decodeURIComponent(testId)}`;
    const stored = localStorage.getItem(key) || localStorage.getItem(decodedKey);

    if (!stored) {
      alert("Test session not found. Please start the test again from the dashboard.");
      router.push("/tests");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setTestData(parsed);

      // Restore progress from localStorage
      const progressKey = `test_progress_${testId}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.answers) setAnswers(progress.answers);
        if (progress.skipped) setSkipped(new Set(progress.skipped));
        if (typeof progress.currentIndex === 'number') setCurrentIndex(progress.currentIndex);
        if (typeof progress.timeRemaining === 'number') {
          setTimeRemaining(progress.timeRemaining);
        } else {
          setTimeRemaining(parsed.duration_minutes ? parsed.duration_minutes * 60 : 1800);
        }
      } else {
        setTimeRemaining(parsed.duration_minutes ? parsed.duration_minutes * 60 : 1800);
      }
      setLoading(false);

      // Connect socket using UUID (parsed.id), not the human-readable test_id
      const socketTestId = parsed.id;
      const newSocket = connectSocket();
      setSocket(newSocket);
      newSocket.on("connect", () => {
        setConnectionStatus("connected");
        newSocket.emit("join_test", { testId: socketTestId });
      });
      newSocket.on("disconnect", () => setConnectionStatus("reconnecting"));
      newSocket.on("reconnect", () => {
        setConnectionStatus("connected");
        newSocket.emit("join_test", { testId: socketTestId });
      });
      newSocket.on("test_joined", (data) => {
        setTimeRemaining(data.timeRemaining);
      });
      newSocket.on("time_update", (data) => setTimeRemaining(data.timeRemaining));
      newSocket.on("test_submitted", (data) => {
        setSubmitted(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        const message = data.reason === "timeout"
          ? "Time's up! Your test has been automatically submitted."
          : "Test submitted successfully!";
        setToastMsg(message);
        localStorage.removeItem(`test_session_${testId}`);
        localStorage.removeItem(`test_progress_${testId}`);
        setTimeout(() => {
          router.push(`/tests/results/${testId}`);
        }, 2000);
      });
      newSocket.on("error", (err) => {
        console.error("Socket error:", err);
        setConnectionStatus("error");
      });
      return () => disconnectSocket();
    } catch (err) {
      console.error("Failed to initialize test:", err);
      alert("Failed to load test session. Please try again.");
      router.push("/tests");
    }
  }, [testId, router]);

  // Prevent Back Navigation, Refresh (F5), and show warning on close
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F5 or Ctrl+R
      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        alert("Refreshing the page is not allowed during a live test.");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your test progress might be affected.";
      return e.returnValue;
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Local Timer
  // Persist progress to localStorage on every change
  useEffect(() => {
    if (!loading && testData) {
      const progressKey = `test_progress_${testId}`;
      localStorage.setItem(progressKey, JSON.stringify({
        answers,
        skipped: Array.from(skipped),
        currentIndex,
        timeRemaining
      }));
    }
  }, [answers, skipped, currentIndex, timeRemaining, loading, testData, testId]);

  useEffect(() => {
    if (!loading && !submitted && timeRemaining !== null && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return 0;
        });
        timeTakenRef.current += 1;
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading, submitted]);

  // Heartbeat every 30s
  useEffect(() => {
    if (!loading && !submitted && socket) {
      heartbeatRef.current = setInterval(() => {
        socket.emit("heartbeat", { testId: testData.id, questionIndex: currentIndex });
      }, 30000);
    }
    
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [loading, submitted, socket, testId, currentIndex]);

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
          testId: testData.id,
          questionIndex: currentIndex,
          questionId: currentQ.questionId,
          answer,
          timeTaken: timeTakenRef.current
        });
      }
      if (skipped.has(currentIndex)) {
        const newSkipped = new Set(skipped);
        newSkipped.delete(currentIndex);
        setSkipped(newSkipped);
      }
    }
    
    timeTakenRef.current = 0;
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
        testId: testData.id,
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

  const handleClearResponse = () => {
    if (!testData || !answers[currentIndex]) return;
    
    const currentQ = testData.questions[currentIndex];
    const newAnswers = { ...answers };
    delete newAnswers[currentIndex];
    setAnswers(newAnswers);

    if (socket) {
      socket.emit("answer", {
        testId: testData.id,
        questionIndex: currentIndex,
        questionId: currentQ.questionId,
        answer: "",
        timeTaken: timeTakenRef.current
      });
    }
  };

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const handleCancelTest = async () => {
    if (window.confirm("Are you sure you want to cancel and abandon this test? This action cannot be undone.")) {
      try {
        if (socket) {
          socket.emit("submit_test", { testId: testData.id }); // optional fallback or just abandon directly
        }
        await testService.abandonTest(testData.id);
        localStorage.removeItem(`test_session_${testId}`);
        localStorage.removeItem(`test_session_${decodeURIComponent(testId)}`);
        localStorage.removeItem(`test_progress_${testId}`);
        router.push("/tests");
      } catch (error) {
        console.error("Failed to abandon test", error);
        alert("Failed to cancel the test. Please try again.");
      }
    }
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    saveCurrentAnswer();
    setSubmitted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    if (socket) {
      socket.emit("submit_test", { testId: testData.id });
    } else {
      localStorage.removeItem(`test_session_${testId}`);
      localStorage.removeItem(`test_session_${decodeURIComponent(testId)}`);
      localStorage.removeItem(`test_progress_${testId}`);
      alert("Test submitted successfully!");
      router.push("/tests");
    }
  };

  const cancelSubmit = () => {
    setShowSubmitConfirm(false);
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
        {connectionStatus === "reconnecting" && (
          <p className={styles.reconnectMsg}>Reconnecting...</p>
        )}
      </div>
    );
  }

  const currentQ = testData.questions[currentIndex];
  const isLastQuestion = currentIndex === testData.questions.length - 1;
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 300;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Live Test</h1>
          
          {timeRemaining !== null && (
            <div className={`${styles.timer} ${isTimeCritical ? styles.timerWarning : ''}`}>
              <div className={`${styles.statusDot} ${styles[`status${connectionStatus}`]}`} title={connectionStatus === "connected" ? "Connected" : connectionStatus === "reconnecting" ? "Reconnecting..." : "Connecting..."}></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <button 
          className={styles.cancelTopBtn} 
          onClick={handleCancelTest}
          disabled={Object.keys(answers).length === 0}
        >
          Cancel
        </button>
      </header>

      <div className={styles.content}>
        <aside className={`${styles.sidebar} ${isGridExpanded ? styles.sidebarExpanded : ''}`}>
          <div 
            className={styles.sidebarHeader}
            onClick={() => setIsGridExpanded(!isGridExpanded)}
          >
            <h2 className={styles.sidebarTitle}>
              Questions <span>{Object.keys(answers).length} / {testData.questions.length}</span>
            </h2>
            <button className={styles.collapseBtn} type="button" aria-label="Toggle Question Grid">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points={isGridExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
          </div>
          
          <div className={`${styles.gridContainer} ${isGridExpanded ? styles.gridExpanded : ''}`}>
            <div className={styles.grid} ref={gridRef}>
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

            <button 
              className={styles.abandonBtn} 
              onClick={handleCancelTest}
              disabled={Object.keys(answers).length === 0}
            >
              Abandon Test
            </button>
          </div>
        </aside>

        <main className={styles.mainArea}>
          <div className={styles.questionCard}>
            <div className={styles.questionMeta}>
              <span className={styles.questionNumber}>Question {currentIndex + 1} of {testData.questions.length}</span>
              <div className={styles.questionTags}>
                <span className={styles.tag} title={currentQ.subjectName}>{capitalize(currentQ.subjectName)}</span>
                <span className={styles.tag} title={currentQ.topicName || currentQ.difficulty}>{capitalize(currentQ.topicName || currentQ.difficulty)}</span>
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
              
              <div className={styles.secondaryActions}>
                <button 
                  className={`${styles.navBtn} ${styles.skipBtn}`}
                  onClick={handleSkip}
                  disabled={isLastQuestion}
                >
                  Skip
                </button>

                <button 
                  className={`${styles.navBtn} ${styles.clearBtn}`}
                  onClick={handleClearResponse}
                  disabled={!answers[currentIndex]}
                >
                  Clear
                </button>
              </div>
              
              <button 
                className={`${styles.navBtn} ${styles.primaryBtn}`}
                onClick={isLastQuestion ? handleSubmitClick : handleNext}
              >
                {isLastQuestion ? 'Submit Test' : 'Next'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {showSubmitConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Submit Test?</h3>
            <p>Are you sure you want to submit the test? You cannot change your answers after submission.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={cancelSubmit}>Cancel</button>
              <button className={styles.confirmBtn} onClick={confirmSubmit}>Confirm Submit</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className={styles.toastContainer}>
          <div className={styles.toast}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.toastIcon}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
