# Demo Çalışma Notları — 4 Kişi Birlikte Pratik

**Amaç**: KISA_DEMO.md'yi destekleyen pratik materyali. Her kişi kendi kartını ezberler, sonra birlikte 2 tam tur prova yaparsınız.

**Plan**: 
1. Herkes kendi kartını okur, 5 dakika ezberler (rakamlar + cümle yapıları)
2. Birinci tur prova — kimse yardım etmesin, sırayla konuş
3. İkinci tur prova — tek tek aksaklıkları düzelt
4. Cross-quiz (birbirinize başka birinin kartından soru sorun, bilmediğin alanı duy)

---

## 📋 EZBERLENECEK 8 ANAHTAR RAKAM

Bütün ekip bilmeli. Demoda biri sorulursa kim cevaplarsa cevaplasın hata çıkmasın:

| Rakam | Anlamı |
|---|---|
| **52** | berlin52'deki şehir sayısı |
| **7542** | berlin52 bilinen optimum |
| **8 × 10⁶⁶** | 52 şehir için olası tur sayısı (51!/2) |
| **%7.4** | Default parametrelerle bulduğumuz gap |
| **%9.3** | Inversion mutation gap (en iyi mutation) |
| **%20** / **%22** | Swap / Scramble gap (kötü mutationlar) |
| **%74** | Roulette selection gap (felaket) |
| **10 tohum × 6 suite × 6 ortalama** | Toplam ~360 GA koşturma |

**Hızlı test**: "Inversion ile gap kaç?" → "9.3" cevabı 1 saniyede gelmeli.

---

## 🎤 1. EMRE — Hangi konuyu seçtik? (1.5 dk)

### Ezberlenecek 5 nokta

1. **Problem**: 52 şehri her birini bir kez ziyaret ederek en kısa turla gezme
2. **Neden zor**: 51!/2 ≈ 8×10⁶⁶ olası tur, brute force ölü
3. **Sınıflandırma**: NP-hard
4. **Çözüm tipi**: Metaheuristic → Genetik Algoritma
5. **Neden TSP**: Klasik benchmark, optimumu bilinen (TSPLIB), görsel doğrulanabilir

### Açılış cümlesi (kelime kelime ezberle)

> "Selam, biz Emre, Anıl, Mustafa ve Meriç. Projemiz Gezgin Satıcı Problemi'ne Genetik Algoritma uygulaması."

### Anahtar geçiş cümlesi

> "Şimdi Anıl neyi test etmek istediğimizi anlatacak."

### Sana sorulabilecek sorular

- **"Neden TSP, başka NP-hard problem yok mu?"**
  → "TSP'nin avantajı görsel — sonucu ekranda göriyorsunuz. Plus TSPLIB sayesinde bilinen optimum var, performansımızı ölçebiliyoruz."

- **"NP-hard ne demek?"**
  → "Polinom zamanda kesin çözümü olmadığı düşünülen problem sınıfı. Yani şehir sayısı arttıkça çözüm süresi exponential büyür."

- **"Genetik Algoritma yerine başka şey kullanabilir miydiniz?"**
  → "Evet, Particle Swarm, Simulated Annealing, Ant Colony. Biz GA seçtik çünkü permütasyon temsili doğal (her birey bir tur), ve operatörlerini sistematik olarak karşılaştırmak istedik."

### Yaygın hata — DİKKAT

- ❌ "TSP'yi çözdük" deme — **çözmedik**, yaklaşık çözüm bulduk (%7.4 sapma)
- ❌ "8 üzeri 66" deme — **8 çarpı 10 üzeri 66**
- ❌ Start butonuna basma — **o iş Mustafa'nın**

---

## 🎤 2. ANIL — Neleri test etmeyi amaçladık? (1.5 dk)

### Ezberlenecek 4 araştırma sorusu

1. **Hangi mutation daha iyi?** → swap / inversion / scramble
2. **Hangi crossover daha iyi?** → OX1 / PMX
3. **Hangi selection daha iyi?** → tournament / roulette / rank
4. **Mutation rate ve popülasyon büyüklüğü ne kadar belirleyici?**

### Hipotezimiz (TEK CÜMLE — ezberle)

> "Operatör seçimi, ince ayar parametrelerinden daha belirleyicidir."

### Operatör tanımları (her birini 5 saniyede tarif et)

- **swap**: İki rastgele şehri yer değiştir
- **inversion**: İki nokta arasındaki diziyi tersine çevir → aslında 2-opt
- **scramble**: İki nokta arasındaki diziyi karıştır
- **OX1**: Bir parça parent1'den kopyala, gerisi parent2'nin sırasıyla doldur
- **PMX**: Bir parça kopyala, çakışan genleri eşle
- **Tournament**: k rastgele aday → en iyisini al
- **Roulette**: Fitness'le orantılı olasılık
- **Rank**: Sıralamayla orantılı olasılık

### Açılış cümlesi

> "Genetik Algoritma'da onlarca operatör var. Biri için en iyisi diğeri için kötü olabilir. Biz dört soruya cevap arıyorduk:"

### Anahtar geçiş cümlesi

> "Hipotezimiz operatör seçiminin parametre tuninginden önemli olduğuydu. Şimdi nasıl test ettiğimize Mustafa geçecek."

### Sana sorulabilecek sorular

- **"Inversion neden 2-opt?"**
  → "Çünkü tek inversion bir aralığı tersine çevirir, bu da turdaki 2 kenarı kırıp 2 yenisini bağlar — tipik 2-opt hareketi."

- **"OX1 ve PMX arasında ne fark var?"**
  → "OX1 sıra (order) korur — yani şehirlerin birbirine göre sıralaması. PMX konum (position) korur — yani belli pozisyondaki şehirler. TSP'de adjacency önemli olduğu için OX1 teorik olarak daha uygun."

- **"Tournament neden roulette'tan iyi?"**
  → "Tournament fitness skalasından bağımsız. Fitness değerleri birbirine yakınlaşsa bile tournament her zaman en iyiyi seçer. Roulette ise yakınlaşınca seçim baskısını kaybeder."

### Yaygın hata — DİKKAT

- ❌ "Mutation operatör" deme — **mutation oranı (rate)** ile **mutation operatörü** farklı şeyler!
- ❌ Bütün operatörleri açıklamaya çalışma — sadece **isim + 1 cümle**, derin teknik anlatma
- ❌ "Crossover daha önemli" deme — bizim bulgumuza göre **selection > mutation > crossover**

---

## 🎤 3. MUSTAFA — Nasıl test ettik? (1.5 dk)

### Bu kısım canlı demo — somut tıklama sırası

**Şu sırayla yap, tek tek:**

1. (Konuşurken) "Şimdi default parametrelerle çalıştırıyorum:"
2. **Start butonuna tıkla**
3. 3 saniye bekle (GA otomatik biter)
4. (Tablo ve rotayı göstererek) "500 jenerasyon bitti, gap %7.4."
5. (Konuşurken) "Ama bir koşturma yeterli değil — stokastik bir algoritma."
6. **Sağ üstteki "Experiments →" linkine tıkla**
7. (Konuşurken) "Bu sayfa her konfigürasyonu 5 farklı tohumla çalıştırıyor."
8. **"Mutation operator" suite'inde Run butonuna tıkla**
9. 3 saniye bekle
10. (Tabloyu göstererek) "İşte sonuç. Bulgular için sıra Meriç'te."

### Ezberlenecek anahtar rakamlar (Mustafa'nın söyleyeceği)

- Default: **200 popülasyon, 500 jenerasyon, mutation rate 0.2, crossover rate 0.9**
- Optimum **7542** vs bizim sonuç **~8100** → **gap %7.4**
- Tarayıcıda **5 tohum**, headless'ta **10 tohum**
- Toplam **6 suite × 10 tohum × ~6 variant ≈ 360 koşturma**

### Açılış cümlesi

> "İki şey yaptık — biri görsel, biri sayısal."

### Anahtar geçiş cümlesi

> "Bulgular için sıra Meriç'te."

### Sana sorulabilecek sorular

- **"Niye 10 tohum, 100 tohum daha sağlam olmaz mıydı?"**
  → "Olurdu ama hesap bütçesi sınırlı. 10 tohumla standart sapmaları hesapladık, yorumlama için yeterli."

- **"Tarayıcıda Python yerine TypeScript niye?"**
  → "Backend gerek yok — tek `npm run dev` ile çalışıyor. TypeScript'in typed array'leri Python NumPy'a yakın performans veriyor."

- **"Stokastik algoritma ne demek?"**
  → "Rastgelelik içeren. Aynı parametrelerle her koşturma farklı sonuç verebilir. Bu yüzden birden çok tohumla ortalama alırız."

### Yaygın hata — DİKKAT

- ❌ **Start'a basıp 3 saniye geçmeden konuşmayı bırakma** — sessizlik olmasın, "Şu an her jenerasyonda yeni nesil üretiliyor..." gibi köprü cümleleri at
- ❌ **Experiments sayfasına geçtikten sonra "Run all"a basma** — sadece "Mutation operator" suite'i yeter, "Run all" ~30 saniye sürer, demoyu uzatır
- ❌ Run sonucu gelmezse panik yapma — "Hesaplama bitiyor, birkaç saniye sürüyor" de, sakin kal

---

## 🎤 4. MERİÇ — Neleri gözlemledik? (1.5 dk)

### Ezberlenecek 4 bulgu (sıra önemli!)

1. **Inversion açık ara kazandı** → %9 vs swap %20, scramble %22
2. **Roulette felaket** → %74 vs tournament %9
3. **Crossover farketmez** → OX1 ve PMX std altında
4. **Mutation rate dayanıklı** → 0.05'ten 0.80'e gap sadece 1 puan değişir

### Tek cümle ile sonuç

> "Operatör seçimi parametre tuningden daha önemli — hipotezimiz doğrulandı."

### Her bulgu için "neden" cümlesi

- **Inversion neden?** → "2-opt hareketi, iyi kenarları korur"
- **Roulette neden kötü?** → "Popülasyon yakınlaşınca seçim baskısı kaybolur, Whitley 1989 teorisi"
- **Crossover neden farketmez?** → "Standart sapmanın altında, istatistiksel olarak anlamsız"
- **Rate dayanıklı neden?** → "Operatör doğruysa ince ayar bonus"

### Açılış cümlesi

> "Dört temel bulgu var:"

### Kapanış cümlesi (kelime kelime ezberle)

> "Bu kadar — sorular?"

### Sana sorulabilecek sorular

- **"Future work ne?"**
  → "Üç şey: (1) inversion yerine tam 2-opt local search ekleyerek memetic algoritmaya dönüştürmek, (2) Web Worker'a taşıyıp daha büyük instance'lar denemek, (3) Edge Assembly Crossover gibi state-of-the-art operatörlerle kıyaslamak."

- **"Niye optimuma (7542) ulaşamadık?"**
  → "Çünkü saf GA'da popülasyon çeşitliliği bir noktadan sonra çöker. Concorde ya da Lin-Kernighan gibi exact algoritmalar bunu çözer ama bunlar TSP'ye özel. Bizim hedefimiz operatörlerin göreceli etkisini ölçmekti, mutlak optimumu bulmak değil."

- **"Whitley kim?"**
  → "1989'da seçim baskısı üzerine çalışmıştır — roulette wheel selection'ın combinatorial problemlerde başarısız olduğunu teorik olarak gösterdi. Biz bunu deneyle gözledik."

### Yaygın hata — DİKKAT

- ❌ **5. bulguyu ekleme** — 4 bulgu yeterli, fazlası karışıklık yaratır
- ❌ "Çok başarılı sonuçlar aldık" deme — **%7 gap "iyi GA" sonucu değil**, basic GA için ortalama. State-of-the-art %1 altında.
- ❌ Konuşurken **konvergence grafiğinden uzaklaşma** — ekran sabit kalsın, son görsel grafik olsun

---

## 🔁 PROVA ÇİZELGESİ

### 1. tur (kontrolsüz, sırayla konuş)
- Hata yapmana izin ver, bittikten sonra düzeltin
- Süre tut: her kişi 1.5 dk'yı geçmesin, hızlı geçenler 1 dk'da da bitmesin

### 2. tur (düzeltmeli)
- 1. turdaki aksaklıkları teker teker düzelt
- Geçiş cümlelerini özellikle pürüzsüz yap (kim kime devrediyor)
- Mustafa'nın tıklama sırasını ezberli yap

### 3. tur (cross-quiz, eğer zaman varsa)
- Birbirinize başkasının kartından soru sorun
- "Roulette gap kaçtı?" → Anıl da, Mustafa da, Meriç de bilmeli
- Amaç: ekip olarak rakamlara hâkim olmak

### Toplam prova süresi
- 3 tur × 6 dakika = **18 dakika**
- + Q&A simülasyonu **10 dakika**
- = **30 dakika** ekip provası yeterli

---

## 🚨 ACİL DURUM SCRİPTİ (uygulama açılmazsa)

Mustafa bunu söyle:
> "Uygulamamız teknik bir sorundan dolayı açılmadı, ama hazırladığımız screenshot'larla aynı sonucu gösteriyorum."

Açacağın dosyalar (önceden Finder/Preview'da hazır olsun):
- `presentation/assets/04-route-final.png` — bitmiş rota
- `presentation/assets/05-fitness-final.png` — konvergence grafiği
- `presentation/assets/07-suite-mutation.png` — mutation tablosu
- `presentation/assets/08-suite-selection.png` — selection tablosu

---

## ✅ DEMO GÜNÜ CHECKLIST (5 dakika önce)

- [ ] `npm run dev` çalışıyor mu? → `http://localhost:3000` aç
- [ ] berlin52 seçili mi?
- [ ] Reset state, generation 0
- [ ] İkinci sekmede `/experiments` hazır mı?
- [ ] Screenshot fallback'ler Preview'da hazır mı?
- [ ] Sunum cihazı bağlı, ekran yansıyor mu?
- [ ] Sırayı bir kere fısıltıyla deyin: "Emre → Anıl → Mustafa → Meriç"
- [ ] Su iç, derin nefes 🙂
