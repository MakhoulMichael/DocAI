import numpy as np
from collections import Counter
from scipy.spatial.distance import euclidean
import tiktoken
import spacy
import docx
import pypdf
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from docx2pdf import convert
import io
import fitz  # PyMuPDF
from PIL import Image
import base64
from docx import Document
import os
import re
import re
from docx import Document
import cohere


try:
    nlp = spacy.load("en_core_web_sm")
except:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")
    
try:
    embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")
except:
    print("Warning: BGE model not found, using MiniLM as fallback.")
    embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    




def read_text_from_file(file_path):
    """Reads text from a TXT, PDF, or DOCX file."""
    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    elif file_path.endswith(".pdf"):
        text = ""
        with open(file_path, "rb") as file:
            reader = pypdf.PdfReader(file)  # Updated to use pypdf
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format. Use TXT, PDF, or DOCX.")
    
def chunk_text_by_idea(text, threshold=0.7, max_tokens=200):
    """
    Splits text into sentences and groups them into coherent chunks based on semantic similarity.
    
    - text: Input text to be chunked.
    - threshold: Similarity score to merge sentences (higher = stricter).
    - max_tokens: Max token count per chunk.
    
    Returns: List of text chunks.
    """
    
    # Step 1: Split text into sentences
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
    
    if not sentences:
        return []
    
    # Step 2: Load embedding model (BGE or fallback MiniLM)
    try:
        model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    except:
        print("Warning: BGE model not found, using MiniLM as fallback.")
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    
    # Step 3: Generate embeddings
    embeddings = model.encode(sentences, convert_to_numpy=True)
    
    # Step 4: Group sentences into coherent chunks
    chunks = []
    current_chunk = [sentences[0]]
    current_tokens = len(sentences[0].split())

    for i in range(1, len(sentences)):
        similarity = cosine_similarity([embeddings[i]], [embeddings[i - 1]])[0][0]
        sentence_tokens = len(sentences[i].split())

        if similarity >= threshold and (current_tokens + sentence_tokens) <= max_tokens:
            current_chunk.append(sentences[i])
            current_tokens += sentence_tokens
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i]]
            current_tokens = sentence_tokens

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    # Print total number of chunks
    print(f"✅ Total Chunks Created: {len(chunks)}")

    return chunks


def calculate_average_chunk_size(chunks):
    """Calculates the average number of words per chunk."""
    if not chunks:
        return 0  # Avoid division by zero if no chunks exist
    total_words = sum(len(chunk.split()) for chunk in chunks)
    return total_words / len(chunks)


def cluster_text_chunks(chunks, n_clusters=None, predefined_themes=None, num_samples=2):
    """
    Clusters text chunks using embeddings and K-Means.
    
    - If `n_clusters` is None, it determines the optimal number of clusters.
    - If `predefined_themes` is provided, assigns chunks to the closest theme.
    - Prints cluster distribution, percentage of chunks per cluster, and example chunks.

    Args:
        chunks (list): List of text chunks.
        n_clusters (int, optional): Number of clusters (if known).
        predefined_themes (list, optional): List of themes to cluster around.
        num_samples (int, optional): Number of sample chunks to display per cluster.

    Returns:
        dict: A dictionary containing:
            - 'labels': Assigned cluster labels for each chunk.
            - 'cluster_counts': Count of chunks per cluster.
            - 'percentages': Percentage of chunks per cluster.
            - 'samples': Example chunks from each cluster.
    """

    # Load Embedding Model
    try:
        embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    except:
        print("Warning: BGE model not found, using MiniLM as fallback.")
        embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    # Step 1: Generate embeddings for the text chunks
    embeddings = embedding_model.encode(chunks, convert_to_numpy=True)

    # Step 2: Thematic Clustering (if predefined themes exist)
    if predefined_themes:
        theme_embeddings = embedding_model.encode(predefined_themes, convert_to_numpy=True)
        labels = [np.argmax(cosine_similarity([emb], theme_embeddings)[0]) for emb in embeddings]
    else:
        # Step 3: Determine Optimal Clusters if `n_clusters` is not provided
        if n_clusters is None:
            best_k, best_score = 2, -1
            for k in range(2, min(10, len(embeddings))):  
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                labels = kmeans.fit_predict(embeddings)
                score = silhouette_score(embeddings, labels)
                if score > best_score:
                    best_k, best_score = k, score
            n_clusters = best_k

        # Step 4: Cluster using KMeans
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(embeddings)

    # Step 5: Compute Cluster Distribution & Percentages
    cluster_counts = Counter(labels)
    total_chunks = len(chunks)
    cluster_percentages = {cluster: round((count / total_chunks) * 100, 2) for cluster, count in cluster_counts.items()}

    # Step 6: Display Cluster Information
    print("\n🔹 Cluster Distribution:")
    for cluster_id, count in sorted(cluster_counts.items()):
        print(f"   - Cluster {cluster_id}: {count} chunks ({cluster_percentages[cluster_id]}%)")

    # Step 7: Display Sample Chunks
    print("\n🔹 Sample Chunks from Clusters:")
    cluster_dict = {i: [] for i in set(labels)}  
    for idx, cluster_id in enumerate(labels):
        cluster_dict[cluster_id].append(chunks[idx])

    cluster_samples = {cluster_id: texts[:num_samples] for cluster_id, texts in cluster_dict.items()}
    for cluster_id, texts in cluster_samples.items():
        print(f"\n🔹 Cluster {cluster_id}:")
        for text in texts:
            print(f"  - {text[:200]}...")  # Show first 200 characters of the chunk

    return {
        "labels": labels,
        "cluster_counts": cluster_counts,
        "percentages": cluster_percentages,
        "samples": cluster_samples
    }
    
def calculate_chunk_limit_tiktoken(num_words, avg_chunk_size_words, model="gpt-3.5-turbo", prompt_size_tokens=450):
    """
    Calculate the number of chunks that fit within the remaining token budget.

    Args:
    - num_words (int): Number of words in the document.
    - avg_chunk_size_words (int): Average chunk size in words.
    - model (str): OpenAI model to use for token counting.
    - prompt_size_tokens (int): Number of tokens used by the prompt (default 100).

    Returns:
    - int: Number of chunks that fit within the token limit.
    """

    enc = tiktoken.encoding_for_model(model)

    # Use a slightly longer word for a more accurate token estimation
    example_text = " ".join(["exampleword"] * num_words)
    num_words_in_tokens = len(enc.encode(example_text))

    example_text = " ".join(["exampleword"] * int(avg_chunk_size_words))
    avg_chunk_size_tokens = len(enc.encode(example_text))

    # Compute remaining token budget
    remaining_tokens = 8000 - num_words_in_tokens - prompt_size_tokens

    # Calculate number of chunks that fit within remaining tokens
    num_chunks = remaining_tokens / (avg_chunk_size_tokens+10)

    return max(1, int(num_chunks))  # Ensure at least 1 chunk

def allocate_representative_chunks(cluster_percentages, sum_representative_chunks):
    """
    Allocates representative chunks to each cluster based on percentage distribution.

    Args:
        cluster_percentages (dict): Dictionary with cluster IDs as keys and percentage of chunks as values.
        sum_representative_chunks (int): Total number of representative chunks.

    Returns:
        dict: Mapping of cluster ID to allocated representative chunks.
    """

    # Step 1: Compute raw allocations
    raw_allocations = {cluster: (percent / 100) * sum_representative_chunks for cluster, percent in cluster_percentages.items()}

    # Step 2: Round to nearest integer
    allocated_chunks = {cluster: round(value) for cluster, value in raw_allocations.items()}

    # Step 3: Adjust rounding errors to ensure total sum matches `sum_representative_chunks`
    total_allocated = sum(allocated_chunks.values())
    difference = sum_representative_chunks - total_allocated

    # Step 4: Adjust the largest clusters (to fix rounding differences)
    sorted_clusters = sorted(allocated_chunks, key=lambda x: -cluster_percentages[x])  # Sort by highest percentage
    for i in range(abs(difference)):
        if difference > 0:
            allocated_chunks[sorted_clusters[i]] += 1  # Add chunk
        elif difference < 0:
            allocated_chunks[sorted_clusters[i]] -= 1  # Remove chunk

    return allocated_chunks


def select_central_chunks(chunks, embeddings, labels, kmeans, representative_chunk_allocation):
    """
    Selects the most central chunks for each cluster based on precomputed representative chunk allocation.

    Args:
        chunks (list): List of text chunks.
        embeddings (list): Corresponding list of chunk embeddings.
        labels (list): Cluster labels assigned to each chunk.
        kmeans (KMeans): Trained KMeans model.
        representative_chunk_allocation (dict): Number of representative chunks per cluster.

    Returns:
        dict: Mapping of cluster ID to selected representative chunks.
    """

    # Step 1: Store chunks by cluster with distances to cluster center
    cluster_chunks = {cluster_id: [] for cluster_id in representative_chunk_allocation.keys()}
    for idx, cluster_id in enumerate(labels):
        dist = euclidean(embeddings[idx], kmeans.cluster_centers_[cluster_id])
        cluster_chunks[cluster_id].append((dist, chunks[idx]))

    # Step 2: Select the most central chunks for each cluster
    representative_chunks = {}
    for cluster_id, chunk_list in cluster_chunks.items():
        if not chunk_list:
            continue
        
        sorted_chunks = sorted(chunk_list, key=lambda x: x[0])  # Sort by distance to cluster center
        distances = [d for d, _ in sorted_chunks]  # Extract only distances
        mean_dist = np.mean(distances)  # Compute the mean distance for the cluster
        
        # Sort by closeness to the mean distance (most central)
        sorted_chunks = sorted(chunk_list, key=lambda x: abs(x[0] - mean_dist))
        
        num_representatives = min(representative_chunk_allocation[cluster_id], len(sorted_chunks))
        representative_chunks[cluster_id] = [sorted_chunks[i][1] for i in range(num_representatives)]

    # Print cluster sizes and selected representative chunks
    print("\n🔹 Final Selected Representative Chunks:")
    for cluster_id, count in representative_chunk_allocation.items():
        print(f"   - Cluster {cluster_id}: {count} selected chunks")

    return representative_chunks


def merge_representative_chunks(central_chunks):
    """
    Merges all selected representative chunks into a single formatted string.

    Args:
        central_chunks (dict): Dictionary mapping cluster IDs to selected representative chunks.

    Returns:
        str: A single string containing all representative chunks, formatted with separators.
    """
    merged_text = []

    for cluster_id, chunks in central_chunks.items():
        merged_text.append(f"\n🔹 **Cluster {cluster_id}**:\n")
        for chunk in chunks:
            merged_text.append(chunk.strip())  # Remove extra spaces

    return "\n".join(merged_text)


class PromptBuilder:
    """Builds a customizable prompt for document summarization."""
    
    def __init__(self, merged_text, instruction=None):
        self.instruction = instruction or (
            "You are an expert at summarizing long documents. Your task is to generate a **well-structured summary** "
            "of the text while keeping the key ideas and removing unnecessary details."
        )
        self.merged_text = merged_text
        self.summary_length = None
        self.format_type = "paragraph"
        self.tone = "neutral"
        self.language = "English"
        self.vocabulary = "abstractive"
        self.structure = None

    def set_summary_length(self, length):
        self.summary_length = length
        return self

    def set_format(self, format_type):
        self.format_type = format_type
        return self

    def set_tone(self, tone):
        self.tone = tone
        return self
    
    def set_language(self, language):
        self.language = language
        return self
    
    def set_vocabulary(self, vocabulary):
        """Sets the vocabulary for the summarization."""
        if vocabulary in ["abstractive", "extractive"]:
            self.vocabulary = vocabulary
        return self
    
    def set_structure(self,structure):
        self.structure = structure
        return self


    def build(self):
        """Construct the final prompt based on the settings."""
        prompt = f"{self.instruction}\n\n"

        prompt += f"TEXT:\n{self.merged_text}\n\n"
        if (self.structure != None):
            prompt += (
            "The answer must strictly follow the structure below. "
            "Keep all titles, numberings (1, 2, 3...) and lettered sub-points (a, b, c...), "
            "and add the corresponding paragraphs under each section without altering the format:\n"
            f"{self.structure}\n\n"
            )
        
        prompt += (
            f"The summary should be approximately {self.summary_length} words long, "
            f"written in {'bullet points' if self.format_type == 'bullet points' else 'normal text'} format. "
            f"Please use a {self.tone.lower()} tone, write in {self.language}, and apply "
            f"{self.vocabulary.lower()} summarization techniques.\n\n"
            "Now, provide the summary:"
        )

        return prompt


def summarize_with_together(merged_text, summary_length, format_type, tone, language, vocabulary,structure):
    """Generates a summary using Together AI with customizable parameters."""

    # Get user input for summary customization

    # Use PromptBuilder to construct the prompt dynamically
    builder = PromptBuilder(merged_text)
    builder.set_summary_length(summary_length) \
       .set_format(format_type) \
       .set_tone(tone) \
       .set_language(language) \
       .set_vocabulary(vocabulary) \
       .set_structure(structure)
    
    #Build the final prompt
    prompt = builder.build()
    print(prompt)

    # Call Together AI API
    

    co = cohere.ClientV2("UVYBn9BwS5faChlXamCTflAz778ZLzwnV2RH4Pux")

    response = co.chat(
        model="command-a-03-2025",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=2300
    )

    # Extract and return the summary
    return response.message.content[0].text



def adjust_summary_length(summary_length, nb_words):
    if summary_length == "low":
        summary_length_calculated = round(0.1 * nb_words)
        summary_length_calculated = max(150, min(350, summary_length_calculated))
    elif summary_length == "moderate":
        summary_length_calculated = round(0.2 * nb_words)
        summary_length_calculated = max(400, min(650, summary_length_calculated))
    elif summary_length == "high":
        summary_length_calculated = round(0.3 * nb_words)
        summary_length_calculated = max(700, min(1200, summary_length_calculated))
    else:
        # If it's already a number, convert it safely
        try:
            summary_length_calculated = round(float(summary_length))
        except ValueError:
            raise ValueError("Invalid summary_length value. It must be 'low', 'moderate', 'high', or a number.")

    # Ensure final result is between 50 and 2000, even for custom numbers
    summary_length_final = max(150, min(1700, summary_length_calculated))

    return summary_length_final



def summarize_document(file_path, text, themes=None, summary_format="paragraph", summary_length=150, summary_tone="neutral", language="english", vocabulary = "abstractive", structure = None, paragraph_title=None):  

    structure_text = ""  # Always define to avoid UnboundLocalError

    if text is None:
        text = read_text_from_file(file_path)
    if paragraph_title:
        text = extract_section_from_file(file_path, paragraph_title)
    
    # Handle structure or themes as structure guide
    if structure is not None:
        structure_text = read_text_from_file(structure)
        print(structure_text)
    elif themes:
        if isinstance(themes, list):
            structure_text = "\n".join(themes)
        else:
            raise TypeError(f"Expected 'themes' to be a list, got {type(themes).__name__}")
      
    nb_words = len(text.split())
    if type(summary_length) == str:  
        summary_length = adjust_summary_length(summary_length, nb_words)
    print("structure:" + structure_text)
    if nb_words>3700:
        chunks = chunk_text_by_idea(text)

        # Step 2: Calculate Average Chunk Size
        avg_chunk_size = calculate_average_chunk_size(chunks)

        # Step 3: Perform Text Clustering
        if (themes == []):
            print("hi")
            cluster_result = cluster_text_chunks(chunks)
        else:
            print(themes)
            cluster_result = cluster_text_chunks(chunks, predefined_themes = themes)

        # Step 4: Calculate Representative Chunk Limit
        total_representative_chunks = calculate_chunk_limit_tiktoken(int(summary_length), avg_chunk_size)

        # Step 5: Allocate Representative Chunks Per Cluster
        cluster_percentages = cluster_result["percentages"]  # {cluster_id: percentage}
        representative_chunk_allocation = allocate_representative_chunks(cluster_percentages, total_representative_chunks)

        # Step 6: Print Allocation Results (Optional, can be removed)
        print("\n🔹 Final Representative Chunk Allocation:")
        for cluster_id, count in representative_chunk_allocation.items():
            print(f"   - Cluster {cluster_id}: {count} representative chunks")

        # Step 7: Generate Embeddings and Perform K-Means Clustering
        embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")
        embeddings = embedding_model.encode(chunks, convert_to_numpy=True)
        n_clusters = len(cluster_result["cluster_counts"])
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(embeddings)

        # Step 8: Select Central Chunks and Merge
        selected_chunks = select_central_chunks(chunks, embeddings, cluster_result['labels'], kmeans, representative_chunk_allocation)
        merged_text = merge_representative_chunks(selected_chunks)

        # Step 9: Summarize the Merged Text
        summary = summarize_with_together(merged_text, summary_length, summary_format,  summary_tone, language, vocabulary, structure_text)
    else:
        summary = summarize_with_together(text, summary_length, summary_format,  summary_tone, language, vocabulary ,structure_text)
    
    return summary

