import os

# Path to the HTML directory
html_dir = r'c:\Users\yuuge\OneDrive\Desktop\ISTE-FRONTEND\HTML'

# Files to update
html_files = [
    'execom.html', 'forum-cs.html', 'forum-ece.html', 'forum-mechanical.html',
    'forum-swas.html', 'forums.html', 'index.html', 'iste.html', 'join.html',
    'registration.html', 'workshop.html'
]

# CSS and JS links to add
css_link = '    <link rel="stylesheet" href="../CSS/parallax.css">'
js_script = '    <script src="../JS/parallax.js"></script>'

for html_file in html_files:
    file_path = os.path.join(html_dir, html_file)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if already updated
        if 'parallax.css' in content:
            print(f'Skipping {html_file} - already updated')
            continue
            
        # Add CSS link after the last CSS file
        if '<link rel="stylesheet"' in content:
            last_css_pos = content.rfind('<link rel="stylesheet"')
            insert_pos = content.find('>', last_css_pos) + 1
            content = content[:insert_pos] + '\n' + css_link + content[insert_pos:]
        
        # Add JS script before closing body tag
        if '</body>' in content:
            body_pos = content.rfind('</body>')
            content = content[:body_pos] + '\n' + js_script + '\n' + content[body_pos:]
        
        # Save the updated file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Updated {html_file} with parallax effect')
        
    except Exception as e:
        print(f'Error updating {html_file}: {str(e)}')

print('Parallax effect has been added to all HTML files.')
