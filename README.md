# طوقی | Toughi

بازار لوکس خرید و فروش پرندگان و حیوانات خانگی — ساخته‌شده با Next.js 16، PostgreSQL، Drizzle ORM و Tailwind CSS v4.

## امکانات

- ۶۰+ آگهی واقعی در ۲۰ دسته‌بندی تخصصی (پرندگان، حیوانات خانگی، قفس و تجهیزات)
- جستجو و فیلتر پیشرفته: گونه، شهر، بازه قیمت، قابل مذاکره، مرتب‌سازی
- ورود با OTP پیامکی (بدون رمز عبور) — در نسخه‌ی نمایشی کد داخل خود صفحه نمایش داده می‌شود
- ثبت آگهی چندمرحله‌ای با آپلود عکس (تا ۸ عکس) یا لینک مستقیم
- نشان‌کردن (علاقه‌مندی‌ها)، چت داخلی زنده بین خریدار و فروشنده
- نمایش شماره تماس فقط پس از ورود
- داشبورد فروشنده: نرده (بازگشت به صدر نتایج)، تغییر وضعیت، حذف آگهی
- شمارنده بازدید، آگهی‌های نشان‌دار، آگهی‌های مشابه
- فروشندگان احرازشده با نماد طلایی
- راهنمای امن معامله در مسیر `/guide`
- **PWA کامل با حالت آفلاین:** مانیفست نصب‌شدنی (`/manifest.webmanifest`)، Service Worker (`/sw.js`) با کش هوشمند صفحات بازدیدشده، تصاوير Pexels و باندل‌های استاتیک، و صفحه‌ی آفلاین سفارشی (`/offline`) — بدون اینترنت هم صفحات ذخیره‌شده باز می‌شوند. سرویس‌ورکر فقط در محیط پروداکشن فعال می‌شود.

## پنل مدیریت (CMS زنده)

با شماره‌ای که در `ADMIN_PHONES` تعریف شده (پیش‌فرض: `09121112233`) وارد شو → لینک «پنل مدیریت» در منوی کاربر ظاهر می‌شود و مسیر `/admin` باز می‌کند:

| تب | چه چیزی را ویرایش می‌کند |
|---|---|
| تنظیمات سایت | عنوان و توضیحات سئو، متن دربارهٔ فوتر، تلفن/ایمیل پشتیبانی، قانون طلایی راهنما |
| ویرایش آگهی‌ها | عنوان، قیمت، عکس اصلی، وضعیت (فعال/فروخته‌شد/پنهان)، «نشان‌دار»، نرده و حذف هر آگهی — لحظه‌ای |
| هیرو و مارکی | عنوان (+هایلایت طلایی با \|متن\|)، زیرعنوان، عکس هیرو، بج، چیپ‌های جستجو، سوییچ نمایش هر ماژول، آیتم‌های نوار متحرک |
| چرا طوقی + CTA | چهار کارت اعتماد (عنوان/متن/آیکون)، باکس ثبت آگهی (متن + عکس) |
| فوتر | متن معرفی و لینک‌های «جستجوهای داغ» |
| راهنما | قانون طلایی، مراحل امن معامله، لیست‌های «حتماً انجام بده / هرگز انجام نده» |

نکته‌های مهم:
- هر تغییر با `revalidatePath` بلافاصله روی کل سایت اعمال می‌شود.
- در عنوان‌ها، بخش‌هایی که بین `|` قرار بگیرند با گرادیان طلایی نمایش داده می‌شوند (مثلاً: `زندگی‌ات را |با افتخار| انتخاب کن`).
- آپلود عکس از فیلد تصویر پنل هم کار می‌کند (مسیر `/api/upload` — فایل‌ها در `public/uploads` ذخیره می‌شوند).
- برای مدیران بیشتر: شماره را با کاما به متغیر محیطی `ADMIN_PHONES` اضافه کن یا ستون `role` را در دیتابیس `admin` کن.

## اجرای محلی

```bash
npm install
cp .env.example .env     # مقدار DATABASE_URL را بگذار
npx drizzle-kit push      # ساخت جداول
npx tsx scripts/seed.ts   # دیتای اولیه (۸ کاربر + ۶۰ آگهی + ۱۶ شهر)
npm run dev
```

سپس برای نسخه‌ی محصول:

```bash
npm run build
npm start
```

## استقرار کامل روی سرور شخصی + کلودفلر (قدم‌به‌قدم)

### الف) آماده‌سازی سرور (Ubuntu 22.04 / 24.04)

```bash
# ۱) آپدیت و نصب پیش‌نیازها
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# ۲) ساخت دیتابیس
sudo -u postgres psql -c "CREATE USER toughi WITH PASSWORD 'یک_رمز_قوی_اینجا';"
sudo -u postgres psql -c "CREATE DATABASE app_db OWNER toughi;"

# ۳) کلون و نصب پروژه
cd /var/www && git clone <آدرس-ریپوی-تو> toughi && cd toughi
npm install
```

### ب) فایل محیطی `.env`

```env
DATABASE_URL="postgresql://toughi:یک_رمز_قوی_اینجا@127.0.0.1:5432/app_db"
ADMIN_PHONES="09121112233"
```

### ج) ساخت جداول + دیتای اولیه + بیلد

```bash
npx drizzle-kit push        # ساخت تمام جداول (کاربران، آگهی‌ها، چت، CMS)
npx tsx scripts/seed.ts     # ۸ کاربر نمونه + ۶۰ آگهی واقعی + ۲۰ دسته‌بندی + ۱۶ شهر
                                 # اگر می‌خواهی شروع خالی داشته باشی، این خط را حذف کن و بعداً
                                 # فقط یک بار 'psql ... UPDATE users SET role=admin WHERE phone=...' را بزن
npm run build               # بیلد پروداکشن حدود ۱۵ ثانیه
```

### د) اجرای دائمی با PM2

```bash
sudo npm i -g pm2
pm2 start npm --name toughi -- start
pm2 save
pm2 startup                 # دستوری که می‌دهد را کپی و اجرا کن (اجرا خودکار بعد از ریبوت)
pm2 monit                   # مانیتورینگ لحظه‌ای
```

### ه) اتصال کلودفلر — دو روش

**روش ۱ (پیشنهادی): Cloudflare Tunnel — بدون باز کردن پورت و بدون نمایش IP واقعی**

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared tunnel login                # لینکی می‌دهد؛ در مرورگر باز کن و دامنه‌ات را انتخاب کن
cloudflared tunnel create toughi
sudo tee /etc/cloudflared/config.yml <<EOF
tunnel: <TUNNEL_ID_که_داد>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: toughi.ir
    service: http://localhost:3000
  - hostname: www.toughi.ir
    service: http://localhost:3000
  - service: http_status:404
EOF
cloudflared tunnel route dns toughi toughi.ir
cloudflared tunnel route dns toughi www.toughi.ir
sudo cloudflared service install
sudo systemctl start cloudflared
```

**روش ۲: DNS پروکسی کلودفلر + NGINX**

1. در داشبورد کلودفلر دو رکورد `A` بساز: `@` → IP سرور و `www` → IP سرور (هر دو Proxied — ابر نارنجی)
2. SSL/TLS را روی **Full (strict)** بگذار
3. NGINX را کانفیگ کن:

```nginx
server {
    listen 80;
    server_name toughi.ir www.toughi.ir;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/toughi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d toughi.ir -d www.toughi.ir    # HTTPS رایگان
```

### و) تنظیمات بهینه کلودفلر (در داشبورد)

| تنظیم | مقدار پیشنهادی | دلیل |
|---|---|---|
| SSL/TLS Mode | Full (strict) | امن از کاربر تا سرور |
| Always Use HTTPS | فعال | هدایت خودکار به HTTPS |
| Caching: Rules → `/api/*` | Bypass Cache | APIها (چت، ورود) هرگز کش نشوند |
| Caching: Rules → `/uploads/*` | Cache, 7 days TTL | عکس‌های آگهی‌ها سریع لود شوند |
| Speed → Minify (JS/CSS/HTML) | فعال | حجم صفحه کمتر |
| Security → WAF + Rate Limit | ~100 req/min/IP | محافظت از فرم‌های ورود |
| Under Attack Mode | فقط هنگام حمله | چالش کلودفلر برای بات‌ها |

نکته: Service Worker سایت (PWA) با کلودفلر سازگار است؛ `sw.js` را هم کلودفلر پاس می‌دهد.

### ز) نگهداری

```bash
# بکاپ روزانه دیتابیس (کرون‌جاب)
0 3 * * * pg_dump postgresql://toughi:PASS@127.0.0.1:5432/app_db | gzip > /backups/toughi-$(date +\%F).sql.gz

# بکاپ عکس‌های آپلودی
rsync -avz /var/www/toughi/public/uploads/ root@backup-server:/backups/toughi-uploads/

# آپدیت سایت
cd /var/www/toughi && git pull && npm install && npm run build && pm2 restart toughi
```

## ساختار پروژه

```
src/
├── app/                 # صفحات و API Route‌ها (App Router)
│   ├── api/             # auth، listings، favorites، chats، upload
│   ├── explore/         # کاوش آگهی‌ها با فیلتر
│   ├── ad/[id]/         # صفحه‌ی جزئیات آگهی
│   ├── new/             # ویزارد ثبت آگهی
│   └── ...              # my-ads/ favorites/ chats/ guide/ auth
├── components/          # کامپوننت‌های UI (سرور و کلاینت)
├── db/                  # کانکشن و اسکیمای Drizzle
└── lib/                 # auth، کوئری‌ها، ابزار فارسی (Digits، تومان، time-ago)
scripts/seed.ts          # دیتای اولیه‌ی واقع‌گرایانه
```
