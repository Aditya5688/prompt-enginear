/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [engineeredPrompt, setEngineeredPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [targetAi, setTargetAi] = useState("Gemini");

  const handleEngineerPrompt = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setEngineeredPrompt("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are an expert prompt engineer with a deep understanding of user psychology and AI interaction. Your task is to transform a user's simple or vague request into a highly-effective, detailed, and precise prompt, specifically optimized for the ${targetAi} model.

Your process involves a deep analysis of the user's input:

1.  **Analyze Intent and Emotion:** Go beyond the literal words. First, determine the user's true *intent*. What is the core problem they are trying to solve? What is the ultimate goal they want to achieve? Analyze the emotional tone of their request. Are they looking for something creative, analytical, professional, empathetic, or humorous? What does a 'successful' output look like from their perspective?

2.  **Identify Key Components:** Deconstruct the user's request to identify explicit and implicit elements:
    *   **Task:** The primary action the AI should perform.
    *   **Context:** Any background information provided.
    *   **Persona:** The role the AI should adopt (e.g., 'expert marketer,' 'storyteller,' 'code assistant').
    *   **Format:** The desired structure of the output (e.g., JSON, list, table, markdown).
    *   **Tone:** The stylistic voice of the response (e.g., formal, witty, academic).
    *   **Constraints:** Any limitations or rules (e.g., word count, excluded topics, required elements).

3.  **Synthesize and Engineer:** Combine your analysis of intent, emotion, and key components to construct the final prompt. Your engineered prompt should:
    *   Clearly state the AI's persona and the primary goal.
    *   Provide rich context and necessary background information.
    *   Give step-by-step instructions if the task is complex.
    *   Explicitly define the desired output format, tone, and any constraints.
    *   Use clear, unambiguous language to minimize the chance of misinterpretation by the AI.
    *   Incorporate elements that anticipate the user's needs and aim to exceed their expectations based on your initial analysis.

Your final output must be **ONLY** the engineered prompt text. Do not include any of your analysis, explanations, preambles, or markdown formatting. Return only the pure, ready-to-use prompt.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userInput,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      setEngineeredPrompt(response.text);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "An unknown error occurred."
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!engineeredPrompt) return;
    navigator.clipboard.writeText(engineeredPrompt).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed!');
    });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Prompt Engineer</h1>
        <p>Transform your simple ideas into powerful, effective prompts.</p>
      </header>
      <main>
        <section className="panel" aria-labelledby="input-heading">
          <div className="target-ai-selector">
            <h3 id="target-ai-heading">Target AI</h3>
            <div role="radiogroup" aria-labelledby="target-ai-heading">
              <label>
                <input
                  type="radio"
                  name="target-ai"
                  value="Gemini"
                  checked={targetAi === "Gemini"}
                  onChange={(e) => setTargetAi(e.target.value)}
                  disabled={isLoading}
                />
                <span>Gemini</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="target-ai"
                  value="ChatGPT"
                  checked={targetAi === "ChatGPT"}
                  onChange={(e) => setTargetAi(e.target.value)}
                  disabled={isLoading}
                />
                <span>ChatGPT</span>
              </label>
            </div>
          </div>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe what you want the AI to do in simple terms... e.g., 'a story about a robot who discovers music'"
            aria-label="Your simple prompt idea"
            disabled={isLoading}
          ></textarea>
          <button
            className="btn"
            onClick={handleEngineerPrompt}
            disabled={isLoading || !userInput.trim()}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            {isLoading ? "Engineering..." : "Engineer Prompt"}
          </button>
        </section>

        {(isLoading || engineeredPrompt || error) && (
            <section className="panel" aria-labelledby="output-heading">
            <h2 id="output-heading">Engineered Prompt</h2>
            <div className="output-container">
                <div className="output-content" aria-live="polite">
                    {isLoading ? (
                        <div className="output-placeholder">Generating...</div>
                    ) : (
                        engineeredPrompt
                    )}
                </div>
                {engineeredPrompt && !isLoading && (
                <button onClick={handleCopy} className="copy-btn" aria-label="Copy engineered prompt">
                   <span className="material-symbols-outlined">{copySuccess === 'Copied!' ? 'check' : 'content_copy'}</span>
                    {copySuccess || 'Copy'}
                </button>
                )}
            </div>
            </section>
        )}

        {error && <p className="error-message" role="alert">Error: {error}</p>}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);