#!/bin/bash

# Quick verification script for image retrieval from Supabase
# Run this from the root directory: ./verify_images.sh

echo ""
echo "========================================"
echo "Supabase Image Retrieval Verification"
echo "========================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Run the verification script
python3 verify_supabase_images.py

echo ""
echo "========================================"
echo "Verification Complete"
echo "========================================"
echo ""
