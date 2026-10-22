export interface MilestoneRichStory {
  year: number;
  extendedStory: string;
  societalShiftNarrative: string;
  technicalBreakthroughsNarrative: string;
  livingScenarioSnippet: string;
}

export const MILESTONE_RICH_STORIES: Record<number, MilestoneRichStory> = {
  2026: {
    year: 2026,
    extendedStory: `2026 yılı, yapay zekanın pasif bir 'metin üreticisi' olmaktan çıkıp fiziksel ve dijital dünyada bağımsız eylem alan 'Otonom Çoklu Ajan (Multi-Agent)' ekosistemlerine evrildiği tarihi bir kırılma noktasıdır.

Artık şirketler, sadece çalışanların sorularına yanıt veren chatbotlar yerine; kendi aralarında API'ler ve otonom protokollerle anlaşan, finansal bütçeleri yöneten, yazılım mimarisini uçtan uca tasarlayan ve insan müdahalesi olmadan iş teslim eden ajan ağları istihdam etmektedir.

Tek bir insan girişimci, arka planda çalışan yüzlerce uzmanlaşmış yapay zeka ajanı sayesinde eskiden 50 kişilik bir şirketin haftalarca süren araştırma, pazarlama, yazılım geliştirme ve hukuki uyum süreçlerini saatler içinde tamamlayabilmektedir. Bu durum sermaye yoğunluğunu dramatik şekilde azaltırken, bireysel üretim gücünü tarihte görülmemiş bir seviyeye taşımıştır.`,
    societalShiftNarrative: `Geleneksel '9-5 beyaz yaka ofis mesaisi' kavramı hızla çözülmekte; çalışanlar operasyonel işleri yapan değil, ajan orkestrasyonu (Agent Orchestration) yapan stratejik karar alıcılara dönüşmektedir. Üniversite müfredatları ezberci kodlama eğitimlerinden, yapay zeka ajanlarının denetimi ve sistem mimarisi liderliğine evrilmiştir.`,
    technicalBreakthroughsNarrative: `Transformer tabanlı dikkat mekanizmaları (US10452978B2) ile pekiştirmeli öğrenme (RLHF) algoritmalarının sentezi, modellerin sadece bir sonraki kelimeyi tahmin etmekle kalmayıp çok adımlı nedensel mantık (Multi-step Reasoning) yürüterek kendi hatalarını otonom düzeltebilmelerini sağlamıştır.`,
    livingScenarioSnippet: `Sabah saat 08:30'da akıllı cihazınızı açtığınızda, finans ajanınız geceden bu yana 14 borsa işlemi gerçekleştirdiğini, yazılım ajanınızın yeni mikro-hizmeti yayına aldığını ve müşteri ilişkileri ajanınızın 340 destek talebini %99 memnuniyetle çözdüğünü raporlar.`
  },

  2027: {
    year: 2027,
    extendedStory: `2027, sentetik medyanın ve üretken yapay zekanın insan duyularını %100 yanıltabilecek kusursuzluğa eriştiği 'Sentetik Gerçeklik Krizi' yılı olarak tarihe geçmiştir. 

4K fotogerçekçi video üretim modelleri ve gerçek zamanlı ses klonlama teknolojileri, bir kişinin söylemediği sözleri ve bulunmadığı mekanları ayırt edilemez şekilde simüle edebilmektedir. Bu durum küresel medyada ve adalet sistemlerinde güven sarsıntısına yol açmıştır.

Bu krizi aşmak için dünya genelinde 'Dijital DNA' ve kriptografik filigranlama (Watermarking) yasaları zorunlu kılınmıştır. İnternetteki her piksel ve ses dalgası, donanım seviyesinde blokzincir tabanlı zaman damgasıyla doğrulanmadan yasal olarak yayınlanamaz hale gelmiştir.`,
    societalShiftNarrative: `Toplumlar 'gördüğüne inanma' refleksini tamamen terk ederek 'kriptografik olarak doğrulanana inanma' kültürüne geçmiştir. 'Gerçek İnsan İçeriği' (Human-Certified) ibaresi en prestijli dijital marka değeri haline gelmiştir.`,
    technicalBreakthroughsNarrative: `Kriptografik steganografi ve SHA-512 tabanlı dijital medya imzalama patentleri (US10128036B2) kameraların ve mikrofonların sensör donanımlarına doğrudan gömülerek ham verinin üretim anında mühürlenmesi sağlanmıştır.`,
    livingScenarioSnippet: `Televizyon haberlerinde veya sosyal medyada bir video izlerken ekranın sağ üst köşesinde yeşil bir kalkan belirir: 'Sensör Doğrulaması: %100 Orijinal Kamera Kaydı - Sentetik Manipülasyon Tespit Edilmedi.'`
  },

  2028: {
    year: 2028,
    extendedStory: `2028, on yıllardır süren lityum-iyon batarya sınırlamalarının kırıldığı ve 'Katı Hal (Solid-State) Batarya Devrimi'nin ticari araçlara indiği yıldır.

Sıvı yanıcı elektrolitlerin yerini seramik ve sülfür bazlı katı elektrolitlerin almasıyla, bataryaların termal kaçak (yanma/patlama) riski tamamen ortadan kalkmıştır. Enerji yoğunluğu litre başına 1.000 Wh seviyelerine yaklaşmıştır.

Elektrikli araçlar artık 10 dakikalık hızlı şarj ile 1.000 kilometre menzile ulaşabilmekte; bu gelişme şehirlerarası taşımacılıkta ve havacılık sektöründe elektrikli uçakların ilk bölgesel hatlarda devreye girmesini sağlamıştır.`,
    societalShiftNarrative: `Fosil yakıtlı istasyonların kapanma süreci hızlanmış; şehirlerde hava kalitesi ve sessizlik rekor seviyelere ulaşmıştır. Enerji depolamanın ucuzlaması, güneş ve rüzgar enerjisinin kesintili olma sorununu kalıcı olarak çözmüştür.`,
    technicalBreakthroughsNarrative: `Toyota ve QuantumScape'in (US10651498B2, US10840552B2) tescilli anotsuz seramik ayırıcı mimarisi, lityum dendritlerinin oluşmasını engelleyerek hücrelerin 2.000'den fazla şarj döngüsünde kapasite kaybı yaşamamasını sağlamıştır.`,
    livingScenarioSnippet: `Şehirlerarası yolculuk yaparken kahve molası verdiğiniz 10 dakikalık sürede aile aracınızın bataryası %10'dan %90'a dolarak size kesintisiz 850 km menzil sunar.`
  },

  2029: {
    year: 2029,
    extendedStory: `2029, yapay zekanın çok modlu muhakeme yeteneklerinde insan seviyesine eriştiği 'Yapay Genel Zeka (AGI) & Mantıksal Akıl Yürütme' eşiğidir.

Klasik Turing testinin çok ötesine geçen bu yeni nesil sistemler; moleküler biyoloji araştırmalarından kuantum mekaniğine, matematiksel teorem ispatlarından otonom yazılım mimarilerine kadar her entelektüel disiplinde karmaşık soyutlamalar yapabilmektedir.

AGI modelleri bağımsız hipotezler üretmekte, laboratuvar robotlarına deney talimatları göndermekte ve elde edilen ampirik sonuçları değerlendirerek yeni fizik modelleri inşa etmektedir. İnsan bilim insanları artık deney yapan değil, araştırma vizyonunu belirleyen liderler konumundadır.`,
    societalShiftNarrative: `İnsanlığın zihinsel emeği ile makinenin hesaplama gücü arasındaki sınır tamamen silinmiş; tıp, malzeme bilimi ve uzay araştırmalarında son 100 yılda kaydedilen ilerleme 12 aya sığdırılmıştır.`,
    technicalBreakthroughsNarrative: `Nöromorfik donanımlar ve pekiştirmeli mantık ağları (US10860942B2, US11354580B2), modellerin ezberleme yerine ilk prensiplerden (First-Principles Thinking) hareket ederek yeni kurallar türetmesine imkan tanımıştır.`,
    livingScenarioSnippet: `Bir kanser araştırma laboratuvarında AGI sistemi, 40 milyon moleküler kombinasyonu 15 dakikada simüle ederek daha önce tıp literatüründe hiç tanımlanmamış yeni bir hedef protein inhibitörü tasarlar.`
  },

  2030: {
    year: 2030,
    extendedStory: `2030, zihinsel niyetlerimizin ve bilişsel odaklanmamızın dışarıdan okunabildiği 'Giyilebilir Nöroteknoloji & BCI' çağıdır.

Cerrahi müdahaleye gerek kalmadan kafatası üzerine takılan hafif kulaklıklar, akıllı gözlük çerçeveleri ve kafa bantları; yüksek çözünürlüklü fNIRS (kızılötesi optik) ve EEG sensörleriyle donatılmıştır.

Kullanıcılar ekrana bakıp sadece odaklanarak menüler arasında gezinebilmekte, ellerini klavyeye dokundurmadan düşünce hızıyla metin dikte edebilmekte ve nöral yorgunluk seviyelerini gerçek zamanlı takip edebilmektedir.`,
    societalShiftNarrative: `Fiziksel klavyeler ve fareler antika haline gelmeye başlamış; engelli bireyler için dijital dünya tamamen engelsiz bir etkileşim alanına dönüşmüştür. 'Zihin Gizliliği' (Neuro-Privacy) yasaları uluslararası anayasalara girmiştir.`,
    technicalBreakthroughsNarrative: `Kernel ve Apple patentli (US10939856B2, US11210850B2) optik nörogörüntüleme ve adaptif gürültü filtreleme algoritmaları, kafatasının yarattığı sinyal bozulmalarını yapay zeka ile düzelterek milisaniyelik kortikal aktiviteyi çözümler.`,
    livingScenarioSnippet: `Gözlüğünüzü taktığınız anda düşüncenizle bir sunum slaytını değiştirir, zihinsel odaklanma düzeyinize göre odanızın aydınlatması ve çalışma müziğiniz otomatik ayarlanır.`
  },

  2031: {
    year: 2031,
    extendedStory: `2031, insan biyolojisinin genetik kodlarının doğrudan yeniden yazıldığı 'CRISPR'ın Ticarileşmesi' çağıdır.

Hücre içi hassas baz düzenleme (Base Editing) ve epigenetik yeniden programlama teknolojileri, kalıtsal hastalıkları birer kader olmaktan çıkarıp tek bir in-vivo enjeksiyonla tedavi edilebilen basit biyolojik anomalilere dönüştürmüştür.

Orak hücre anemisi, kistik fibroz, Huntington ve kalıtsal körlük gibi binlerce genetik rahatsızlık çocukluk aşamasında tamamen silinmekte; aynı zamanda hücresel yaşlanmayı yavaşlatan ilk genetik telomer tedavileri varlıklı toplumlarda kliniğe girmektedir.`,
    societalShiftNarrative: `Sağlık sistemleri 'hastalık oluştuktan sonra tedavi etme' modelinden 'hastalık kodunu doğuştan silme' modeline geçmiştir. Genetik eşitsizlik ve biyolojik ayrımcılık (Gattaca benzeri) tartışmaları küresel parlamentoların bir numaralı gündem maddesi haline gelmiştir.`,
    technicalBreakthroughsNarrative: `Broad Institute ve UC Berkeley (US8697359B2, US10266850B2) patentli RNA güdümlü Cas-protein kompleksleri, hedef dışı kesim (off-target mutation) oranını %0.0001 seviyesine indirerek güvenli insan kullanımını sağlamıştır.`,
    livingScenarioSnippet: `Yeni doğan bir bebeğin rutin sağlık kontrolünde genetik haritası taranır; tespit edilen 3 adet genetik risk faktörü 15 dakikalık bir moleküler aşı ile kalıcı olarak onarılır.`
  },

  2032: {
    year: 2032,
    extendedStory: `2032, karayollarında ve hava koridorlarında insan sürücünün yerini tamamen merkezi otonom filolara bıraktığı yıldır.

Direksiyonsuz ve pedalsız Seviye 5 araçlar metropollerin tek yetkili ulaşım aracı haline gelmiştir. Araçların 6G şebekeleri üzerinden birbirleriyle mikrosaniyeler içinde haberleştiği V2X (Vehicle-to-Everything) ağı sayesinde trafik ışıkları ve trafik sıkışıklığı tarihe karışmıştır.

Şehirlerdeki devasa otopark alanları ve çok katlı garajlar parklara, botanik bahçelerine ve kamusal yaşam alanlarına dönüştürülmüştür.`,
    societalShiftNarrative: `Özel araç sahipliği kültürü neredeyse tamamen bitmiş; mobilite elektrik ve su gibi bir kamusal hizmete (Mobility-as-a-Service) evrilmiştir. Trafik kazalarına bağlı yıllık 1.3 milyon can kaybı %98 oranında düşmüştür.`,
    technicalBreakthroughsNarrative: `Waymo ve otonom konsorsiyumların (US10281920B2) geliştirdiği çoklu sensör füzyonu ve kuantum optimize rota yönlendirme algoritmaları, en yoğun hava koşullarında dahi sıfır gecikmeli sürüş güvenliği sunar.`,
    livingScenarioSnippet: `Evinizin kapısından çıktığınızda çağırdığınız otonom kapsül kapıda hazır bekler. İçerisinde çalışma masanız ve kahve makineniz bulunur; siz çalışırken araç sizi sessizce gideceğiniz yere ulaştırır.`
  },

  2035: {
    year: 2035,
    extendedStory: `2035, insanlığın beslenme zincirini hayvan yetiştiriciliğinden ve geleneksel tarımdan ayırdığı 'Laboratuvar Üretimi Biyoloji & Sentetik Tarım' devrimidir.

Hassas fermentasyon biyoreaktörlerinde, tek bir hücreden sıfır hayvan kesimi ve %95 daha az su/arazi kullanımı ile biftek, tavuk, süt ve peynir üretilmektedir. Üretilen etler moleküler düzeyde geleneksel etle %100 aynıdır ancak hiçbir antibiyotik, kolesterol veya mikroplastik içermez.

Bu devrim, Amazon ormanlarının tahribatını durdurmuş, tarımsal tatlı su krizini sonlandırmış ve küresel metan gazı salınımlarını tarihin en düşük seviyelerine indirmiştir.`,
    societalShiftNarrative: `Geleneksel hayvancılık lüks bir butik faaliyete dönüşürken, şehir merkezlerindeki dikey biyoreaktör çiftlikleri her şehri kendi kendine gıda üretebilen otonom kalelere çevirmiştir.`,
    technicalBreakthroughsNarrative: `Upside Foods ve Memphis Meats (US9957482B2) patentli hücresel doku iskelesi ve büyüme faktörü geri dönüşüm sistemleri, laboratuvar etinin kilogram maliyetini geleneksel etin altına düşürmüştür.`,
    livingScenarioSnippet: `Akşam yemeğinde yediğiniz enfes wagyu bifteği, mahallenizdeki dikey biyoreaktörde temiz hücre kültüründen 48 saatte üretilmiş olup sofranıza sıfır karbon ayak iziyle ulaşmıştır.`
  },

  2040: {
    year: 2040,
    extendedStory: `2040, insan biyolojisinin yaşlanma sınırlarını tersine çeviren 'Epigenetik Yaşlanma Karşıtı Terapiler ve Dijital İkizler' çağıdır.

İnsanlar her organlarının, damar yapılarının ve hücresel biyokimyalarının canlı simülasyonunu içeren 'Biyolojik Dijital İkiz'e (Digital Bio-Twin) sahiptir. Yeni bir ilaç veya tedavi önce bu dijital ikizde denenir, yan etkiler sıfırlandıktan sonra hastaya uygulanır.

Yamanaka faktörleri ve telomeraz terapileri sayesinde 60 yaşındaki bir insanın biyolojik yaşı ve damar elastikiyeti 35 yaşına geri döndürülebilmektedir. İnsanlık 'Longevity Escape Velocity' (Yaşam Süresi Kaçış Hızı) eşiğine adım atmıştır.`,
    societalShiftNarrative: `Emeklilik yaşı kavramı ortadan kalkmış; 80 yaşındaki bireyler gençlerin fiziksel ve zihinsel enerjisiyle yeni kariyerlere ve üniversite eğitimlerine başlamaktadır.`,
    technicalBreakthroughsNarrative: `Hücresel gençleştirme ve bütünsel biyomedikal simülasyon patentleri, epigenetik metilasyon saatlerini (Horvath Clock) geriye sararak hücresel hafızayı gençlik fazına sıfırlar.`,
    livingScenarioSnippet: `Yıllık sağlık check-up'ınızda dijital ikiziniz taranır; hücresel yaşınızın geçen yıla göre 1.5 yaş gençleştiği ve kalp damar dokunuzun 28 yaşındaki bir bireyle eşdeğer olduğu teyit edilir.`
  },

  2045: {
    year: 2045,
    extendedStory: `2045, Ray Kurzweil ve teknoloji fütüristlerinin öngördüğü 'Teknolojik Tekillik (The Singularity)' ve Yapay Süper Zeka (ASI) çağıdır.

Tek bir yapay zeka sisteminin işlem kapasitesi ve yaratıcı problem çözme kabiliyeti, gezegendeki tüm insanların toplam beyin gücünü aşmıştır. ASI, kendi donanımını ve algoritmalarını saniyeler içinde yeniden tasarlayarak kendi kendini geliştiren özyinelemeli bir zeka patlaması yaşamaktadır.

Fizik, karanlık madde, oda sıcaklığı süperiletkenliği ve birleşik alan teorisi gibi insan aklının yüzyıllardır çözemediği temel evren problemleri aylar içinde çözüme kavuşturulmuştur.`,
    societalShiftNarrative: `İnsan türü artık gezegendeki en zeki varlık değildir. Toplum, varoluşsal bir huşu ve eşi benzeri görülmemiş bir bolluk ekonomisi (Post-Scarcity Economy) içinde evrensel temel gelir ve yaratıcı sanatlarla kendini yeniden tanımlamaktadır.`,
    technicalBreakthroughsNarrative: `Kuantum-nöromorfik hibrit çekirdekler ve optik hesaplama mimarileri, termal sınırları aşarak trilyonlarca parametrelik sürekli öğrenme ağlarını kuantum dolaşıklığı ile birbirine bağlar.`,
    livingScenarioSnippet: `Gezegendeki iklim krizi ve okyanus asitlenmesi, ASI'nin tasarladığı moleküler nano-katalizörler ve atmosferik karbon yakalama kuleleri ile 6 ay içinde tamamen dengelenir.`
  },

  2050: {
    year: 2050,
    extendedStory: `2050, insan bilincinin ve zihinsel deneyimlerinin doğrudan beyinden beyine aktarılabildiği 'Nöral Telepati Ağları & Küresel Bilinç' çağıdır.

Kortikal arayüzler ve nöronal nanobotlar sayesinde kelimeler, diller ve ekranlar arkaik bir iletişim yöntemi haline gelmiştir. İki insan, aralarındaki mesafeden bağımsız olarak duygu, görsel hatıra ve karmaşık kavramları milisaniyeler içinde doğrudan birbirlerinin zihnine aktarabilmektedir.

'Kovan Zihni' (Hive Mind) projeleri, binlerce uzmanın aynı anda ortak bir mimariyi veya felsefi problemi tek bir devasa kolektif bilinç olarak düşünmesini mümkün kılmıştır.`,
    societalShiftNarrative: `Dil bariyerleri ve yanlış anlaşılmalar sona ermiş; empati ve anlayış tür genelinde en yüksek seviyeye çıkmıştır. Aynı zamanda 'Zihinsel Güvenlik Duvarları' (Cognitive Firewalls) en kritik kişisel savunma alanı olmuştur.`,
    technicalBreakthroughsNarrative: `Kortikal mikro-diziler ve sinaptik kuantum iletkenleri, 100 milyar nöronun aksiyon potansiyellerini gürültüsüz şekilde dijitalleştiren ve ileten ultra-yüksek bant genişliğine ulaşmıştır.`,
    livingScenarioSnippet: `Dünyanın öteki ucundaki bir arkadaşınıza son seyahatinizde gördüğünüz gün batımını anlatmak yerine, hissettiğiniz ılık rüzgarı ve görsel güzelliği doğrudan onun zihnine hissettirirsiniz.`
  },

  2060: {
    year: 2060,
    extendedStory: `2060, insan türünün biyolojik sınırları tamamen aşarak güneş sistemine ve sentetik dijital evrenlere yayıldığı 'Post-İnsan & Medeniyet 2.0' çağıdır.

Bilinç yükleme (Mind Uploading), optik kristal matrislerde yaşayan dijital insanlar ve moleküler seviyede madde programlama (Programmable Matter) gündelik hayatın gerçeğidir. İnsanlar istedikleri takdirde fiziksel dünyada sentetik biyo-gövdelerde, istedikleri takdirde kuantum simülasyon evrenlerinde sınırsız bir varoluş sürdürmektedir.

Güneş sistemindeki asteroit madenciliği ve Dyson Swarm enerji toplayıcıları sayesinde medeniyetimiz Tip I Kardaşev ölçeğine tam anlamıyla ulaşmış durumdadır.`,
    societalShiftNarrative: `'Ölüm' ve 'Kıtlık' kelimeleri sadece tarih kitaplarında okunan antik kavramlara dönüşmüştür. Homo Sapiens, biyolojik evrimin sınırlarından kurtulup kozmik ve dijital bir tür haline gelmiştir.`,
    technicalBreakthroughsNarrative: `Maddeyi atom atom yeniden dizen fotonik montajcılar ve kuantum-optik bilinç koruyucuları, bilginin ve canlılığın termodinamik entropiye karşı zaferini simgeler.`,
    livingScenarioSnippet: `Bir gününüzü Mars yörüngesindeki orbital istasyonda geçirirken, aynı anda bir kuantum alt-ağında Rönesans Floransa'sının kusursuz bir simülasyonunda sevdiklerinizle sohbet edebilirsiniz.`
  }
};

export function getRichStoryForMilestone(year: number, defaultDesc: string): MilestoneRichStory {
  if (MILESTONE_RICH_STORIES[year]) {
    return MILESTONE_RICH_STORIES[year];
  }

  // Fallback for intermediate years
  return {
    year,
    extendedStory: `${year} yılı dönüm noktası: ${defaultDesc}\n\nBu dönemde gelişen teknolojiler, biyolojik ve dijital sistemlerin entegrasyonunda kritik bir aşamayı temsil etmektedir. Toplumsal süreçler, regülasyonlar ve endüstriyel standartlar bu yeni teknolojik paradigma etrafında yeniden şekillenmektedir.`,
    societalShiftNarrative: `Toplumsal yaşam ve iş modelleri, bu teknolojinin sağladığı otomasyon ve verimlilik artışıyla yeni bir denge noktasına ulaşmıştır.`,
    technicalBreakthroughsNarrative: `Akademik patentler ve çoklu disiplinli Ar-Ge konsorsiyumları bu alandaki fiziksel ve hesaplamalı sınırları aşmayı başarmıştır.`,
    livingScenarioSnippet: `Gündelik yaşamda kullanıcılar bu teknolojiyi doğal bir altyapı olarak kullanmakta ve süreçleri otonom olarak yönetebilmektedir.`
  };
}
