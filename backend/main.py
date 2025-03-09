from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

def extract_name_from_markdown(markdown_text):
    """
    Extract the name of the CV owner from markdown text using Gemini API
    """
    prompt = f"""
    Extract ONLY the full name of the person whose CV/resume is represented in the following markdown text.
    Return ONLY the name, nothing else.
    
    Markdown text:
    {markdown_text[:2000]}  # Limiting text length to avoid token limits
    """
    
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    response = model.generate_content(prompt)
    
    # Return the extracted name
    return response.text.strip()

# Example usage
source = "documents/CV_rev5.pdf"  # PDF path or URL
converter = DocumentConverter()
result = converter.convert(source)
markdown_text = result.document.export_to_markdown()

# Extract name from the markdown
name = extract_name_from_markdown(markdown_text)
print(f"Extracted name: {name}")

# Use the all-MiniLM-L6-v2 model as requested
chunker = HybridChunker(tokenizer="sentence-transformers/all-MiniLM-L6-v2")
chunks = list(chunker.chunk(result.document))
print(f"Number of chunks: {len(chunks)}")
print(f"First chunk: {chunks[0]}")

# Process chunks and add document identity
enhanced_chunks = []
for chunk in chunks:
    chunk_text = chunk.text if hasattr(chunk, "text") else str(chunk)
    enhanced_chunk = {
        "text": chunk_text,
        "metadata": {
            "document_id": source,
            "person_name": name,
            "chunk_index": chunks.index(chunk),
        }
    }
    enhanced_chunks.append(enhanced_chunk)

print(f"Total chunks with metadata: {len(enhanced_chunks)}")

