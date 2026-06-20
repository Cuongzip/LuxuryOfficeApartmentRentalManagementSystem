import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r"C:\Users\cuong\Downloads\mau dac ta usecase N20_T6.docx"
output_path = r"d:\workspace\full-stack\LuxuryOfficeApartmentRentalManagementSystem\api\scratch\usecase_text.txt"

def get_docx_text(path):
    try:
        doc = zipfile.ZipFile(path)
        xml_content = doc.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # Namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for p in root.findall('.//w:p', ns):
            texts = []
            for r in p.findall('.//w:r', ns):
                for child in r:
                    if child.tag.endswith('t'):
                        texts.append(child.text or '')
                    elif child.tag.endswith('tab'):
                        texts.append('\t')
                    elif child.tag.endswith('br'):
                        texts.append('\n')
            paragraphs.append(''.join(texts))
            
        return '\n'.join(paragraphs)
    except Exception as e:
        import traceback
        return traceback.format_exc()

text = get_docx_text(docx_path)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Done. Wrote to", output_path)
