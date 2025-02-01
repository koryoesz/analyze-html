import { useState } from 'react';
import axios from 'axios';
import './App.css';

// Constants
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AccessibilityChecker() {
  // State Hooks
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // File Change Handler
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/html") {
      setFile(selectedFile);
    } else {
      setError("Invalid file type. Please upload an HTML file.");
      setFile(null);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload an HTML file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/html/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError(`Failed to analyze the file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="header">Accessibility Checker</h2>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="file"
          accept=".html"
          onChange={handleFileChange}
          className="file-input"
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="error-msg">{error}</p>}

      {/* Results Section */}
      {result && (
        <div className="results">
          {/* Score and Details Cards in a Row */}
          <div className="score-details">
            {/* Score Card */}
            <div className="card">
              <h4 className="score">Score</h4>
              <p>{result.data.score}</p>
            </div>

            {/* Dynamic Cards for "Images Missing Alt", "Skipped Headings", "Inputs Without Labels" */}
            {Object.entries(result.data.details).map(([key, value]) => (
              <div key={key} className="card">
                <h4>{key.replace(/_/g, " ")}</h4>
                <p>{value}</p>
              </div>
            ))}
          </div>


          {/* Issues Section */}
          <div className="issues">
            {Object.entries(result.data.issues).map(([key, issues]) => (
              <div key={key} className="">
                <div className="card-overlay"></div>
                <h4>{key.toUpperCase()}</h4>
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Element</th>
                      <th>Issue</th>
                      <th>Suggested Fix</th>
                      <th>Line Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, index) => (
                      <tr key={index}>
                        <td>{issue.element}</td>
                        <td>{issue.issue}</td>
                        <td>{issue.suggested_fix}</td>
                        <td>{issue.line_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
