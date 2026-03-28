import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in html.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.XML(xml_content)

    paragraphs = []
    for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [node.text
                 for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                 if node.text]
        if texts:
            paragraphs.append(''.join(texts))

    return '\n'.join(paragraphs)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        print(get_docx_text(sys.argv[1]))
    else:
        print("Please provide a path to a .docx file")
