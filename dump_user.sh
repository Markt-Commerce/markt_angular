#!/usr/bin/env bash
set -euo pipefail

BASE='https://test.api.marktcommerce.com/api/v1'
EMAIL='adebowalemorakinyo@gmail.com'
PASSWORD='TestPassword123!'
ACCOUNT_TYPE='seller'

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="user_dump_${STAMP}"
COOKIE="$(mktemp)"
mkdir -p "$OUT_DIR"

format_json() { if command -v jq >/dev/null 2>&1; then jq .; elif command -v python3 >/dev/null 2>&1; then python3 -m json.tool; else cat; fi; }

curl -sS -c "$COOKIE" -H 'Content-Type: application/json' -X POST "$BASE/users/login" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"account_type\":\"$ACCOUNT_TYPE\"}" | format_json > "$OUT_DIR/login.json"

profile="$(curl -sS -b "$COOKIE" "$BASE/users/profile")"
echo "$profile" | format_json > "$OUT_DIR/profile.json"

if command -v jq >/dev/null 2>&1; then
  seller_id="$(echo "$profile" | jq -r '.data.seller_account.id // empty')"
else
  seller_id=""
fi

fetch() { curl -sS -b "$COOKIE" "$BASE$1" | format_json > "$OUT_DIR/$2.json"; }

fetch '/users/settings'                    'user_settings'
fetch '/users/addresses'                   'user_addresses'
fetch '/users/my-offers'                   'my_offers'
fetch '/users/my-reviews'                  'my_reviews'
fetch '/products/seller/my-products'       'my_products'
fetch '/orders/seller'                     'seller_orders'
fetch '/orders/seller/stats'               'seller_order_stats'
fetch '/analytics/seller/dashboard'        'seller_analytics_dashboard'
fetch '/analytics/seller/sales'            'seller_analytics_sales'
fetch '/analytics/seller/products'         'seller_analytics_products'
fetch '/analytics/seller/customers'        'seller_analytics_customers'

if [ -n "$seller_id" ]; then
  fetch "/socials/seller/$seller_id/posts" 'seller_posts'
  fetch '/socials/seller/posts/drafts'     'seller_posts_drafts'
  fetch '/socials/seller/posts/archived'   'seller_posts_archived'
fi

echo "$OUT_DIR" > .last_user_dump_dir
echo "Dump written to $OUT_DIR"
rm -f "$COOKIE"
