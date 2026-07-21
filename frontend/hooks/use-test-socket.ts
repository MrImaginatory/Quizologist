"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/auth-context";

interface TestJoinedData {
  testId: string;
  totalQuestions: number;
  currentIndex: number;
  timeRemaining: number;
  endsAt: string;
}

interface AnswerRecordedData {
  testId: string;
  questionIndex: number;
  success: boolean;
  timeRemaining: number;
}

interface TimeUpdateData {
  timeRemaining: number;
}

interface TestSubmittedData {
  testId: string;
  result: {
    score: number;
    correct: number;
    incorrect: number;
    skipped: number;
    totalQuestions: number;
  };
  reason?: string;
}

interface ErrorData {
  message: string;
}

interface UseTestSocketOptions {
  onTestJoined?: (data: TestJoinedData) => void;
  onAnswerRecorded?: (data: AnswerRecordedData) => void;
  onTimeUpdate?: (data: TimeUpdateData) => void;
  onTestSubmitted?: (data: TestSubmittedData) => void;
  onError?: (data: ErrorData) => void;
}

export function useTestSocket(options: UseTestSocketOptions = {}) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onTestJoined,
    onAnswerRecorded,
    onTimeUpdate,
    onTestSubmitted,
    onError,
  } = options;

  useEffect(() => {
    if (!token) return;

    let socket: Socket;
    let heartbeat: NodeJS.Timeout | null = null;

    const connectSocket = async () => {
      const { io } = await import("socket.io-client");
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      socket = io(socketUrl, {
        path: "/socket.io",
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });

      socket.on("test_joined", (data: TestJoinedData) => {
        onTestJoined?.(data);
      });

      socket.on("answer_recorded", (data: AnswerRecordedData) => {
        onAnswerRecorded?.(data);
      });

      socket.on("time_update", (data: TimeUpdateData) => {
        onTimeUpdate?.(data);
      });

      socket.on("test_submitted", (data: TestSubmittedData) => {
        onTestSubmitted?.(data);
      });

      socket.on("error", (data: ErrorData) => {
        onError?.(data);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      socket?.disconnect();
    };
  }, [token]);

  const joinTest = useCallback((testId: string) => {
    socketRef.current?.emit("join_test", { testId });
  }, []);

  const sendAnswer = useCallback(
    (testId: string, questionIndex: number, questionId: string, answer: string, timeTaken: number) => {
      socketRef.current?.emit("answer", {
        testId,
        questionIndex,
        questionId,
        answer,
        timeTaken,
      });
    },
    []
  );

  const sendSkip = useCallback(
    (testId: string, questionIndex: number, questionId: string, timeTaken: number) => {
      socketRef.current?.emit("skip", {
        testId,
        questionIndex,
        questionId,
        timeTaken,
      });
    },
    []
  );

  const submitTest = useCallback((testId: string) => {
    socketRef.current?.emit("submit_test", { testId });
  }, []);

  const startHeartbeat = useCallback(
    (testId: string, questionIndex: number) => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }

      heartbeatRef.current = setInterval(() => {
        socketRef.current?.emit("heartbeat", { testId, questionIndex });
      }, 30000);
    },
    []
  );

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  return {
    isConnected,
    joinTest,
    sendAnswer,
    sendSkip,
    submitTest,
    startHeartbeat,
    stopHeartbeat,
  };
}