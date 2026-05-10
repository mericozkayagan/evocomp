# Kısa Sınıf Demosu — GA-TSP

**Toplam süre**: ~6 dakika anlatım + 2 dakika soru
**4 kişi × ~1.5 dakika** — her kişi bir soruyu cevaplıyor

| Sıra | Soru | Kim | Süre |
|---|---|---|---|
| 1 | **Hangi konuyu seçtik?** | Emre Yıldız | ~1.5 dk |
| 2 | **Neleri test etmeyi amaçladık?** | Anıl Aygün | ~1.5 dk |
| 3 | **Nasıl test ettik?** | Mustafa Yiğit Güzel | ~1.5 dk |
| 4 | **Neleri gözlemledik?** | Meriç Özkayagan | ~1.5 dk |

**Ekran**: http://localhost:3000 açık, **berlin52** seçili, Reset state.

---

## 1 — Emre Yıldız: Hangi konuyu seçtik? (~1.5 dakika)

> Selam, biz dört kişiyiz, projemiz **Gezgin Satıcı Problemi'ne Genetik Algoritma uygulaması**.
>
> [Ekranı göster — kırmızı noktalar]
>
> Ekranda gördüğünüz **52 kırmızı nokta**, **TSPLIB**'in `berlin52` benchmark'ı — Berlin'de 52 lokasyon. Soru basit: bu 52 yeri **her birini tam bir kez** ziyaret ederek **en kısa turla** nasıl gezeriz?
>
> Problem basit gibi ama 52 şehir için olası tur sayısı 51 faktöriyel bölü 2, yani yaklaşık 8 × 10⁶⁶. Brute force ölü. Bu yüzden **metaheuristic**'lerden Genetik Algoritma'yı seçtik.
>
> **Neden bu konu**: TSP, EC literatüründe **klasik benchmark** — operatör karşılaştırmaları için bir referans nokta var (TSPLIB'in bilinen optimumu 7542) ve sonuçlar görsel olarak doğrulanabiliyor. Yani hem akademik olarak sağlam, hem de demoda neyin işe yaradığını gözle görebiliyorsunuz.
>
> Şimdi Anıl neyi test etmek istediğimizi anlatacak.

**Stage**: Sadece ekrandaki noktaları işaret et. Start'a basma.

---

## 2 — Anıl Aygün: Neleri test etmeyi amaçladık? (~1.5 dakika)

> Genetik Algoritma'da onlarca operatör var. Biri için "en iyisi" diğeri için kötü olabilir. Biz **dört soru**ya cevap arıyorduk:
>
> **1. Hangi mutasyon operatörü daha iyi?**
> [Sağ paneldeki **"Mutation operator"** dropdown'ına işaret et]
> Üç tane denedik: **swap** (iki şehri değiştir), **inversion** (bir aralığı ters çevir — aslında 2-opt hareketi), **scramble** (aralığı karıştır).
>
> **2. Çaprazlama operatörü fark eder mi?**
> [**"Crossover operator"** dropdown'ına geç]
> İki klasik: **OX1** (sıra korur) ve **PMX** (konum eşler).
>
> **3. Seçim yöntemi ne kadar belirleyici?**
> [**"Selection"** dropdown'ına geç]
> Üç yöntem: **tournament**, **roulette**, **rank**. Literatür "roulette başarısız olur" diyor — biz bunu kanıtlamak istedik.
>
> **4. Parametreler (mutasyon oranı, popülasyon büyüklüğü) ne kadar önemli?**
>
> Yani hipotezimiz şuydu: **operatör seçimi, ince ayar parametrelerinden daha belirleyicidir.** Şimdi nasıl test ettiğimize Mustafa geçecek.

**Stage**: Konuşurken dropdown'lara *fareyle* göster — açıp kapatmaya gerek yok.

---

## 3 — Mustafa Yiğit Güzel: Nasıl test ettik? (~1.5 dakika)

> İki şey yaptık — biri görsel, biri sayısal.
>
> **Görsel olan şu uygulama**: tarayıcıda canlı çalışıyor. Şimdi default parametrelerle çalıştırıyorum:
>
> [**"Start" butonuna tıkla**]
>
> [3 saniye bekle — GA otomatik biter]
>
> Şu an 500 jenerasyon bitti. Mavi rota: en iyi tur. Alttaki grafik: popülasyonun her jenerasyonda en iyi tur uzunluğu. ~25000'den 8100'e indi, optimum 7542 — yani **%7.4 sapma**.
>
> Ama bir koşturma yeterli değil — **stokastik bir algoritma**. Bu yüzden ikinci katmanı yazdık:
>
> [**"Experiments →" linkine tıkla**]
>
> Bu sayfa **her konfigürasyonu 5 farklı tohumla** çalıştırıp ortalama + standart sapma raporluyor. Mesela mutasyon operatörünü test edelim:
>
> [**"Mutation operator"** suite'inde **"Run"** butonuna tıkla, ~3 saniye bekle]
>
> İşte 5 tohum × 3 operatör = 15 çalıştırma. Headless versiyon raporda **10 tohum** kullandı — toplam 360 GA koşturması. Hepsinin verisi `report/data/` altında CSV olarak duruyor.
>
> Bulgular için sıra Meriç'te.

**Stage direction**: Eğer Run sonucu 3 saniyede gelmezse fareyi tabloya götür ve "şu an çalışıyor" de — gözlerin tabloya kilitlensin.

---

## 4 — Meriç Özkayagan: Neleri gözlemledik? (~1.5 dakika)

> Dört temel bulgu:
>
> **1. Inversion mutation açık ara kazandı.** Swap'la gap %20, scramble'la %22, inversion'la **%9**. Yarı yarıya fark. Sebep: inversion bir 2-opt hareketi — turun "iyi kenarlarını" koruyor.
>
> **2. Roulette selection felaket.** Tournament k=5 ile gap %9, **roulette ile %74**. Yani roulette neredeyse rastgele arama yapıyor. Çünkü popülasyon uygunlukları birbirine yakınlaşınca roulette seçim baskısını kaybediyor. Whitley 1989'da bunu teorik olarak göstermişti — biz pratikte aynı sonucu aldık.
>
> **3. Crossover operatörü neredeyse fark etmez.** OX1 ve PMX arasındaki fark standart sapmanın altında — istatistiksel olarak anlamsız.
>
> **4. Mutasyon oranı çok dayanıklı.** 0.05'ten 0.80'e taşıdığımızda gap sadece 1 puan değişiyor. Yani **operatör doğruysa** rate'i fazla kurcalamaya gerek yok.
>
> **Sonuç**: hipotezimiz doğrulandı — *operatör seçimi parametre tuningden daha önemli.*
>
> Bu kadar — sorular?

**Stage**: Konuşurken son ekranda **konvergence grafiği** dursun (mavi düşen eğri). Görsel olarak en güçlü kapanış o.

---

## Hızlı toparlama (eğer hoca "kim ne yaptı" sorarsa)

- **Emre Yıldız (05210000222)**: Konu seçimi + literatür taraması (8 makale)
- **Anıl Aygün (05210000229)**: GA core kod (operatörler, evrim döngüsü)
- **Mustafa Yiğit Güzel (05210000209)**: Deney pipeline + CSV pipeline
- **Meriç Özkayagan (05230001155)**: Görsel uygulama + raporlama

## Demo öncesi 30 saniyelik kontrol

1. `npm run dev` çalışıyor mu? → `http://localhost:3000` aç
2. **berlin52** seçili mi? → değilse seç
3. **Reset** bas → state temiz
4. İkinci sekmede `/experiments` açık mı? → değilse aç
