import os

file_path = "/home/devtective/goskripsi/client/prisma/schema.prisma"

with open(file_path, 'r') as f:
    lines = f.readlines()

new_generator = [
    'generator client {\n',
    '  provider        = "prisma-client-js"\n',
    '  previewFeatures = ["relationJoins", "driverAdapters"]\n',
    '}\n',
    '\n'
]

# Check if generator already exists
has_generator = any("generator client" in line for line in lines)

if not has_generator:
    # Filter out empty lines at the start
    start_index = 0
    while start_index < len(lines) and lines[start_index].strip() == "":
        start_index += 1
    
    new_content = new_generator + lines[start_index:]
    with open(file_path, 'w') as f:
        f.writelines(new_content)
    print("Successfully prepended generator client to schema.prisma")
else:
    print("Generator already exists, doing nothing")
