import xml.etree.ElementTree as ET
import re

def extract_text_from_xml(xml_path):
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Word XML namespaces
        ns = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        
        paragraphs = []
        for p in root.findall('.//w:p', ns):
            texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

content = extract_text_from_xml(r'c:\Users\jang9\OneDrive\Documents\GitHub\Document_Hero_Exposed\tmp_extract\word\document.xml')
with open(r'c:\Users\jang9\OneDrive\Documents\GitHub\Document_Hero_Exposed\extracted_content.txt', 'w', encoding='utf-8') as f:
    f.write(content)
