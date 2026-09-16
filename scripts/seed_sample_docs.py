"""
Private Docs AI - Sample Document Generator & Seeder
Creates sample PDF, DOCX, and TXT files in tests/test_data/ for instant local testing.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEST_DATA = ROOT / "tests" / "test_data"
TEST_DATA.mkdir(parents=True, exist_ok=True)


def create_sample_docx():
    try:
        from docx import Document
        doc = Document()
        doc.add_heading("Cloud Computing & Distributed Systems Architecture", level=0)
        
        doc.add_heading("1. Cloud Service Models", level=1)
        doc.add_paragraph(
            "Cloud computing delivers computing services over the Internet. The three primary service models are: "
            "Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS)."
        )

        doc.add_heading("2. Scalability and Elasticity", level=1)
        doc.add_paragraph(
            "Horizontal scaling involves adding more machine nodes to a cluster, whereas vertical scaling adds more CPU and RAM "
            "to a single existing node. Elasticity enables automatic scaling based on real-time traffic workload spikes."
        )

        doc.add_heading("3. The CAP Theorem", level=1)
        doc.add_paragraph(
            "Eric Brewer's CAP theorem states that a distributed data store can simultaneously provide at most two out of "
            "three guarantees: Consistency, Availability, and Partition Tolerance."
        )

        docx_path = TEST_DATA / "sample_cloud_notes.docx"
        doc.save(str(docx_path))
        print(f"Created {docx_path}")
    except Exception as e:
        print(f"Skipping DOCX creation: {e}")


def create_sample_pdf():
    try:
        import pymupdf as fitz
        doc = fitz.open()

        # Page 1
        page1 = doc.new_page()
        page1.insert_text(
            (50, 72),
            "DBMS & Relational Algebra Course Notes\n\n"
            "Chapter 1: Relational Model Foundations\n\n"
            "The relational model represents data as mathematical relations (tables). Each row represents a tuple and each column represents an attribute.\n"
            "Keys:\n"
            "- Primary Key: Uniquely identifies a tuple in a table.\n"
            "- Foreign Key: Enforces referential integrity between two related tables.\n"
            "- Candidate Key: Minimal superkey with no redundant attributes.\n",
            fontsize=12,
        )

        # Page 2
        page2 = doc.new_page()
        page2.insert_text(
            (50, 72),
            "Chapter 2: Normalization and Functional Dependencies\n\n"
            "Normalization reduces data redundancy through decomposition.\n"
            "- 1NF: Atomic column values.\n"
            "- 2NF: No partial dependency on candidate keys.\n"
            "- 3NF: No transitive dependency on non-prime attributes.\n"
            "- BCNF: Determinant of every non-trivial functional dependency must be a superkey.\n",
            fontsize=12,
        )

        pdf_path = TEST_DATA / "sample_dbms_notes.pdf"
        doc.save(str(pdf_path))
        doc.close()
        print(f"Created {pdf_path}")
    except Exception as e:
        print(f"Skipping PDF creation: {e}")


if __name__ == "__main__":
    create_sample_docx()
    create_sample_pdf()
    print("Sample test files generated in tests/test_data/")
