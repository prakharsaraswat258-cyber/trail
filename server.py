import http.server
import functools
import json
import os
import sqlite3
import sys
import time

PORT = int(os.environ.get('PORT', 3000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DIRECTORY, 'lpufind.db')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS student (
            id TEXT PRIMARY KEY,
            name TEXT,
            reg_no TEXT,
            roll_no TEXT,
            course TEXT,
            school TEXT,
            semester TEXT,
            academic_year TEXT,
            section TEXT,
            email TEXT,
            phone TEXT,
            residence TEXT,
            campus TEXT,
            avatar_initials TEXT,
            verified INTEGER
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS karma (
            id TEXT PRIMARY KEY,
            credits INTEGER,
            reported_count INTEGER,
            returned_count INTEGER,
            success_rate TEXT,
            trust_score TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS perks (
            id TEXT PRIMARY KEY,
            title TEXT,
            points INTEGER,
            category TEXT,
            description TEXT,
            icon TEXT,
            color TEXT,
            available INTEGER
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            title TEXT,
            location TEXT,
            points INTEGER,
            type TEXT,
            date TEXT,
            ref_id TEXT,
            created_at REAL
        )
    ''')

    # Seed initial student if empty
    c.execute('SELECT COUNT(*) FROM student')
    if c.fetchone()[0] == 0:
        c.execute('''
            INSERT INTO student VALUES (
                'std_01', 'Prakhar Saraswat', '12204589', 'RK22GHA42',
                'B.Tech - Computer Science & Engineering (CSE)',
                'School of Computer Science & Engineering',
                '6th Semester', '3rd Year (Class of 2026)', 'K22GH',
                'prakhar.12204589@lpu.in', '+91 98765 43210',
                'Hostel BH-4, Room 312', 'LPU Main Campus, Jalandhar-Delhi G.T. Road',
                'PS', 1
            )
        ''')
        c.execute('''
            INSERT INTO karma VALUES ('std_01', 750, 14, 12, '98%', '4.9★')
        ''')
        
        perks_seed = [
            ('perk_umc_review', 'Minor UMC Leniency Review Request', 450, 'Proctorial Board',
             'Submit a formal community karma plea to the Proctorial & UMC Committee for minor disciplinary/attendance infraction leniency.',
             '⚖️', 'bg-red-50 text-red-700 border-red-200', 1),
            ('perk_nss_leader', 'NSS Leader Selection & Recommendation', 350, 'Leadership & NSS',
             'Priority nomination and Faculty Coordinator endorsement for National Service Scheme (NSS) Student Wing Leader post.',
             '🎖️', 'bg-purple-50 text-purple-700 border-purple-200', 1),
            ('perk_free_printing', 'Free Printing at Campus Tuck Shops', 100, 'Campus Utility',
             'Voucher for 100 free pages of black/white printing & binding across all hostel and block tuck shops.',
             '🖨️', 'bg-blue-50 text-blue-700 border-blue-200', 1),
            ('perk_extended_library', 'Extended Borrowing Time for Library Books', 150, 'Central Library',
             'Extends Central Library book issue limit to 6 books with +14 days extra borrow duration & zero overdue fines.',
             '📚', 'bg-amber-50 text-amber-700 border-amber-200', 1)
        ]
        c.executemany('INSERT INTO perks VALUES (?, ?, ?, ?, ?, ?, ?, ?)', perks_seed)

        tx_seed = [
            ('tx_1', 'Returned Apple AirPods Pro (2nd Gen)', 'Central Library Desk', 150, 'EARN', 'Yesterday, 3:45 PM', 'POST-8921', time.time() - 86400),
            ('tx_2', 'Reported & Handed Over Student ID Card', 'Block 34 Security Office', 100, 'EARN', '2 days ago', 'POST-8874', time.time() - 172800),
            ('tx_3', 'Redeemed Free Printing at Campus Tuck Shops', 'Block 13 Tuck Shop', 100, 'REDEEM', '3 days ago', 'VOUCH-4412', time.time() - 259200),
            ('tx_4', 'Reported Found MacBook Charger', 'Science Complex, Rm 204', 100, 'EARN', '5 days ago', 'POST-8810', time.time() - 432000),
            ('tx_5', 'Campus Samaritan Monthly Bonus', 'LPU Find Community Hub', 100, 'EARN', '10 days ago', 'SYS-BONUS', time.time() - 864000)
        ]
        c.executemany('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)', tx_seed)

    conn.commit()
    conn.close()

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def send_json(self, status_code, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        
        # REST API Routes
        if clean_path == '/api/profile':
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            student = dict(c.execute('SELECT * FROM student WHERE id = "std_01"').fetchone())
            karma = dict(c.execute('SELECT * FROM karma WHERE id = "std_01"').fetchone())
            perks = [dict(row) for row in c.execute('SELECT * FROM perks').fetchall()]
            txs = [dict(row) for row in c.execute('SELECT * FROM transactions ORDER BY created_at DESC').fetchall()]
            conn.close()
            
            # Shape response
            return self.send_json(200, {
                'student': {
                    'name': student['name'],
                    'regNo': student['reg_no'],
                    'rollNo': student['roll_no'],
                    'course': student['course'],
                    'school': student['school'],
                    'semester': student['semester'],
                    'academicYear': student['academic_year'],
                    'section': student['section'],
                    'email': student['email'],
                    'phone': student['phone'],
                    'residence': student['residence'],
                    'campus': student['campus'],
                    'avatarInitials': student['avatar_initials'],
                    'verified': bool(student['verified'])
                },
                'credits': karma['credits'],
                'metrics': {
                    'reportedCount': karma['reported_count'],
                    'returnedCount': karma['returned_count'],
                    'successRate': karma['success_rate'],
                    'trustScore': karma['trust_score']
                },
                'perks': perks,
                'transactions': [{
                    'id': t['id'],
                    'title': t['title'],
                    'location': t['location'],
                    'points': t['points'],
                    'type': t['type'],
                    'date': t['date'],
                    'refId': t['ref_id']
                } for t in txs]
            })

        if clean_path == '/api/perks':
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            perks = [dict(row) for row in c.execute('SELECT * FROM perks').fetchall()]
            conn.close()
            return self.send_json(200, {'perks': perks})

        # Static Page Route Rewrites
        if clean_path in ['', '/lost', '/lost-item']:
            self.path = '/index.html'
        elif clean_path in ['/my-posts', '/posts']:
            self.path = '/my-posts.html'
        elif clean_path in ['/profile', '/student-profile', '/rewards']:
            self.path = '/profile.html'
        elif clean_path.startswith('/lost/'):
            self.path = '/index.html'
        return super().do_GET()

    def do_PUT(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path == '/api/profile':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))
            
            initials = body.get('name', 'PS').split(' ')
            avatar_initials = (initials[0][0] + (initials[1][0] if len(initials) > 1 else '')).upper()

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('''
                UPDATE student SET
                    name = ?, reg_no = ?, roll_no = ?, course = ?,
                    section = ?, semester = ?, residence = ?,
                    email = ?, phone = ?, avatar_initials = ?
                WHERE id = "std_01"
            ''', (
                body.get('name'), body.get('regNo'), body.get('rollNo'), body.get('course'),
                body.get('section'), body.get('semester'), body.get('residence'),
                body.get('email'), body.get('phone'), avatar_initials
            ))
            conn.commit()
            conn.close()
            return self.send_json(200, {'status': 'success', 'message': 'Profile updated in database'})
        return self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        
        # Redeem perk endpoint
        if clean_path == '/api/perks/redeem':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))
            perk_id = body.get('perkId')

            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            perk = c.execute('SELECT * FROM perks WHERE id = ?', (perk_id,)).fetchone()
            karma = c.execute('SELECT credits FROM karma WHERE id = "std_01"').fetchone()

            if not perk:
                conn.close()
                return self.send_json(404, {'error': 'Perk not found'})

            if karma['credits'] < perk['points']:
                conn.close()
                return self.send_json(400, {'error': 'Insufficient karma credits'})

            import random
            voucher = f"LPU-{random.randint(1000, 9999)}-{perk['points']}"
            new_credits = karma['credits'] - perk['points']

            c.execute('UPDATE karma SET credits = ? WHERE id = "std_01"', (new_credits,))
            tx_id = f"tx_{int(time.time()*1000)}"
            c.execute('''
                INSERT INTO transactions (id, title, location, points, type, date, ref_id, created_at)
                VALUES (?, ?, ?, ?, 'REDEEM', 'Just now', ?, ?)
            ''', (tx_id, f"Redeemed {perk['title']}", perk['category'], perk['points'], voucher, time.time()))
            conn.commit()
            conn.close()

            return self.send_json(200, {
                'status': 'success',
                'voucherCode': voucher,
                'remainingCredits': new_credits,
                'transaction': {
                    'id': tx_id,
                    'title': f"Redeemed {perk['title']}",
                    'location': perk['category'],
                    'points': perk['points'],
                    'type': 'REDEEM',
                    'date': 'Just now',
                    'refId': voucher
                }
            })

        # Add / award credits endpoint
        if clean_path == '/api/credits/add':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))
            pts = int(body.get('points', 50))
            title = body.get('title', 'Reported item reward')
            location = body.get('location', 'Campus')
            ref_id = body.get('refId', f"POST-{random.randint(1000, 9999)}")

            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            karma = c.execute('SELECT credits, returned_count FROM karma WHERE id = "std_01"').fetchone()
            new_credits = karma['credits'] + pts
            c.execute('UPDATE karma SET credits = ?, returned_count = ? WHERE id = "std_01"', (new_credits, karma['returned_count'] + 1))
            
            tx_id = f"tx_{int(time.time()*1000)}"
            c.execute('''
                INSERT INTO transactions (id, title, location, points, type, date, ref_id, created_at)
                VALUES (?, ?, ?, ?, 'EARN', 'Just now', ?, ?)
            ''', (tx_id, title, location, pts, ref_id, time.time()))
            conn.commit()
            conn.close()

            return self.send_json(200, {
                'status': 'success',
                'newCredits': new_credits,
                'pointsAwarded': pts
            })

        return self.send_json(404, {'error': 'Endpoint not found'})

if __name__ == '__main__':
    init_db()
    handler_class = functools.partial(CustomHandler, directory=DIRECTORY)
    port = int(os.environ.get('PORT', 3000))
    
    server = None
    for p in [port, 8080, 8000, 5000]:
        try:
            server = http.server.ThreadingHTTPServer(('0.0.0.0', p), handler_class)
            print(f"==================================================")
            print(f"🚀 LPU FIND Backend & Frontend Server is LIVE!")
            print(f"🌐 Home & Search:     http://localhost:{p}/")
            print(f"👤 Student Profile:   http://localhost:{p}/profile")
            print(f"📦 My Posts:          http://localhost:{p}/my-posts")
            print(f"🔌 REST API Profile:  http://localhost:{p}/api/profile")
            print(f"==================================================")
            sys.stdout.flush()
            server.serve_forever()
            break
        except Exception as e:
            continue

    if not server:
        print("Error: Could not bind server to any candidate port.")
        sys.stdout.flush()

