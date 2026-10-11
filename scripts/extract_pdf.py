import sys
import json
import pypdf

def extract(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_text.append({"page": i + 1, "text": text})
        
        full_text = "\n--- PÁGINA ---\n".join([p["text"] for p in pages_text])
        return {
            "success": True,
            "num_pages": len(pages_text),
            "pages": pages_text,
            "full_text": full_text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = extract(file_path)
    print(json.dumps(result, ensure_ascii=False))
