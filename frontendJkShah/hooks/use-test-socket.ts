"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/api/auth";

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

  // Store callbacks in a ref so socket event handlers always call the latest version
  // without needing to recreate the socket when the parent component re-renders
  const callbacksRef = useRef(options);
  useEffect(() => {
    callbacksRef.current = options;
  });

  useEffect(() => {
    if (!token) return;

    let socket: Socket;

    const connectSocket = async () => {
      const { io } = await import("socket.io-client");
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      // MED-02: the handshake uses a short-lived (5 min) ticket fetched via the
      // same-origin proxy — the HttpOnly access cookie never reaches JavaScript.
      let ticket: string;
      try {
        ticket = (await authApi.getSocketTicket()).data.ticket;
      } catch {
        return; // signed out or gateway unreachable — stay disconnected
      }

      socket = io(socketUrl, {
        path: "/socket.io",
        auth: { token: ticket },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // MED-05: reconnection attempts after a network drop may outlive the
      // ticket's TTL — fetch a fresh one before each retry.
      const refreshTicket = async () => {
        try {
          socket.auth = { token: (await authApi.getSocketTicket()).data.ticket };
        } catch {
          /* keep the previous ticket for the next attempt */
        }
      };
      socket.io.on("reconnect_attempt", refreshTicket);

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        setIsConnected(false);
        if (/token|auth/i.test(err.message)) refreshTicket();
      });

      socket.on("test_joined", (data: TestJoinedData) => {
        callbacksRef.current.onTestJoined?.(data);
      });

      socket.on("answer_recorded", (data: AnswerRecordedData) => {
        callbacksRef.current.onAnswerRecorded?.(data);
      });

      socket.on("time_update", (data: TimeUpdateData) => {
        callbacksRef.current.onTimeUpdate?.(data);
      });

      socket.on("test_submitted", (data: TestSubmittedData) => {
        callbacksRef.current.onTestSubmitted?.(data);
      });

      socket.on("error", (data: ErrorData) => {
        callbacksRef.current.onError?.(data);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
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