export interface Product {
  id: string;
  title: string;
  category: string;
  categoryKey: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  originCountry: string; // بلد الاستيراد الأصلي
  tag?: {
    text: string;
    type: 'sale' | 'new';
  };
  colors?: string[];
  sizes?: string[];
}

export const CATEGORIES = [
  { key: 'all', name: 'الكل', icon: 'Globe' },
  { key: 'electronics', name: 'إلكترونيات وتكنولوجيا', icon: 'Laptop' },
  { key: 'fashion', name: 'أزياء وإكسسوارات', icon: 'Watch' },
  { key: 'office', name: 'مكتب وبيئة العمل', icon: 'Briefcase' },
  { key: 'lifestyle', name: 'أسلوب حياة وغادجيتس', icon: 'Compass' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'duck-tech-1',
    title: 'سماعات الرأس اللاسلكية الذكية ANC-Pro',
    category: 'إلكترونيات وتكنولوجيا',
    categoryKey: 'electronics',
    price: 3450,
    oldPrice: 4200,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 312,
    originCountry: 'الولايات المتحدة الأمريكية',
    description: 'سماعات رأس لاسلكية احترافية مع ميزة إلغاء الضوضاء النشط الهجين (ANC). توفر صوتاً عالي الدقة (Hi-Res Audio) مع بطارية تدوم حتى 40 ساعة متواصلة. مستوردة مباشرة من Amazon US شاملة التخليص الجمركي.',
    tag: { text: 'الأكثر طلباً', type: 'sale' },
    colors: ['#1C2D37', '#FFFFFF', '#236B93'],
    sizes: ['قياسي'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-2',
    title: 'ساعة رياضية ذكية متكاملة IP68',
    category: 'أزياء وإكسسوارات',
    categoryKey: 'fashion',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 198,
    originCountry: 'اليابان',
    description: 'ساعة ذكية مخصصة للرياضيين مع مستشعر نبضات القلب ونسبة الأكسجين في الدم، وشاشة AMOLED زجاجية مقاومة للخدش. تدعم استقبال الإشعارات والمكالمات باللغة العربية. مستوردة من اليابان.',
    tag: { text: 'جديد', type: 'new' },
    colors: ['#1C2D37', '#E91E63'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-3',
    title: 'لوحة مفاتيح ميكانيكية احترافية صامتة',
    category: 'مكتب وبيئة العمل',
    categoryKey: 'office',
    price: 1850,
    oldPrice: 2300,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 145,
    originCountry: 'ألمانيا',
    description: 'لوحة مفاتيح ميكانيكية بتصميم مريح وعازل للصوت، مثالية لبيئات العمل والمبرمجين. مجهزة بإضاءة RGB خافتة وتدعم التوصيل اللاسلكي المتعدد لثلاثة أجهزة. مستوردة من ألمانيا.',
    tag: { text: 'تخفيض 20%', type: 'sale' },
    colors: ['#1C2D37', '#E6F4FA'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-4',
    title: 'حقيبة الظهر الذكية المقاومة للماء للسفر والأعمال',
    category: 'أزياء وإكسسوارات',
    categoryKey: 'fashion',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 89,
    originCountry: 'المملكة المتحدة',
    description: 'حقيبة ظهر فاخرة لرجال وسيدات الأعمال ومصممة بمساحات مبطنة للكمبيوتر المحمول واللوحي مع منفذ شحن USB خارجي مضاد للسرقة وقماش مقاوم للمياه والتمزق. مستوردة من إنجلترا.',
    colors: ['#1C2D37', '#5B7282'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-5',
    title: 'محفظة جلدية ذكية بنظام حماية RFID',
    category: 'أزياء وإكسسوارات',
    categoryKey: 'fashion',
    price: 850,
    oldPrice: 1100,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 220,
    originCountry: 'إيطاليا',
    description: 'محفظة رجالية مصنوعة من الجلد الإيطالي الطبيعي 100% ومجهزة بحماية كاملة ضد سرقة بيانات البطاقات الائتمانية لاسلكياً (RFID). تتسع لـ 12 بطاقة مع درج ميكانيكي منزلق ذكي.',
    tag: { text: 'الأعلى تقييماً', type: 'sale' },
    colors: ['#5B7282', '#1C2D37'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606503153255-59d5e417c4ed?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-6',
    title: 'قاعدة الشحن اللاسلكية السريعة 3 في 1',
    category: 'إلكترونيات وتكنولوجيا',
    categoryKey: 'electronics',
    price: 980,
    image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=500&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewsCount: 76,
    originCountry: 'الولايات المتحدة الأمريكية',
    description: 'منصة شحن مغناطيسية لاسلكية سريعة تسمح بشحن الهاتف، الساعة الذكية، وسماعات الأذن اللاسلكية في وقت واحد بذكاء وحماية ضد الحرارة الزائدة. مستوردة من أمريكا.',
    colors: ['#FFFFFF', '#1C2D37'],
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-7',
    title: 'مصباح المكتب الذكي مع شاحن لاسلكي وساعة',
    category: 'مكتب وبيئة العمل',
    categoryKey: 'office',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 114,
    originCountry: 'الولايات المتحدة الأمريكية',
    description: 'مصباح مكتب LED ذكي لحماية العينين، يوفر عدة مستويات سطوع وحرارة لونية مع شاشة لعرض الساعة والتاريخ ودرجة الحرارة بالإضافة لقاعدة شحن لاسلكي مدمجة للهواتف الذكية. مستورد من أمريكا.',
    tag: { text: 'وصل حديثاً', type: 'new' },
    colors: ['#FFFFFF'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'duck-tech-8',
    title: 'كوب القهوة الذكي الحافظ للحرارة باللمس',
    category: 'أسلوب حياة وغادجيتس',
    categoryKey: 'lifestyle',
    price: 650,
    oldPrice: 850,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 160,
    originCountry: 'المملكة المتحدة',
    description: 'كوب قهوة ذكي حراري من الستانلس ستيل المقاوم للصدأ ومزود بشاشة LED ذكية على الغطاء تظهر درجة حرارة المشروب الحالية بلمسة يد. يحفظ الحرارة حتى 12 ساعة. مستورد من لندن.',
    colors: ['#1C2D37', '#FFFFFF', '#236B93'],
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
    ]
  }
];
