# Understanding RAG (Retrieval-Augmented Generation)

## What is RAG?

Standard Large Language Models (like ChatGPT or Gemini) know general facts up to their training cutoff date. However, **they do not know what is inside your private PDF notes, company manuals, or research papers**.

If you were to paste an entire 100-page book into a chatbot prompt:
1. It would exceed the model's context limits or cost a large amount of money.
2. The AI might hallucinate or miss critical details buried in the middle of the document.

**Retrieval-Augmented Generation (RAG)** solves this by breaking the process into three simple stages:

```
[1. INGESTION]          [2. RETRIEVAL]            [3. GENERATION]
Break document into     Search for only the       Give those 4 chunks
bite-sized chunks &     3-6 chunks relevant       to the LLM and ask it
turn into vectors.   -> to user's question.    -> to answer grounded ONLY
                                                  in those excerpts.
```

---

## The 4 Steps of RAG in Private Docs AI

### Step 1: Chunking & Page Preserving
A document is split into small paragraphs called **chunks** (approx. 500-600 tokens each).
Private Docs AI records the exact **page number** for each chunk so you can verify the answer later.

### Step 2: Vector Embeddings
Computers cannot directly compare raw English sentences for "meaning". Instead, an **embedding model** converts each text chunk into an array of numbers (a mathematical coordinate vector in high-dimensional space).
Similar concepts end up close together in space.

### Step 3: Vector Search (ChromaDB)
When you ask:
> *"What does Chapter 2 say about transaction isolation?"*

The system:
1. Converts your question into a vector.
2. Queries **ChromaDB** to find the closest chunk vectors.
3. Retrieves the top matching excerpts from your documents.

### Step 4: Grounded Answer Synthesis
Instead of letting the AI guess, we give it a strict prompt:
> *"Answer using only the retrieved excerpts below. If the answer is not present, say that you could not find the information instead of inventing facts. Cite the page numbers."*

---

## Why Citations Matter

In mission-critical research and studies, an ungrounded answer is untrustworthy. Private Docs AI attaches interactive citations to every response:

```
Answer:
Normalization decomposes tables to eliminate update and deletion anomalies.

Sources:
📄 DBMS_Notes.pdf — Page 12
📄 DBMS_Notes.pdf — Page 14
```

Clicking on a source shows you the exact excerpt retrieved from that page.
