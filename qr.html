<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR-генератор с логотипом</title>
    <style>
        :root {
            --bg: #0f1724;
            --card: #0b1220;
            --muted: #9aa4b2;
            --accent: #06b6d4;
        }
        body {
            font-family: 'Inter', system-ui;
            margin: 0;
            background: var(--bg);
            color: #e6eef6;
            min-height: 100vh;
            padding: 24px;
            display: flex;
            justify-content: center;
        }
        .app {
            width: 100%;
            max-width: 900px;
        }
        input, select {
            padding: 8px 10px;
            border-radius: 8px;
            background: #0002;
            border: 1px solid #fff1;
            color: white;
            width: 100%;
        }
        .card {
            background: #ffffff06;
            padding: 18px;
            border-radius: 12px;
            margin-top: 16px;
        }
        .btn {
            background: var(--accent);
            color: #031b22;
            padding: 10px 14px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            margin: 0 5px;
        }
        canvas {
            background: white;
            border-radius: 8px;
            max-width: 100%;
        }
        .logo-preview {
            display: none;
            margin-top: 10px;
            text-align: center;
        }
        .logo-preview img {
            max-width: 100px;
            max-height: 100px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="app">
        <h1>QR-генератор с логотипом</h1>
        <div class="card">
            <label>Текст или ссылка</label>
            <input id="text" placeholder="https://example.com" value="https://example.com" />
            
            <label style="margin-top:10px">Загрузка логотипа (PNG/JPEG)</label>
            <input id="logo" type="file" accept="image/*" />
            <div class="logo-preview" id="logoPreview">
                <p>Предварительный просмотр логотипа:</p>
                <img id="previewImg" src="" alt="Preview" />
            </div>
            
            <label style="margin-top:10px">Размер QR</label>
            <input id="size" type="number" value="300" min="200" max="800" />
            
            <div style="margin-top:15px; text-align:center">
                <button class="btn" id="generate">Сгенерировать</button>
                <button class="btn" id="saveSvg">Скачать SVG</button>
                <button class="btn" id="savePng">Скачать PNG</button>
            </div>
        </div>
        
        <div class="card" style="text-align:center">
            <canvas id="qr" width="300" height="300"></canvas>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        const canvas = document.getElementById('qr');
        const ctx = canvas.getContext('2d');
        let logoImg = null;

        // Обработка загрузки логотипа
        document.getElementById('logo').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoImg = new Image();
                    logoImg.onload = function() {
                        // Показываем превью логотипа
                        const preview = document.getElementById('previewImg');
                        preview.src = event.target.result;
                        document.getElementById('logoPreview').style.display = 'block';
                    };
                    logoImg.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Генерация QR-кода
        async function generateQR() {
            const text = document.getElementById('text').value;
            const size = Number(document.getElementById('size').value) || 300;
            
            if (!text) {
                alert('Пожалуйста, введите текст или ссылку');
                return;
            }
            
            canvas.width = size;
            canvas.height = size;
            
            const qrOptions = {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: size,
                color: { dark: '#000000', light: '#ffffff' }
            };
            
            try {
                await QRCode.toCanvas(canvas, text, qrOptions);
                
                // Добавление логотипа, если загружен
                if (logoImg) {
                    const logoSize = size * 0.22;
                    const x = (size - logoSize) / 2;
                    const y = (size - logoSize) / 2;
                    
                    // Создаем белый фон для логотипа
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Рисуем логотип
                    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                }
            } catch (error) {
                console.error('Ошибка генерации QR:', error);
                alert('Ошибка при генерации QR-кода');
            }
        }

        // Сохранение PNG
        document.getElementById('savePng').onclick = () => {
            if (!document.getElementById('text').value) {
                alert('Сначала сгенерируйте QR-код');
                return;
            }
            const link = document.createElement('a');
            link.download = 'qr_with_logo.png';
            link.href = canvas.toDataURL();
            link.click();
        };

        // Генерация SVG (без логотипа, так как это требует сложной интеграции)
        document.getElementById('saveSvg').onclick = async () => {
            const text = document.getElementById('text').value;
            if (!text) {
                alert('Пожалуйста, введите текст или ссылку');
                return;
            }
            
            try {
                const svg = await QRCode.toString(text, { 
                    type: 'svg',
                    errorCorrectionLevel: 'H',
                    margin: 1
                });
                
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qr_code.svg';
                a.click();
            } catch (error) {
                console.error('Ошибка экспорта SVG:', error);
                alert('Ошибка при создании SVG');
            }
        };

        // Обработчик кнопки генерации
        document.getElementById('generate').onclick = generateQR;

        // Генерация по умолчанию при загрузке
        window.onload = generateQR;
    </script>
</body>
</html>
