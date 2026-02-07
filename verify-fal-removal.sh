#!/bin/bash
# Verification script for Fal AI removal

echo "=== Fal AI Removal Verification ==="
echo ""

# Check if Fal files were deleted
echo "1. Checking if Fal tool files were deleted..."
if [ ! -f "server/tools/fal_image_tools.py" ] && \
   [ ! -f "server/tools/fal_video_tools.py" ] && \
   [ ! -f "server/tools/image_providers/fal_provider.py" ] && \
   [ ! -f "server/tools/video_providers/fal_provider.py" ]; then
    echo "   ✅ All Fal tool files successfully deleted"
else
    echo "   ❌ Some Fal files still exist!"
    ls -la server/tools/fal_* 2>/dev/null || true
    ls -la server/tools/*/fal_* 2>/dev/null || true
fi
echo ""

# Check for Fal imports in tool_service.py
echo "2. Checking for Fal imports in tool_service.py..."
fal_imports=$(grep "from.*fal" server/services/tool_service.py 2>/dev/null | wc -l | tr -d ' ')
if [ "$fal_imports" = "0" ]; then
    echo "   ✅ No Fal imports found"
else
    echo "   ❌ Found $fal_imports Fal import(s)"
    grep "from.*fal" server/services/tool_service.py
fi
echo ""

# Check for Fal provider in config_service.py
echo "3. Checking config_service.py..."
fal_config=$(grep "'fal'" server/services/config_service.py 2>/dev/null | wc -l | tr -d ' ')
if [ "$fal_config" = "0" ]; then
    echo "   ✅ No Fal configuration found"
else
    echo "   ❌ Found $fal_config Fal config reference(s)"
fi
echo ""

# Check for Fal references in frontend model mappings
echo "4. Checking frontend model mappings..."
fal_mappings=$(grep "_fal" app/src/config/model-mappings.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$fal_mappings" = "0" ]; then
    echo "   ✅ No Fal model mappings found"
else
    echo "   ❌ Found $fal_mappings Fal model mapping(s)"
fi
echo ""

# Check for new tools
echo "5. Verifying new tools were added..."
new_tools=("generate_video_by_sora_2_pro_openai" "generate_image_by_imagen_4_fast_google" "generate_image_by_imagen_4_ultra_google")
all_found=true
for tool in "${new_tools[@]}"; do
    if grep -q "$tool" server/services/tool_service.py; then
        echo "   ✅ $tool registered"
    else
        echo "   ❌ $tool NOT found"
        all_found=false
    fi
done
echo ""

# Check for new frontend models
echo "6. Verifying new frontend models..."
new_models=("sora-2-pro" "imagen-4-fast" "imagen-4-ultra")
for model in "${new_models[@]}"; do
    if grep -q "$model" app/src/config/model-mappings.ts; then
        echo "   ✅ $model in frontend mappings"
    else
        echo "   ❌ $model NOT in frontend mappings"
        all_found=false
    fi
done
echo ""

# Summary
echo "=== Summary ==="
if [ "$all_found" = true ] && [ "$fal_imports" = "0" ] && [ "$fal_config" = "0" ] && [ "$fal_mappings" = "0" ]; then
    echo "✅ All checks passed! Fal AI successfully removed and new models added."
else
    echo "❌ Some checks failed. Review the output above."
fi
echo ""
echo "Next steps:"
echo "1. Test backend: cd server && python main.py --port 57989"
echo "2. Test frontend: cd app && npm run dev"
echo "3. Verify model dropdowns show correct models"
echo "4. Test image/video generation with new models"
