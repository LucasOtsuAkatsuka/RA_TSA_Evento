# Tour em Realidade Aumentada — WebAR com MindAR + A-Frame

Aplicação WebAR 100% gratuita, sem marca d'água, hospedável no GitHub Pages / Netlify / Vercel.  
Detecta até 4 imagens-alvo diferentes e abre um vídeo em modal fixo para cada uma.

---

## Estrutura de arquivos

```
webar-tour/
│
├── index.html          ← Página principal + cena A-Frame/MindAR
├── style.css           ← Estilos da splash, dica AR e modal de vídeo
├── script.js           ← Lógica de detecção, abertura/fechamento do modal
│
├── targets/
│   ├── target_01.png   ← Imagem-alvo da Estação 01 (você fornece)
│   ├── target_02.png   ← Imagem-alvo da Estação 02 (você fornece)
│   ├── target_03.png   ← Imagem-alvo da Estação 03 (você fornece)
│   ├── target_04.png   ← Imagem-alvo da Estação 04 (você fornece)
│   └── targets.mind    ← Gerado pelo compilador MindAR (veja abaixo)
│
└── videos/
    ├── video_01.mp4    ← Vídeo da Estação 01 (você fornece)
    ├── video_02.mp4    ← Vídeo da Estação 02 (você fornece)
    ├── video_03.mp4    ← Vídeo da Estação 03 (você fornece)
    └── video_04.mp4    ← Vídeo da Estação 04 (você fornece)
```

---

## 1. Onde editar títulos, vídeos e links

Abra **`script.js`** e localize o array `targetsData` no início do arquivo:

```js
const targetsData = [
  {
    title: 'Estação 01',                    // ← Nome exibido no modal
    video: 'videos/video_01.mp4',           // ← Caminho do vídeo
    link:  'https://exemplo.com/video-01'   // ← Link do botão "Ver depois"
  },
  // ... demais estações
];
```

Troque os valores conforme necessário. A ordem deve ser igual à usada ao compilar o `targets.mind`.

---

## 2. Gerar o arquivo `targets.mind`

O `targets.mind` é o modelo de rastreamento que o MindAR usa para reconhecer as imagens-alvo.  
Ele deve ser gerado **uma única vez** (ou sempre que as imagens mudarem).

### Usando o compilador online (mais fácil)

1. Acesse: **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
2. Clique em **"Upload Images"** e selecione as 4 imagens na **ordem correta**:
   - `target_01.png` → targetIndex **0**
   - `target_02.png` → targetIndex **1**
   - `target_03.png` → targetIndex **2**
   - `target_04.png` → targetIndex **3**
3. Aguarde o processamento (pode levar alguns segundos).
4. Clique em **"Export"** → salve o arquivo como `targets.mind`.
5. Coloque o arquivo na pasta `targets/`.

### Dicas para melhores imagens-alvo

- Prefira imagens com **alto contraste** e **muitos detalhes únicos** (fotos, arte, logos complexos).
- Evite imagens uniformes, com pouca textura ou com muita simetria.
- Tamanho mínimo recomendado: **300 × 300 px**.
- O compilador exibe uma pontuação de rastreamento; busque valores **acima de 70**.

---

## 3. Rodar localmente (servidor local)

A câmera do celular exige **HTTPS** (ou `localhost`). Para testar localmente:

### Opção A — Node.js (recomendado)

```bash
# Instale o servidor local (uma vez):
npm install -g live-server

# Dentro da pasta do projeto:
live-server --port=8080
```

Acesse `http://localhost:8080` no navegador.

### Opção B — Python

```bash
# Python 3:
python -m http.server 8080

# Python 2:
python -m SimpleHTTPServer 8080
```

Acesse `http://localhost:8080`.

### Opção C — VS Code

Instale a extensão **Live Server** e clique em "Go Live" na barra de status.

### Testar no celular pela rede local

1. Descubra o IP da sua máquina (ex: `192.168.1.10`).
2. Acesse `http://192.168.1.10:8080` no celular — **não** `localhost`.
3. Atenção: muitos celulares **bloqueiam câmera em HTTP** fora do localhost.  
   Use [ngrok](https://ngrok.com/) para expor com HTTPS temporariamente:

```bash
ngrok http 8080
# O ngrok fornece uma URL https://xxxx.ngrok.io
```

---

## 4. Publicar no GitHub Pages

1. Faça upload de todos os arquivos (incluindo `targets/targets.mind` e `videos/`) para um repositório GitHub.
2. No repositório, vá em **Settings → Pages**.
3. Em "Source", selecione **"Deploy from a branch"** → `main` → `/ (root)`.
4. Aguarde o deploy (≈ 1–2 min). A URL será algo como:  
   `https://seu-usuario.github.io/nome-do-repositorio/`

> **Atenção:** O GitHub Pages tem limite de 100 MB por arquivo e 1 GB por repositório.  
> Se os vídeos forem grandes, hospede-os em outro serviço (ex: Cloudflare R2, Bunny CDN) e  
> atualize os caminhos em `script.js`.

---

## 5. Publicar no Netlify

1. Acesse [app.netlify.com](https://app.netlify.com) e faça login.
2. Arraste a **pasta inteira do projeto** para a área de drop da Netlify.
3. A Netlify faz o deploy automaticamente e fornece uma URL HTTPS.
4. Para atualizações futuras, conecte ao GitHub para deploys automáticos.

---

## 6. Publicar no Vercel

```bash
npm install -g vercel
vercel
```

Siga as instruções do CLI. O Vercel detecta sites estáticos automaticamente.

---

## 7. Gerar o QR Code para o site

Após publicar, gere um QR Code com a URL do seu site em qualquer gerador gratuito:

- https://qr-code-generator.com
- https://www.qrcode-monkey.com
- Ou busque "QR code generator" no Google

O QR Code serve **apenas para abrir o site**. Uma vez aberto, tudo acontece dentro da mesma página.

---

## 8. Requisito obrigatório: HTTPS

**A câmera não funciona sem HTTPS** (exceto em `localhost`).

| Ambiente              | HTTPS automático? |
|-----------------------|:-----------------:|
| GitHub Pages          | ✅ Sim            |
| Netlify               | ✅ Sim            |
| Vercel                | ✅ Sim            |
| Cloudflare Pages      | ✅ Sim            |
| `localhost`           | ✅ Sim (exceção)  |
| IP local (`192.168.x`)| ❌ Não — use ngrok|

---

## 9. Adicionar mais alvos (além de 4)

1. **`script.js`** — adicione um objeto ao array `targetsData`:
   ```js
   { title: 'Estação 05', video: 'videos/video_05.mp4', link: 'https://...' }
   ```

2. **`index.html`** — adicione um novo `<a-entity>` dentro de `<a-scene>`:
   ```html
   <a-entity id="target-4" mindar-image-target="targetIndex: 4"></a-entity>
   ```

3. **`targets/`** — adicione a nova imagem (`target_05.png`) e recompile o `targets.mind` incluindo todas as imagens na ordem correta.

---

## 10. Compatibilidade

| Plataforma          | Suporte |
|---------------------|:-------:|
| Android (Chrome)    | ✅      |
| iOS 15+ (Safari)    | ✅      |
| iOS (Chrome/Firefox)| ⚠️ Limitado — use Safari no iOS |
| Desktop (Chrome)    | ✅ (para testes) |

---

## Tecnologias utilizadas

- [A-Frame](https://aframe.io) `1.4.2` — motor de cenas WebXR
- [MindAR](https://hiukim.github.io/mind-ar-js-doc/) `1.2.5` — rastreamento de imagens
- HTML5, CSS3, JavaScript puro
- Sem React, sem backend, sem plataformas pagas
