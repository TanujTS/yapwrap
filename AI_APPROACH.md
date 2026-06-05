# AI Approach & Hallucination Prevention

This document explains how Yapwrap leverages AI for meeting analysis while strictly adhering to accuracy, grounding, and hallucination prevention requirements.

## 1. Provider & Model Selection
We use the **Google Gemini SDK** targeting the `gemini-2.5-flash` model. 
- **Why:** `gemini-2.5-flash` is extremely fast, capable of deep context window analysis, and supports **Structured Outputs** (JSON Schema). This guarantees that the API response perfectly matches our TypeScript backend types.

## 2. Prompt Design
Our AI interaction is divided into two parts: a strict **System Instruction** and a user **Prompt**.

**System Instruction:**
```text
You are an expert meeting analyst. Your task is to extract insights from the provided meeting transcript.
CRITICAL INSTRUCTIONS:
1. GROUNDING: All AI-generated content must be grounded in the provided transcript.
2. NO HALLUCINATION: The system must not invent attendees, action items, decisions, or meeting outcomes. Do not add information not explicitly present in the transcript.
3. CITATIONS REQUIRED: Every generated insight (summary point, action item, decision, follow-up) must include at least one citation referencing the exact timestamp(s) and speaker(s) from which the insight was derived.
4. STRUCTURE: Follow the requested JSON schema.
```

**Generation Configuration:**
- `temperature: 0.1`: We drastically lower the temperature to force the LLM to prioritize deterministic, factual extractions over creative generation.

## 3. Citation Strategy
To ensure traceability, we defined a strict JSON Schema for the expected output. 

Every single generated block (`summary`, `actionItems`, `decisions`, `followUps`) consists of an array of objects. Inside those objects, a `citations` array is mathematically required by the Gemini schema:
```json
{
  "text": "The actual extracted insight",
  "citations": [
    {
      "timestamp": "00:10",
      "speaker": "John"
    }
  ]
}
```
This forces the LLM to cross-reference the input transcript timestamps before generating an action item or summary point, structurally preventing it from making up points that cannot be anchored to a specific time.

## 4. Hallucination Prevention Strategy
1. **Low Temperature:** Setting temperature to `0.1` reduces probability variance.
2. **Schema Enforcement:** By making the `citations` field required, the model is penalized during generation if it cannot produce a valid string format matching the transcript timestamps.
3. **Explicit Negative Prompting:** The system prompt explicitly forbids inventing attendees, action items, or outcomes.
4. **Format Restriction:** The input transcript is passed as a string strictly formatted as `[timestamp] speaker: text`. This predictable format makes it easy for the LLM's attention mechanism to map the required citation JSON back to the source.

## 5. Known Limitations
- **Transcription Errors:** The LLM treats the provided transcript as absolute truth. If the original transcript attributes a quote to the wrong speaker or mishears a word, the AI will confidently extract that incorrect information and cite it.
- **Implicit Context:** The strict anti-hallucination prompt means the AI might miss implicit agreements. If someone says "Let's do that" without explicitly stating what "that" is, the AI may fail to generate a concrete action item rather than risk guessing and hallucinating.
