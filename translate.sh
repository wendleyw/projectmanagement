#!/bin/bash

# Find all TypeScript and TSX files with Portuguese characters
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "[áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]" > portuguese_files.txt

# Count the number of files found
echo "Found $(wc -l < portuguese_files.txt) files with Portuguese text"

# Print the list of files
cat portuguese_files.txt
