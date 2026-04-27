import os

file_path = "/home/devtective/goskripsi/client/prisma/schema.prisma"

with open(file_path, 'r') as f:
    content = f.read()

new_generator = """generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["relationJoins", "driverAdapters"]
}"""

# Find the old generator block and replace it
# generator client {
#   provider = "prisma-client-js"
# }

import re
pattern = r"generator client \{.*?\}"
new_content = re.sub(pattern, new_generator, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(new_content)
print("Successfully updated schema.prisma with previewFeatures")
