# Demo Senaryosu — GA-TSP

**Ders**: Evolutionary Computing — Ege Üniversitesi, Bilgisayar Mühendisliği, Bahar 2026
**Demo tarihi**: 11/18 Mayıs 2026
**Toplam süre**: ~12 dakika anlatım + 3-5 dakika soru-cevap
**Yapı**: 4 kişi × ~3 dakika; her kişinin **somut bir ekran payı** ve **somut bir butonu** var.

---

## Demo öncesi hazırlık (5 dakika önce, 1 kişi yapar)

1. `cd /Users/nav-meric/meric-ozkayagan/4.sinif/ec-tsp-ga && npm run dev`
2. Tarayıcıyı **http://localhost:3000/** adresinde aç, **berlin52** seçili olduğunu doğrula
3. Generations slider'ını **500**'e ayarla, diğer parametreler **default**
4. Sunum çözünürlüğünü 1280×800 veya 1920×1080 yap; **dark mode kapalı** olsun (kontrol panelindeki etiketler beyaz arka planda daha okunaklı)
5. İkinci sekmede `/experiments` sayfasını arka plana hazırla — sekme arası geçiş hızlı olsun
6. Editörde `lib/ga.ts` dosyasını üçüncü pencerede aç (Anıl kullanacak)
7. **Kritik**: Demo başlamadan **1 kere Reset → Start** kombinasyonu deneyin. Çalıştığını gör, sonra Reset'le. (Hot-reload kalıntısı olmaması için.)

---

## ROL DAĞILIMI

| Bölüm | Süre | Kim | Ekran | Ne yapıyor |
|---|---|---|---|---|
| 1. Problem & motivasyon | 3 dk | **Emre Yıldız** | Ana sayfa (berlin52, durağan) | TSP'yi tanıt, app'i aç |
| 2. Algoritma & metodoloji | 3 dk | **Anıl Aygün** | Ana sayfa + editör (`lib/ga.ts`) | Operatörleri açıkla, kontrolleri göster |
| 3. Canlı çalıştırma & deneyler | 3 dk | **Mustafa Yiğit Güzel** | Ana sayfa → `/experiments` | GA'yı çalıştır, deney tablosunu göster |
| 4. Sonuçlar, çıkarımlar & gelecek iş | 3 dk | **Meriç Özkayagan** | Konvergence grafiği + repo | Bulguları özetle, future work |
| Q&A | 3-5 dk | Hepsi | — | Sorulara dağıtın |

---

## EMRE YILDIZ — Problem & Motivasyon (3 dakika)

**Hedef**: Dinleyici "Bu insanlar neyi neden çözüyor?" sorusunun cevabını alsın.

**Ekran**: http://localhost:3000/ — berlin52, henüz çalıştırılmamış (sadece kırmızı noktalar görünüyor)

### Konuşma metni

> Merhaba, biz [Emre, Anıl, Mustafa, Meriç]. Bahar dönemi Evolutionary Computing dersi proje demosuna hoş geldiniz. Projemizin konusu **Gezgin Satıcı Problemi'ne Genetik Algoritma uygulaması**.
>
> Önce problem: ekranda gördüğünüz 52 kırmızı nokta, **TSPLIB'in berlin52** isimli klasik benchmark'ı — Berlin'deki 52 lokasyon. Problem basit görünüyor: bu 52 şehri **her birini tam bir kez ziyaret eden ve başlangıç noktasına dönen** en kısa turu bul.
>
> [Ekranda noktaları parmakla göster]
>
> Ama kombinatoryel olarak değil. 52 şehir için olası tur sayısı **51 faktöriyel bölü 2** — yaklaşık **8 × 10⁶⁶**. Bu evrendeki atom sayısından daha fazla. Yani brute force imkânsız; **NP-hard** bir problem.
>
> İşte burada **metaheuristic**'lere ihtiyacımız var. Bizim seçtiğimiz yöntem: **Genetik Algoritma** — doğal seçilim mantığıyla, bir "popülasyon" turu evrim geçirerek iyileşmesi.
>
> Hedeflerimiz üç tane:
> 1. Sıfırdan, **seedable** (yani aynı tohumla aynı sonucu üreten) bir GA yazmak,
> 2. Klasik genetik operatörleri **kontrollü deneylerle** karşılaştırmak,
> 3. Evrimi tarayıcıda **canlı görselleştirmek** — şu an kullandığımız uygulama.
>
> Şimdi sözü algoritmamızı detaylandıracak [Anıl]'ye bırakıyorum.

**Stage direction**: Konuşma boyunca fareyi noktaların üzerinde dolaştırmadan, sabit tut. "Start" butonuna **basma**; o iş Mustafa'ün.

---

## ANIL AYGÜN — Algoritma & Metodoloji (3 dakika)

**Hedef**: Dinleyici GA'nın bileşenlerini ve neden bu seçimleri yaptığımızı anlasın.

**Ekran**: Ana sayfa (sağ kontrol paneli) → kısa kod gösterimi (`lib/ga.ts`)

### Konuşma metni

> Teşekkürler. Bir GA dört temel bileşenden oluşur: **temsil**, **seçim**, **çaprazlama** ve **mutasyon**. Hepsini hızlıca geçeyim.
>
> **Temsil**: Her birey, şehir indekslerinin bir **permütasyonu** — yani bir tur. Uygunluk fonksiyonu çok basit: tur uzunluğu. Minimize ediyoruz.
>
> [Sağdaki kontrol paneline gel, "Selection" dropdown'ına işaret et]
>
> **Seçim** için üç yöntem ekledik:
> - **Tournament** (varsayılan): rastgele k birey seç, en iyisini al
> - **Roulette**: uygunluk değeriyle orantılı olasılık
> - **Rank**: sıralamaya göre lineer ağırlık
>
> [Şimdi "Crossover operator" dropdown'ına geç]
>
> **Çaprazlama**: iki klasik permütasyon operatörü — **OX1** (Order Crossover, mutlak konum değil sıra korunur) ve **PMX** (Partially Mapped, çakışan genleri bijektif olarak yeniden eşler).
>
> [Mutation operator dropdown'ına geç]
>
> **Mutasyon**: üç operatör — **swap** (iki şehri yer değiştirir), **inversion** (bir aralığı tersine çevirir — bu aslında bir 2-opt hareketidir), ve **scramble** (aralığı karıştırır).
>
> [Opsiyonel: editör penceresine geç ve `lib/ga.ts` dosyasını göster, OX1 fonksiyonuna kaydır]
>
> Kodun tamamı **TypeScript**, **deterministik seedable PRNG** ile — aynı tohum, aynı evrim. Bu reproducibility için kritik. Distance matrix'i `Float64Array` olarak bir kez hesaplıyoruz; her uygunluk değerlendirmesi O(n).
>
> [Tekrar tarayıcıya dön]
>
> Şimdi gerçek bir koşturma için [Mustafa]'e geçiyorum.

**Stage direction**: Kod gösterimi opsiyonel; eğer zaman daralırsa atla. Sağ paneldeki dropdown'lara fareyle dokunmak yeterli görsel ipucu.

---

## MUSTAFA YİĞİT GÜZEL — Canlı Çalıştırma & Deneyler (3 dakika)

**Hedef**: GA'nın canlı çalıştığını ve parametrelerin ne kadar fark yarattığını göster.

**Ekran**: Ana sayfa → `/experiments` sayfası

### Konuşma metni

> Şimdi gerçek bir koşturma. Parametreler default: **populasyon 200, 500 jenerasyon, mutasyon oranı 0.2, çaprazlama oranı 0.9, tournament k=5, OX1, inversion**. Bilinen optimum 7542. Başlatıyorum.
>
> [**"Start" butonuna tıkla**]
>
> [3-4 saniye boyunca rota şeklinin bozulmasını izleyin — koşturma yaklaşık 2-3 saniyede biter]
>
> [Bitince işaret ederek] Bittiğinde — **500 jenerasyonda** popülasyon ortalaması ~25000'den **8097'ye** düştü, **optimumdan %7.4 sapma**. Alttaki grafikte mavi çizgi en iyi bireyin, gri çizgi popülasyon ortalamasının jenerasyon başına uzunluğu; yeşil kesikli çizgi 7542 yani bilinen optimum.
>
> Şimdi soru: Hangi operatör hangi sonucu veriyor? Bunu cevaplamak için **headless** bir deney pipeline'ı yazdık.
>
> [**Üst sağdaki "Experiments →" linkine tıkla**]
>
> Bu sayfa her konfigürasyonu **5 farklı tohumla** çalıştırıp ortalama ve standart sapmayı raporluyor. Mesela mutasyon operatörünü değiştirelim:
>
> [**"Mutation operator" suite'inde "Run" butonuna tıkla**, ~3 saniye bekleyin]
>
> İşte sonuç: **inversion** %9.8 sapmayla net kazanıyor; swap %21.6, scramble %24.7. Sebep teorik olarak biliniyor — inversion bir 2-opt hareketidir, mevcut "iyi kenarları" korur, swap ise her hareketinde 4 kenar yıkar.
>
> Bir tane daha çalıştıralım — Selection:
>
> [**"Selection method" suite'inde "Run" butonuna tıkla**, ~4 saniye bekle]
>
> İşte en çarpıcı bulgu. **Roulette selection %74 sapmayla felaket** — neredeyse rastgele arama. Tournament k=5 ise %9.8. Bu 60+ puanlık fark. Sebep: roulette sığ uygunluk dağılımlarında seçim baskısını kaybeder. 1989'da Whitley'in tahmin ettiği şey, bizim uygulamamızda kanıtlandı.
>
> Detaylı bulguları [Meriç] toparlayacak.

**Stage direction**:
- Eğer "Start" tıklanınca bir şey hareket etmiyorsa **Reset → Start** kombinasyonunu dene
- Eğer experiments sayfasında "Run" tıklanınca tablo gelmiyorsa, sayfayı yenile (`Cmd+R`) ve tekrar dene
- Konuşma sırasında **rakamları ekrana okutarak söyleyin** — dinleyici hem duysun hem görsün

---

## MERİÇ ÖZKAYAGAN — Sonuçlar, Çıkarımlar & Gelecek İş (3 dakika)

**Hedef**: Bulguları beş madde halinde topla, sınırları ve future work'ü konuş.

**Ekran**: Ana sayfa → tekrar Reset → Start → konvergence grafiği oluştuğunda dur

### Konuşma metni

> Teşekkürler. İki TSPLIB instance, on tohum, altı parametre tarama suite'inden öne çıkan **dört bulgu** var:
>
> **Birinci bulgu — operatör seçimi mutasyon oranından önemli.** Mutasyon oranını 0.05'ten 0.8'e taşımak gap'i sadece **1 puan** değiştiriyor. Ama operatör değiştirmek **15 puan** değiştiriyor. Yani ince ayar değil, doğru aleti seçmek belirleyici.
>
> **İkinci bulgu — inversion mutation, TSP için doğru varsayılan.** Çünkü tek inversion = tek 2-opt hareketi. n şehirden n-3'ünü değişmeden bırakıyor.
>
> **Üçüncü bulgu — tournament selection olmazsa olmaz.** Roulette başarısız oluyor; rank biraz daha iyi ama tournament k=5'in ölçeğe bağımsız baskısına yetişemiyor.
>
> **Dördüncü bulgu — popülasyon büyüklüğü azalan getiri.** 50'den 400'e çıkmak gap'i %11.7'den %6.7'ye düşürüyor; 400'ün üzerinde marjinal kazanç azalıyor. Yani bu noktada bütçeyi popülasyona değil, **local search**'e harcamak daha verimli.
>
> [Repo / ekran payına bak]
>
> Şu anda en iyi konfigürasyonumuzla `berlin52`'de **%6-7 gap**'teyiz. Edge Assembly Crossover gibi state-of-the-art operatörler %1 altına iniyor, ama bunlar TSP'ye **özel** algoritmalar. Bizimki **generic GA** — yarının VRP, JSP, başka permütasyon problemleri için doğrudan uyarlanabilir.
>
> **Gelecek iş** üç yönde:
> 1. Mutasyon yerine tam **2-opt local search** — memetic algoritma, %1 altına in
> 2. **Web Worker**'a taşı, ana thread bloklanmasın, daha büyük instance'lar
> 3. EAX implementasyonu ekle, klasik operatörlere karşı kıyasla
>
> Dinlediğiniz için teşekkür ederiz. Soruları alabiliriz.

**Stage direction**: Konuşurken **konvergence grafiğini ekranda tut** — son slayt yerine geçer. Repo URL'sini söylemeden önce ekrana yansıt (`/Users/nav-meric/meric-ozkayagan/4.sinif/ec-tsp-ga`).

---

## Olası sorular ve cevaplar

**S1 — "Neden Python yerine TypeScript?"**
> Çünkü demo tarayıcıda canlı çalışıyor — Python olsa backend kurmamız, CORS açmamız gerekirdi. TypeScript'te `Float64Array` ve typed arrays sayesinde 52 şehirlik berlin52 için 500 jenerasyon yaklaşık 2 saniyede biter. Performans Python'a yakın, deployment ise tek `npm run dev`.

**S2 — "Optimum 7542'ye neden ulaşamıyorsunuz?"**
> Çünkü saf GA'da popülasyon çeşitliliği bir noktadan sonra çöküyor. Literatür de bunu doğruluyor — Concorde ya da Lin-Kernighan gibi exact/exact-heuristic methodlar global optimumu bulur, ama bunlar TSP'ye özel. Bizim hedefimiz operatörlerin **göreceli** etkisini ölçmek; konfigürasyon başına 10 tohum ortalaması alarak istatistiksel olarak anlamlı karşılaştırmalar yaptık.

**S3 — "Roulette neden bu kadar kötü?"**
> Çünkü ilk birkaç jenerasyondan sonra popülasyon uygunluk değerleri birbirine yakınlaşır; roulette de bu yakın değerlere göre olasılık dağıtır, bu da seçim baskısını sıfıra yaklaştırır. Genel TSP literatüründe roulette nadiren kullanılır. Bizim experimente bunu sıfırdan reproduce ettik.

**S4 — "Crossover ve mutation rate sweep'inde anlamlı fark yok dediniz, kanıt?"**
> Tablodaki standart sapmaları üst üste koyduğumuzda %95 güven aralıkları örtüşüyor. Yani gözlenen küçük farklar tohum varyasyonu içinde kalıyor. 10 tohum azdı, normalde 30 tohum ile t-test yapılırdı; bu projedeki hesaplama bütçesi içinde kalmaya çalıştık.

**S5 — "Kim ne yaptı?"**
> Raporda detayı var ama özetle: Emre problem framing + literatür, Anıl GA core, Mustafa deney pipeline + mutasyon operatörleri, Meriç web visualiser + E2E test + dokümantasyon.

**S6 — "Random instance'ı nasıl ürettiniz?"**
> Aynı seedable PRNG ile. `select instance: random-30` veya `random-100`. Bilinen optimum yok dolayısıyla "gap" görüntülenmez ama operatörler kıyaslanabilir.

---

## Acil durum planı

**App açılmadıysa**:
- `presentation/assets/09-app-fullshot.png` (tam ekran şot) + `04-route-final.png` + `05-fitness-final.png` görsellerini ardışık aç. Anlatımı bu görseller üzerinden yap; "canlı" deyimini "şu çekimde gördüğümüz gibi" diye değiştir.

**Deney suite Run'a tıklayınca tablo gelmiyorsa**:
- Mustafa önceden hazırlanmış CSV'leri açar: `report/data/mutation_op_berlin52.csv` ve `selection_method_berlin52.csv`. Numbersa veya VS Code'da göster.

**Soru gelirse ama hiçbiri kişisel uzmanlık alanında değilse**:
- "İyi soru, bunu raporun X. bölümünde tartışıyoruz, demo sonrası göstermekten memnuniyet duyarım" — sonra şu nota dönün: konvergence eğrisi, deney suite çıktıları, IEEE raporu.

---

## Demo sonrası

- Soruları cevapladıktan sonra: "Daha detaylı bilgi için **raporun tamamını** ve **CSV verilerini** GitHub repo'sunda paylaştık." [Repo URL]
- Hoca eğer kod incelemek isterse: `lib/ga.ts` ana dosya, ~270 satır, OX1/PMX/select fonksiyonları ayrı ayrı export edilmiş, okunaklı.
