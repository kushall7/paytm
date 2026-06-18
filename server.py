import os
import random
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 3000
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), 'public')

class PaytmRequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Serve from public directory
        original_path = super().translate_path(path)
        # Calculate relative path from current working directory
        rel = os.path.relpath(original_path, os.getcwd())
        return os.path.join(PUBLIC_DIR, rel)

    def do_HEAD(self):
        # Handle HEAD requests for API endpoints
        if self.path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
        else:
            super().do_HEAD()

    def do_GET(self):
        # Handle mock API routes
        if self.path == '/api/balance':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = {
                "wallet": 2547.80,
                "upiLite": 0,
                "cashback": 156.50,
                "currency": "INR"
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
        elif self.path == '/api/transactions':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = {
                "transactions": [
                    { "id": 1, "type": "debit", "to": "Amazon Pay", "amount": 499, "date": "2026-06-17", "status": "success", "icon": "🛒" },
                    { "id": 2, "type": "credit", "from": "Cashback Reward", "amount": 25, "date": "2026-06-16", "status": "success", "icon": "🎁" },
                    { "id": 3, "type": "debit", "to": "Electricity Bill", "amount": 1850, "date": "2026-06-15", "status": "success", "icon": "⚡" },
                    { "id": 4, "type": "debit", "to": "Mobile Recharge", "amount": 299, "date": "2026-06-14", "status": "success", "icon": "📱" },
                    { "id": 5, "type": "credit", "from": "Rahul Sharma", "amount": 500, "date": "2026-06-13", "status": "success", "icon": "👤" }
                ]
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
        elif self.path == '/api/notifications':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = {
                "notifications": [
                    { "id": 1, "title": "Cashback Credited! 🎉", "message": "₹25 cashback for your Amazon payment", "time": "2 hours ago", "read": False },
                    { "id": 2, "title": "Bill Reminder", "message": "Your electricity bill is due in 3 days", "time": "5 hours ago", "read": False },
                    { "id": 3, "title": "New Offer!", "message": "Get 10% cashback on mobile recharge", "time": "1 day ago", "read": False },
                    { "id": 4, "title": "Payment Successful", "message": "₹299 paid to Airtel Prepaid", "time": "2 days ago", "read": True },
                    { "id": 5, "title": "Gold Price Drop", "message": "Gold prices are down 2%. Good time to invest!", "time": "3 days ago", "read": True }
                ]
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
        elif self.path == '/api/plans':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = {
                "plans": [
                    { "id": 1, "amount": 199, "validity": "24 days", "data": "1.5 GB/day", "description": "Unlimited calls + 100 SMS/day" },
                    { "id": 2, "amount": 299, "validity": "28 days", "data": "2 GB/day", "description": "Unlimited calls + 100 SMS/day", "popular": True },
                    { "id": 3, "amount": 479, "validity": "56 days", "data": "1.5 GB/day", "description": "Unlimited calls + 100 SMS/day" },
                    { "id": 4, "amount": 719, "validity": "84 days", "data": "2 GB/day", "description": "Unlimited calls + 100 SMS/day", "popular": True },
                    { "id": 5, "amount": 2999, "validity": "365 days", "data": "2 GB/day", "description": "Unlimited calls + 100 SMS/day" }
                ]
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
        elif self.path == '/api/gold-price':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            base_price = 7245
            fluctuation = (random.random() - 0.5) * 100
            price = base_price + fluctuation
            change = f"+{fluctuation:.2f}" if fluctuation > 0 else f"{fluctuation:.2f}"
            trend = 'up' if fluctuation > 0 else 'down'
            data = {
                "price": f"{price:.2f}",
                "change": change,
                "trend": trend,
                "unit": "per gram",
                "currency": "INR"
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))
        else:
            # Check if requesting a file, if not serve index.html (client-side routing)
            # Remove query string if any
            clean_path = self.path.split('?')[0]
            # Convert to local filepath
            filepath = os.path.join(PUBLIC_DIR, clean_path.lstrip('/'))
            if os.path.exists(filepath) and os.path.isfile(filepath):
                super().do_GET()
            else:
                # Fallback to index.html
                self.path = '/index.html'
                super().do_GET()

if __name__ == '__main__':
    print(f"Starting Paytm Clone Python server on port {PORT}...")
    server = HTTPServer(('0.0.0.0', PORT), PaytmRequestHandler)
    print(f"  Local: http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
