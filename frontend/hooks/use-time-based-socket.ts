"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/auth-context";
import { Question } from "@/lib/api/types";

export interface TbTestJoinedData {
  testId: string;
  timeRemaining: number;
  status: string;
}

export interface TbNextQuestionData {
  testId: string;
  question: Question;
}

export interface TbAllCorrectData {
  testId: string;
}

export interface TbTimeUpdateData {
  timeRemaining: number;
}

export interface TbTestSubmittedData {
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

export interface TbErrorData {
  message: string;
}

export interface UseTimeBasedSocketOptions {
  onTestJoined?: (data: TbTestJoinedData) => void;
  onNextQuestion?: (data: TbNextQuestionData) => void;
  onAllCorrect?: (data: TbAllCorrectData) => void;
  onTimeUpdate?: (data: TbTimeUpdateData) => void;
  onTestSubmitted?: (data: TbTestSubmittedData) => void;
  onError?: (data: TbErrorData) => void;
}

export function useTimeBasedSocket(options: UseTimeBasedSocketOptions = {}) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  // Buffer a joinTest call made before the socket finishes connecting
  const pendingJoinRef = useRef<string | null>(null);

  const {
    onTestJoined,
    onNextQuestion,
    onAllCorrect,
    onTimeUpdate,
    onTestSubmitted,
    onError,
  } = options;

  useEffect(() => {
    if (!token) return;

    let socket: Socket;

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
        // Flush any join that was requested before the socket was ready
        if (pendingJoinRef.current) {
          socket.emit("tb:join", { testId: pendingJoinRef.current });
          pendingJoinRef.current = null;
        }
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });

      socket.on("tb:test_joined", (data: TbTestJoinedData) => {
        onTestJoined?.(data);
      });

      socket.on("tb:next_question", (data: TbNextQuestionData) => {
        onNextQuestion?.(data);
      });

      socket.on("tb:all_correct", (data: TbAllCorrectData) => {
        onAllCorrect?.(data);
      });

      socket.on("tb:time_update", (data: TbTimeUpdateData) => {
        onTimeUpdate?.(data);
      });

      socket.on("tb:test_submitted", (data: TbTestSubmittedData) => {
        onTestSubmitted?.(data);
      });

      socket.on("tb:error", (data: TbErrorData) => {
        onError?.(data);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  const joinTest = useCallback((testId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("tb:join", { testId });
    } else {
      // Socket not yet connected — buffer the join, will be flushed on connect
      pendingJoinRef.current = testId;
    }
  }, []);

  const sendAnswer = useCallback(
    (testId: string, questionId: string, answer: string, timeTaken: number) => {
      socketRef.current?.emit("tb:answer", {
        testId,
        questionId,
        answer,
        timeTaken,
      });
    },
    []
  );

  const sendSkip = useCallback(
    (testId: string, questionId: string, timeTaken: number) => {
      socketRef.current?.emit("tb:skip", {
        testId,
        questionId,
        timeTaken,
      });
    },
    []
  );

  const submitTest = useCallback((testId: string) => {
    socketRef.current?.emit("tb:submit", { testId });
  }, []);

  const startHeartbeat = useCallback((testId: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    
    // Send initial heartbeat
    socketRef.current?.emit("tb:heartbeat", { testId });
    
    // Set up interval
    heartbeatRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("tb:heartbeat", { testId });
      }
    }, 5000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopHeartbeat;
  }, [stopHeartbeat]);

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
