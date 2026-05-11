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

> Merhaba, ben Emre. Anıl, Mustafa ve Meriç ile birlikte **Gezgin Satıcı Problemi'ne — yani TSP'ye — Genetik Algoritma uygulaması** üzerine çalıştık.
>
> [Ekrandaki kırmızı noktalara işaret et]
>
> Ekrandaki **52 nokta**, TSPLIB veri setinden aldığımız **berlin52 instance'ı**. Berlin'in 52 lokasyonu. TSPLIB'i seçmemizin sebebi, literatürdeki **bilinen optimum tur uzunluğu** ile sonuçlarımızı doğrudan karşılaştırabilmek — burada optimum **7542**.
>
> Problem klasik: bu 52 düğümü her birini tam bir kez ziyaret eden minimum maliyetli Hamiltonian döngüsünü bulmak. Karar problemi olarak **NP-complete**, optimizasyon versiyonu **NP-hard**. Yani bilinen polinom zamanlı kesin çözümü yok. Olası tur sayısı **(n-1)! / 2**, bizim instance için yaklaşık **10⁶⁶** mertebesinde. Brute force matematiksel olarak imkânsız.
>
> Bu yüzden **metaheuristic** yaklaşımlara gidiyoruz — kesin çözüm garantisi olmayan ama makul sürede iyi çözüm üreten algoritmalar. Biz bu sınıftan **Genetik Algoritma**'yı seçtik. Sebepler:
> - **Temsil doğal**: her birey bir permütasyon, yani direkt bir tur
> - **Operatör çeşitliliği**: literatürde onlarca selection / crossover / mutation operatörü var, kıyaslamalı çalışma için zengin tasarım uzayı
> - **Görsel doğrulanabilirlik**: her jenerasyondaki en iyi bireyi canlı render edebiliyoruz
>
> Kabaca akış: rastgele bir başlangıç popülasyonu üretiyoruz, **fitness fonksiyonu** olarak tur uzunluğunu kullanıyoruz, her jenerasyonda selection–crossover–mutation operatörlerini uygulayıp yeni popülasyonu oluşturuyoruz. Stokastik bir global arama.
>
> Şimdi Anıl, tam olarak hangi tasarım kararlarını test etmek istediğimizi anlatacak.

**Stage**: Sadece ekrandaki noktaları işaret et. **Start'a basma** — o iş Mustafa'nın. Metni okuyabilirsin ama gözlerini ara ara dinleyiciye kaldır. Tempo: cümle başına ~3 saniye, virgüllerde küçük pause.

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

## Kim ne yaptı (hocaya hazır cevap)

| Üye | Öğrenci No | Sorumluluk |
|---|---|---|
| **Emre Yıldız** | 05210000222 | Konu araştırması, literatür taraması (8 akademik makaleyi okuduk ve referans aldık), raporun **Giriş** ve **İlgili Çalışmalar** bölümleri |
| **Anıl Aygün** | 05210000229 | Genetik algoritmanın asıl kodu — popülasyon üretimi, seçim/çaprazlama/mutasyon operatörleri, evrim döngüsü; raporun **Yöntem** bölümü |
| **Mustafa Yiğit Güzel** | 05210000209 | Deney altyapısı — aynı algoritmayı farklı parametrelerle 10 kere çalıştırıp ortalama-standart sapma hesaplayan otomatik test pipeline'ı, sonuç CSV'leri; raporun **Deneyler** bölümü |
| **Meriç Özkayagan** | 05230001155 | Tarayıcıda çalışan görsel demo uygulaması (canlı evrim animasyonu + grafik), uçtan uca test, raporun **Sonuç** bölümü ve demo materyalleri |

**Sorulursa**: "Her birimiz bir bölümü asıl yazdık ama tüm metni dördümüz birlikte gözden geçirdik."

## Demo öncesi 30 saniyelik kontrol

1. `npm run dev` çalışıyor mu? → `http://localhost:3000` aç
2. **berlin52** seçili mi? → değilse seç
3. **Reset** bas → state temiz
4. İkinci sekmede `/experiments` açık mı? → değilse aç
