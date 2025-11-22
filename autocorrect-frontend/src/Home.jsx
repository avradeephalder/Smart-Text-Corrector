import { useState, useRef, useEffect } from "react"

export default function Home() {
  // State Management
  const [inputText, setInputText] = useState("")
  const [correctedText, setCorrectedText] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [mode, setMode] = useState("correct")
  const [style, setStyle] = useState("fluent")
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set())
  const toastTimeoutRef = useRef(null)
  const resultsSectionRef = useRef(null)

  const MAX_CHARS = 50000
  const LANGUAGES = { en: "English", es: "Spanish", fr: "French", de: "German" }
  const API_BASE_URL = "http://localhost:3000/api"

  // Scroll to results when they appear
  useEffect(() => {
    if (correctedText && resultsSectionRef.current) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 200)
    }
  }, [correctedText])

  // API Functions
  const callCorrectAPI = async (text, language) => {
    try {
      const response = await fetch(`${API_BASE_URL}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      return {
        corrected: data.corrected || text,
        suggestions: (data.suggestions || []).map((sugg, idx) => ({
          id: idx,
          original: sugg.message ? text.substring(sugg.offset, sugg.offset + sugg.length) : "",
          replacement: sugg.replacements?.[0] || "",
          confidence: Math.round(sugg.confidence * 100) || 85,
          message: sugg.shortMessage || sugg.message || "Grammar issue",
        })),
      }
    } catch (err) {
      console.error("Correction API error:", err)
      throw new Error("Failed to correct text. Make sure API is running at http://localhost:3000")
    }
  }

  const callRewriteAPI = async (text, style) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      return { rewritten: data.rewritten || text }
    } catch (err) {
      console.error("Rewrite API error:", err)
      throw new Error("Failed to rewrite text. Make sure Ollama is running and API is at http://localhost:3000")
    }
  }

  // Handlers
  const handleInputChange = (e) => {
    const text = e.target.value.slice(0, MAX_CHARS)
    setInputText(text)
    setCharCount(text.length)
  }

  const handleClear = () => {
    setInputText("")
    setCorrectedText("")
    setSuggestions([])
    setCharCount(0)
    setSelectedSuggestions(new Set())
    setError("")
    setSuccess("")
  }

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      showError("Please enter some text to correct")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setSuggestions([])
    setCorrectedText("")

    try {
      if (mode === "correct") {
        const result = await callCorrectAPI(inputText, language)
        setCorrectedText(result.corrected)
        setSuggestions(result.suggestions)
        showSuccess("Text corrected successfully!")
      } else {
        const result = await callRewriteAPI(inputText, style)
        setCorrectedText(result.rewritten)
        setSuggestions([])
        showSuccess("Text rewritten successfully!")
      }
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuggestion = (id) => {
    const newSelected = new Set(selectedSuggestions)
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id)
    setSelectedSuggestions(newSelected)
  }

  const handleCopy = () => {
    if (correctedText) {
      navigator.clipboard.writeText(correctedText)
      showSuccess("Copied to clipboard!")
    }
  }

  const showError = (message) => {
    setError(message)
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setError(""), 4000)
  }

  const showSuccess = (message) => {
    setSuccess(message)
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setSuccess(""), 4000)
  }

  // Inline Styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #0d2e1f 50%, #0f172a 100%)",
      padding: "1rem",
      paddingBottom: "2rem",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#e2e8f0",
      position: "relative",
    },
    bgGlow: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
      pointerEvents: "none",
      animation: "pulse 4s ease-in-out infinite",
    },
    main: {
      maxWidth: "900px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    header: {
      textAlign: "center",
      marginBottom: "1rem",
      animation: "fadeIn 0.6s ease-out",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "0.25rem",
      background: "linear-gradient(135deg, #34d399, #6ee7b7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: "0.9rem",
      color: "#94a3b8",
      fontWeight: "400",
    },
    controlsSection: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
      marginBottom: "1rem",
    },
    controlGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#cbd5e1",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    select: {
      background: "rgba(15, 23, 42, 0.6)",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "8px",
      padding: "0.75rem 2.5rem 0.75rem 0.75rem",
      color: "#e2e8f0",
      cursor: "pointer",
      fontSize: "0.95rem",
      outline: "none",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "12px",
    },
    toggleContainer: {
      display: "flex",
      gap: "0.5rem",
      borderRadius: "8px",
      background: "rgba(15, 23, 42, 0.6)",
      padding: "0.25rem",
      border: "1px solid rgba(148, 163, 184, 0.2)",
    },
    toggleButton: (isActive) => ({
      flex: 1,
      padding: "0.75rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "600",
      background: isActive ? "linear-gradient(135deg, #10b981, #34d399)" : "transparent",
      color: isActive ? "#fff" : "#94a3b8",
      boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
    }),
    textareaSection: {
      marginBottom: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "1.25rem",
      borderRadius: "12px",
      background: "rgba(15, 23, 42, 0.5)",
      border: "2px solid rgba(148, 163, 184, 0.2)",
      color: "#e2e8f0",
      fontSize: "1rem",
      lineHeight: "1.6",
      resize: "vertical",
      minHeight: "120px",
      maxHeight: "200px",
      fontFamily: "inherit",
      outline: "none",
    },
    charCounter: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginTop: "0.5rem",
      textAlign: "right",
    },
    charCounterAlert: {
      color: "#ef4444",
      fontWeight: "600",
    },
    buttonsRow: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1rem",
      flexWrap: "wrap",
    },
    button: (variant = "primary", disabled = false) => ({
      padding: "0.875rem 1.75rem",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      fontSize: "0.95rem",
      cursor: disabled ? "not-allowed" : "pointer",
      outline: "none",
      opacity: disabled ? 0.5 : 1,
      ...(variant === "primary" && {
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
      }),
      ...(variant === "secondary" && {
        background: "rgba(15, 23, 42, 0.6)",
        color: "#cbd5e1",
        border: "1px solid rgba(148, 163, 184, 0.3)",
      }),
    }),
    resultsSection: {
      marginBottom: "1rem",
    },
    resultCard: {
      background: "rgba(15, 23, 42, 0.95)",
      border: "3px solid #10b981",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "2rem",
      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
    },
    resultLabel: {
      fontSize: "1rem",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "1rem",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    resultText: {
      fontSize: "1.1rem",
      lineHeight: "1.8",
      color: "#e2e8f0",
      padding: "1.5rem",
      background: "rgba(16, 185, 129, 0.05)",
      borderRadius: "8px",
      border: "1px solid rgba(16, 185, 129, 0.2)",
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
      minHeight: "80px",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderTop: "3px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginRight: "0.5rem",
    },
    toast: (type) => ({
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      padding: "1rem 1.5rem",
      borderRadius: "8px",
      background: type === "error" ? "rgba(239, 68, 68, 0.9)" : "rgba(16, 185, 129, 0.9)",
      color: "#fff",
      fontWeight: "600",
      fontSize: "0.95rem",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      zIndex: 1000,
      border: type === "error" ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(16, 185, 129, 0.5)",
    }),
  }

  // Render
  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        select:hover { border-color: rgba(148, 163, 184, 0.4); }
        select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        textarea:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        button:hover:not(:disabled) { transform: scale(1.02); }
        button:active:not(:disabled) { transform: scale(0.98); }
        @media (max-width: 768px) {
          select, textarea, button { font-size: 16px; }
        }
      `}</style>

      <div style={styles.bgGlow}></div>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>AutoCorrect AI</h1>
          <p style={styles.subtitle}>Perfect your text with intelligent corrections and rewrites</p>
        </div>

        <div style={styles.controlsSection}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Mode</label>
            <div style={styles.toggleContainer}>
              <button style={styles.toggleButton(mode === "correct")} onClick={() => setMode("correct")}>
                Correct
              </button>
              <button style={styles.toggleButton(mode === "rewrite")} onClick={() => setMode("rewrite")}>
                Rewrite
              </button>
            </div>
          </div>

          {mode === "rewrite" && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} style={styles.select}>
                <option value="fluent">Fluent</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          )}
        </div>

        <div style={styles.textareaSection}>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter your text here... (max 50,000 characters)"
            style={styles.textarea}
            maxLength={MAX_CHARS}
          />
          <div style={styles.charCounter}>
            <span style={charCount === MAX_CHARS ? styles.charCounterAlert : {}}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>

        <div style={styles.buttonsRow}>
          <button
            style={styles.button("primary", !inputText.trim() || loading)}
            onClick={handleSubmit}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={styles.loadingSpinner}></span> Processing...
              </span>
            ) : mode === "correct" ? "Correct Text" : "Rewrite Text"}
          </button>
          {correctedText && (
            <button style={styles.button("secondary")} onClick={handleCopy}>
              Copy
            </button>
          )}
          <button style={styles.button("secondary")} onClick={handleClear}>
            Clear
          </button>
        </div>

        {correctedText && (
          <div ref={resultsSectionRef} style={styles.resultsSection} data-section="corrected">
            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>
                {mode === "correct" ? "CORRECTED TEXT" : "REWRITTEN TEXT"}
              </div>
              <div style={styles.resultText}>{correctedText}</div>
            </div>
          </div>
        )}
      </main>

      {error && <div style={styles.toast("error")}>{error}</div>}
      {success && <div style={styles.toast("success")}>{success}</div>}
    </div>
  )
}
