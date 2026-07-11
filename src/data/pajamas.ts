export interface PajamaVariant {
  color: string;
  colorHex: string;
}

export interface Pajama {
  id: string;
  name: string;
  description: string;
  image: string;
  colors: PajamaVariant[];
  sizes: string[];
  badge?: string;
}

export const BUNDLE_PRICE = 399;
export const BUNDLE_ORIGINAL_PRICE = 699;
export const SHIPPING_PRICE = 0; // Free shipping
export const SHIPPING_LABEL = 'شحن مجاني';

export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
];

export const PAJAMAS: Pajama[] = [
  {
    id: 'pj-01',
    name: 'بجاما كلاسيك بيج',
    description: 'قطن فاخر 100% ناعم ومريح للنوم طوال الليل',
    image: '/pajama_beige.png',
    badge: 'الأكثر طلباً',
    colors: [
      { color: 'بيج', colorHex: '#C9B99A' },
      { color: 'كريمي', colorHex: '#F5ECD7' },
      { color: 'بني فاتح', colorHex: '#A08060' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'pj-02',
    name: 'بجاما نيفي بريميوم',
    description: 'ساتان ناعم بتصميم أنيق يجمع بين الراحة والأناقة',
    image: '/pajama_navy.png',
    badge: 'جديد',
    colors: [
      { color: 'كحلي', colorHex: '#1C2D4F' },
      { color: 'رمادي داكن', colorHex: '#3D3D3D' },
      { color: 'أزرق فيروزي', colorHex: '#236B93' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'pj-03',
    name: 'بجاما روز الفاخرة',
    description: 'تصميم عصري بألوان هادئة مثالية لكل المواسم',
    image: '/pajama_pink.png',
    colors: [
      { color: 'وردي فاتح', colorHex: '#E8A0B4' },
      { color: 'خوخي', colorHex: '#FFCBA4' },
      { color: 'ليلكي', colorHex: '#C8A2C8' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'pj-04',
    name: 'بجاما سيج الطبيعية',
    description: 'قطن عضوي بلون أخضر هادئ يوحي بالطبيعة والراحة',
    image: '/pajama_green.png',
    colors: [
      { color: 'أخضر حكيمي', colorHex: '#8FAF85' },
      { color: 'أخضر نعناع', colorHex: '#98D8C8' },
      { color: 'زيتي فاتح', colorHex: '#A9AF8A' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'pj-05',
    name: 'بجاما سوفت جراي',
    description: 'قماش ناعم جداً بتصميم بسيط ومريح لكل الأوقات',
    image: '/pajama_grey.png',
    colors: [
      { color: 'رمادي فاتح', colorHex: '#B8B8B8' },
      { color: 'رمادي متوسط', colorHex: '#888888' },
      { color: 'أبيض مكسر', colorHex: '#F0F0F0' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'pj-06',
    name: 'بجاما بوردو الفاخرة',
    description: 'ساتان فاخر بلون العنابي الغامق للمظهر المميز',
    image: '/pajama_burgundy.png',
    badge: 'محدود',
    colors: [
      { color: 'عنابي', colorHex: '#800020' },
      { color: 'خمري', colorHex: '#722F37' },
      { color: 'أحمر داكن', colorHex: '#8B0000' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
];
