"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    api
      .get("/api/health")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("Backend not reachable"));
  }, []);

  return <h1>{message}</h1>;
}