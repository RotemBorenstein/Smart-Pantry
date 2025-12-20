# Smart Pantry - מזווה חכם

מערכת ניהול מזווה חכמה ואינטרקטיבית עם AI

## תכונות

- 🔐 **התחברות והרשמה** - מערכת אימות מלאה עם Supabase Auth
- 👤 **פרופיל משתמש** - הגדרות אישיות, הרגלי אכילה, תדירות קניות
- 🏠 **עמוד ראשי** - דשבורד מרכזי עם גישה מהירה לכל התכונות
- 🛒 **יציאה לקניות** - יצירת רשימות קניות חכמות עם המלצות
- 🛍️ **אני בקניות** - מעקב בזמן אמת במהלך הקנייה
- 📄 **חזרה מקניות** - סריקת קבלות ועדכון אוטומטי של המזווה
- 📦 **מזווה** - ניהול מלאי עם מדדים ויזואליים
- 📊 **הרגלים** - מעקב אחר העדפות ואירועים מיוחדים
- 💰 **רווחיות** - ניתוחים וגרפים של הוצאות

## טכנולוגיות

### Backend
- FastAPI - API server
- Supabase - Database & Authentication
- PostgreSQL - Database

### Frontend
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Recharts - Data visualization
- Zustand - State management

## התקנה

### 1. התקנת תלויות Backend

```bash
pip install -r requirements.txt
```

### 2. התקנת תלויות Frontend

```bash
npm install in  smart-pantry-new 
```

### 3. הגדרת משתני סביבה

צור קובץ `.env.local` בתיקיית השורש:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

צור קובץ `.env` בתיקיית השורש עבור Backend:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. הרצת השרתים

**Backend:**
```bash
uvicorn app.main:app --reload
```

**Frontend:**
```bash
npm run dev
```

האפליקציה תהיה זמינה ב:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## מבנה הפרויקט

```
Smart-Pantry/
├── app/                    # Backend (FastAPI)
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   ├── schemas/           # Pydantic models
│   └── main.py            # FastAPI app
├── src/                   # Frontend (Next.js)
│   ├── app/               # Pages & routes
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   └── store/             # State management
├── data_scheme.sql        # Database schema
└── requirements.txt       # Python dependencies
```

## API Endpoints

### Products
- `GET /api/v1/products` - קבלת כל המוצרים
- `POST /api/v1/products` - יצירת מוצר חדש
- `PUT /api/v1/products/{id}` - עדכון מוצר
- `DELETE /api/v1/products/{id}` - מחיקת מוצר

### Inventory
- `GET /api/v1/inventory?user_id={uuid}` - קבלת מלאי המשתמש
- `POST /api/v1/inventory?user_id={uuid}` - עדכון/יצירת פריט במלאי
- `PUT /api/v1/inventory/{product_id}?user_id={uuid}` - עדכון פריט

### Shopping Lists
- `GET /api/v1/shopping-lists?user_id={uuid}` - קבלת רשימות קניות
- `POST /api/v1/shopping-lists?user_id={uuid}` - יצירת רשימה חדשה
- `POST /api/v1/shopping-lists/{id}/items` - הוספת פריט לרשימה

### Receipts
- `GET /api/v1/receipts?user_id={uuid}` - קבלת קבלות
- `POST /api/v1/receipts?user_id={uuid}` - יצירת קבלה חדשה

## תכונות AI (מתוכננות)

המערכת תלמד את ההרגלים שלך:
- קצב צריכה של מוצרים
- ימים בשבוע של צריכה מוגברת
- סגנון קניות אישי
- החלטות חוזרות

תקשורת טבעית:
- "שמתי לב שהקפה נגמר מהר ב-30% מהרגיל..."
- "הסרתי שוב חטיפים כי הסרת אותם 4 שבועות ברצף..."
- "יש סתירה קטנה: קנית 2 יח' אבל זה נגמר מהר מהצפוי..."

## פיתוח

### הוספת עמוד חדש

1. צור קובץ ב-`src/app/[route]/page.tsx`
2. השתמש ב-`DashboardLayout` לעמודי dashboard
3. השתמש ב-`useAuthStore` לניהול אימות

### הוספת API endpoint

1. צור route ב-`app/api/[resource].py`
2. הוסף service ב-`app/services/[resource]_service.py`
3. הוסף schema ב-`app/schemas/[resource].py`

## רישיון

MIT
