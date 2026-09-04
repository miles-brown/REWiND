# REWiND AI & Automated Research Policy

## 1. Principles of AI Use in Evidentiary Research

Artificial intelligence tools, large language models (LLMs), and automated speech-to-text systems represent valuable research accelerators. However, their use within the REWiND Evidence Atlas is subject to strict governance to prevent synthetic hallucinations or fabricated citations:

1. **AI Cannot Serve as Evidence**: An LLM output, summary, or synthetic answer is classified as `discovery-only` and **never serves as proof of any factual claim**.
2. **Mandatory Primary Verification**: Any candidate event, quote, or entity proposed by an automated extraction system must cite an authentic primary source URL and verifiable locator.
3. **No Synthetic Citations**: Ingestion pipelines must validate source URLs with live HEAD/GET HTTP requests or archival record lookups before claims are accepted into review queues.
4. **Transparent Ingestion Provenance**: Where machine extraction was utilized to parse raw transcripts, the record must specify `extractor_agent` and `prompt_hash` in its provenance metadata.
5. **Human Editorial Sign-Off**: Tier-A coverage programmes, high-profile diplomatic summits, and contentious historical actions require explicit human editor sign-off before public publication.
