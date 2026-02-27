#!/bin/bash

set -e

echo "================================================"
echo "4ViegoMains Data Dragon Asset Download"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DDRAGON_URL="https://ddragon.leagueoflegends.com"
CDRAGON_URL="https://cdn.communitydragon.org"
OUTPUT_DIR="./public/ddragon"
VERSIONS_FILE="$OUTPUT_DIR/versions.json"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}Getting latest League of Legends version...${NC}"

# Fetch latest version
LATEST_VERSION=$(curl -s "$DDRAGON_URL/api/versions.json" | grep -o '"[0-9]*\.[0-9]*\.[0-9]*"' | head -1 | tr -d '"')

if [ -z "$LATEST_VERSION" ]; then
    echo -e "${RED}Error: Could not fetch latest version${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Latest version: $LATEST_VERSION${NC}"
echo ""

# Function to download with retry
download_with_retry() {
    local url=$1
    local output=$2
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}Downloading: $url${NC}"

        if curl -s -f -o "$output" "$url"; then
            echo -e "${GREEN}✓ Downloaded successfully${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Attempt $attempt failed${NC}"
            attempt=$((attempt + 1))
            if [ $attempt -le $max_attempts ]; then
                sleep 2
            fi
        fi
    done

    echo -e "${RED}✗ Failed to download after $max_attempts attempts${NC}"
    return 1
}

# Download champion data
echo -e "${BLUE}Downloading champion data...${NC}"
CHAMPION_DIR="$OUTPUT_DIR/champion"
mkdir -p "$CHAMPION_DIR"

download_with_retry \
    "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/champion.json" \
    "$CHAMPION_DIR/champion.json"

# Download individual champion data
echo -e "${BLUE}Downloading individual champion stats...${NC}"
# Extract champion list and download key ones (sample, not all to save bandwidth)
CHAMPIONS=("Viego" "KaynShadowAssassin" "Lulu" "Yuumi" "Gwen" "Akshan" "Senna" "Thresh" "Alistar" "Rell")

for champ in "${CHAMPIONS[@]}"; do
    download_with_retry \
        "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/champion/$champ.json" \
        "$CHAMPION_DIR/$champ.json" || true
done

echo ""

# Download item data
echo -e "${BLUE}Downloading item data...${NC}"
ITEM_DIR="$OUTPUT_DIR/item"
mkdir -p "$ITEM_DIR"

download_with_retry \
    "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/item.json" \
    "$ITEM_DIR/item.json"

echo ""

# Download rune data
echo -e "${BLUE}Downloading rune data...${NC}"
RUNE_DIR="$OUTPUT_DIR/rune"
mkdir -p "$RUNE_DIR"

download_with_retry \
    "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/runetree.json" \
    "$RUNE_DIR/runetree.json"

echo ""

# Download summoner spell data
echo -e "${BLUE}Downloading summoner spell data...${NC}"
SPELL_DIR="$OUTPUT_DIR/spell"
mkdir -p "$SPELL_DIR"

download_with_retry \
    "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/summoner.json" \
    "$SPELL_DIR/summoner.json"

echo ""

# Download profile icon data
echo -e "${BLUE}Downloading profile icon list...${NC}"
PROFILE_DIR="$OUTPUT_DIR/profileicon"
mkdir -p "$PROFILE_DIR"

download_with_retry \
    "$DDRAGON_URL/cdn/$LATEST_VERSION/data/en_US/profileicon.json" \
    "$PROFILE_DIR/profileicon.json"

echo ""

# Download champion splash arts (sample - top Viego items)
echo -e "${BLUE}Downloading champion splash arts...${NC}"
SPLASH_DIR="$OUTPUT_DIR/img/champion/splash"
mkdir -p "$SPLASH_DIR"

# Download Viego splasharts
for i in {0..5}; do
    download_with_retry \
        "$DDRAGON_URL/cdn/img/champion/splash/Viego_$i.jpg" \
        "$SPLASH_DIR/Viego_$i.jpg" || true
done

echo ""

# Download item icons
echo -e "${BLUE}Downloading item icons (sample)...${NC}"
ITEM_ICON_DIR="$OUTPUT_DIR/img/item"
mkdir -p "$ITEM_ICON_DIR"

# Download some common item icons
COMMON_ITEMS=("3001" "3003" "3036" "3040" "3065" "3089" "3135" "3139" "3145" "3157" "3181" "3184")

for item_id in "${COMMON_ITEMS[@]}"; do
    download_with_retry \
        "$DDRAGON_URL/cdn/$LATEST_VERSION/img/item/$item_id.png" \
        "$ITEM_ICON_DIR/$item_id.png" || true
done

echo ""

# Download rune icons
echo -e "${BLUE}Downloading rune icons...${NC}"
RUNE_ICON_DIR="$OUTPUT_DIR/img/rune"
mkdir -p "$RUNE_ICON_DIR"

download_with_retry \
    "$CDRAGON_URL/latest/plugins/rcp-be-lol-game-data/global/default/v1/runetree.json" \
    "$RUNE_ICON_DIR/runetree_cdragon.json" || true

echo ""

# Create version tracking file
echo -e "${BLUE}Creating version tracking file...${NC}"

cat > "$VERSIONS_FILE" << EOF
{
  "latestVersion": "$LATEST_VERSION",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "assets": {
    "champions": "$CHAMPION_DIR",
    "items": "$ITEM_DIR",
    "runes": "$RUNE_DIR",
    "spells": "$SPELL_DIR",
    "profileIcons": "$PROFILE_DIR",
    "splashArts": "$SPLASH_DIR",
    "itemIcons": "$ITEM_ICON_DIR",
    "runeIcons": "$RUNE_ICON_DIR"
  }
}
EOF

echo -e "${GREEN}✓ Version tracking file created${NC}"

echo ""

# Summary
TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Data Dragon assets downloaded successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Summary:"
echo -e "  Version:       ${YELLOW}$LATEST_VERSION${NC}"
echo -e "  Output:        ${YELLOW}$OUTPUT_DIR${NC}"
echo -e "  Total size:    ${YELLOW}$TOTAL_SIZE${NC}"
echo -e "  Downloaded at: ${YELLOW}$(date)${NC}"
echo ""
echo "Downloaded assets:"
echo "  ✓ Champion data and splash arts"
echo "  ✓ Item data and icons"
echo "  ✓ Rune data and trees"
echo "  ✓ Summoner spells"
echo "  ✓ Profile icons"
echo ""
echo "Note: To save bandwidth, only sample assets were downloaded."
echo "For production, consider downloading all champion splash arts and item icons."
echo ""
